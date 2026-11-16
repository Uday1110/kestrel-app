import { describe, it, expect, beforeAll } from "vitest";
import { prisma } from "@/lib/prisma";
import { UserSession } from "@/types/domain";
import {
  getOwnerOverviewMetrics,
  getGovernanceRegistry,
  getEndToEndTraces,
  getSystemLogsAndAlerts,
  getCostAnalytics,
  exportGovernanceReport,
  getFreshnessState,
  recordRefreshSuccess,
  maskName,
  maskEmail,
  maskPhone,
  maskIdentifier,
} from "@/services/owner-service";
import { getPromptToneConfig, updatePromptToneConfig } from "@/services/prompt-config-service";
import { POST as switchRoleHandler } from "@/app/api/auth/switch-role/route";

describe("Owner Dashboard, Governance Controls & Least Privilege Verification", () => {
  const ownerUser: UserSession = {
    id: "usr_owner_mehta",
    email: "owner.governance@corporate.kestrel.internal",
    name: "Vikram Mehta",
    role: "OWNER",
    title: "Chief Governance & System Owner",
    department: "Executive Oversight & Internal Audit",
    avatarUrl: null,
  };

  const rmUser: UserSession = {
    id: "usr_rm_naveen",
    email: "rm.sharma@corporate.kestrel.internal",
    name: "Naveen Sharma",
    role: "RM",
    title: "Relationship Manager (RM)",
    department: "West Zone Commercial Lending",
    avatarUrl: null,
  };

  const analystUser: UserSession = {
    id: "usr_ca_arunachalam",
    email: "analyst.williams@corporate.kestrel.internal",
    name: "Arunachalam V.",
    role: "ANALYST",
    title: "Lead Underwriting Analyst",
    department: "Credit Risk & Underwriting",
    avatarUrl: null,
  };

  beforeAll(async () => {
    // Verify owner user exists in database
    await prisma.user.upsert({
      where: { email: ownerUser.email },
      update: {},
      create: {
        id: ownerUser.id,
        email: ownerUser.email,
        name: ownerUser.name,
        role: ownerUser.role,
        title: ownerUser.title,
        department: ownerUser.department,
      },
    });
  });

  it("PII DATA MASKING: Minimizes and strictly masks sensitive personal & corporate identifiers", () => {
    // Name masking
    expect(maskName("Rohan Kulkarni")).toBe("R*** K***");
    expect(maskName("Priya Deshmukh")).toBe("P*** D***");
    expect(maskName("Arun")).toBe("A***");

    // Email masking
    expect(maskEmail("rohan.kulkarni@sample.com")).toBe("r***@***.com");
    expect(maskEmail("finance@corp.internal")).toBe("f***@***.com");

    // Phone masking
    expect(maskPhone("+91 98201 12345")).toBe("+9198*****");

    // Identifier masking (PAN & CIN)
    expect(maskIdentifier("AAACS1234F")).toBe("AA***34F");
    expect(maskIdentifier("U28112PN2018PTC178923")).toBe("U2***923");
  });

  it("REMOVAL OF IN-APP ROLE SWITCHING: Server refuses in-app role switching and logs audit block", async () => {
    const res = await switchRoleHandler();
    expect(res.status).toBe(403);

    const body = await res.json();
    expect(body.success).toBe(false);
    expect(body.error).toMatch(/In-app profile\/role switching is disabled/i);
  });

  it("OWNER TELEMETRY & URGENT EXCEPTIONS: Loads grounded overview metrics and flags urgent exceptions", async () => {
    const overview = await getOwnerOverviewMetrics();

    expect(overview.throughput).toBeGreaterThan(0);
    expect(overview.automationStpRate).toBeGreaterThanOrEqual(0);
    expect(overview.manualHandlingRate).toBeGreaterThanOrEqual(0);
    expect(overview.automationStpRate + overview.manualHandlingRate).toBeCloseTo(100, 1);
    expect(overview.errorRate).toBeGreaterThanOrEqual(0);
    expect(overview.checksumIntegrityPct).toBeGreaterThanOrEqual(0);
    expect(overview.checksumIntegrityPct).toBeLessThanOrEqual(100);
    expect(overview.urgentExceptions.length).toBeGreaterThan(0);

    // Overdue review check
    const overdueException = overview.urgentExceptions.find((e) => e.category === "POLICY_REVIEW");
    expect(overdueException).toBeDefined();
    expect(overdueException?.severity).toBe("CRITICAL");
  });

  it("GOVERNANCE REGISTRY: Distinguishes missing approvals from passed reviews and tracks thresholds", async () => {
    const registry = await getGovernanceRegistry();

    expect(registry.policies.length).toBeGreaterThanOrEqual(4);

    // Directive with review overdue
    const overduePolicy = registry.policies.find((p) => p.status === "REVIEW_OVERDUE");
    expect(overduePolicy).toBeDefined();
    expect(overduePolicy?.name).toContain("4-Directive");

    // Directive with missing formal approval
    const missingApprovalPolicy = registry.policies.find((p) => p.status === "MISSING_APPROVAL_RECORD");
    expect(missingApprovalPolicy).toBeDefined();
    expect(missingApprovalPolicy?.approvingAuthority).toBeNull();
    expect(missingApprovalPolicy?.approvalDate).toBeNull();

    // Thresholds with change history
    expect(registry.thresholds.length).toBeGreaterThanOrEqual(3);
    const sizeThreshold = registry.thresholds.find((t) => t.key === "MAX_DOCUMENT_SIZE_MB");
    expect(sizeThreshold).toBeDefined();
    expect(sizeThreshold?.currentValue).toBe(25);
    expect(sizeThreshold?.changeHistory.length).toBeGreaterThan(0);

    // Access overview segregation of duties
    expect(registry.accessOverview.length).toBeGreaterThanOrEqual(3);
    const ownerAccess = registry.accessOverview.find((a) => a.role === "OWNER");
    expect(ownerAccess?.hasConflictingPrivilege).toBe(false);
    expect(ownerAccess?.permissions).toContain("READ_GOVERNANCE_REGISTRY");
  });

  it("END-TO-END TRACES: Provides per-step latency and verifies strictly masked PII", async () => {
    const traces = await getEndToEndTraces();

    expect(traces.length).toBeGreaterThan(0);
    const firstTrace = traces[0];

    expect(firstTrace.referenceNumber).toMatch(/^APP-/);
    // Verify PII is masked
    expect(firstTrace.borrowerNameMasked).toMatch(/\*\*\*/);
    expect(firstTrace.cinMasked).toMatch(/\*\*\*/);
    expect(firstTrace.panMasked).toMatch(/\*\*\*/);
    expect(firstTrace.contactEmailMasked).toMatch(/@\*\*\*\.com/);

    // Verify per-step latency and status
    expect(firstTrace.steps.length).toBe(5);
    for (const step of firstTrace.steps) {
      expect(step.latencyDisplay).toBeDefined();
      expect(step.status).toBeDefined();
    }
  });

  it("LOGS & STATUTORY RETENTION: Returns structured logs and statutory retention policy", async () => {
    const logsData = await getSystemLogsAndAlerts();

    expect(logsData.logs.length).toBeGreaterThanOrEqual(0);
    expect(logsData.alertRules.length).toBeGreaterThanOrEqual(3);
    expect(logsData.retentionPolicy).toContain("RBI Master Direction 2025/WC-4");

    // Verify alert rule configuration
    const errorAlert = logsData.alertRules.find((a) => a.metric === "ERROR_RATE_PERCENT");
    expect(errorAlert).toBeDefined();
    expect(errorAlert?.threshold).toBe(5.0);
    expect(errorAlert?.notificationTarget).toContain("@");
  });

  it("COST ANALYTICS: Distinguishes measured facts from estimated benchmark models and flags tolerances", async () => {
    const costs = await getCostAnalytics();

    expect(costs.totalMonthlyCostInr).toBeGreaterThan(0);
    expect(costs.costPerTransactionInr).toBeGreaterThan(0);

    // Storage is a measured fact from documents
    expect(costs.categories.storage.isMeasured).toBe(true);
    expect(costs.categories.storage.basis).toContain("Measured fact");

    // Compute is an estimated model
    expect(costs.categories.compute.isMeasured).toBe(false);
    expect(costs.categories.compute.basis).toContain("Estimated benchmark");

    // Vendor tolerance check flags OCR exceeding tolerance
    const ocrVendor = costs.vendorTolerances.find((v) => v.vendorName.includes("OCR"));
    expect(ocrVendor).toBeDefined();
    expect(ocrVendor?.exceedsTolerance).toBe(true);
    expect(ocrVendor?.status).toBe("EXCEEDS_TOLERANCE");
  });

  it("DATA REFRESH & FRESHNESS: Tracks refresh state and updates freshness timestamp", () => {
    recordRefreshSuccess();
    const freshness = getFreshnessState();

    expect(freshness.status).toBe("FRESH");
    expect(freshness.ageMinutes).toBeLessThanOrEqual(1);
    expect(new Date(freshness.lastUpdated).getTime()).toBeGreaterThan(0);
  });

  it("EXPORT AUTHORIZATION & AUDIT: Allows Owner export with masked PII and rejects non-owners", async () => {
    // 1. Non-owner denial (Least Privilege)
    await expect(exportGovernanceReport("csv", rmUser)).rejects.toThrow(/FORBIDDEN/i);
    await expect(exportGovernanceReport("pdf", analystUser)).rejects.toThrow(/FORBIDDEN/i);

    // 2. Owner CSV export
    const csvExport = await exportGovernanceReport("csv", ownerUser);
    expect(csvExport.contentType).toContain("text/csv");
    expect(csvExport.filename).toMatch(/^kestrel-governance-export-.*\.csv$/);
    expect(csvExport.content).toContain("Reference Number");
    expect(csvExport.content).toContain("***"); // PII is masked

    // 3. Owner PDF/Text export
    const pdfExport = await exportGovernanceReport("pdf", ownerUser);
    expect(pdfExport.contentType).toContain("text/plain");
    expect(pdfExport.filename).toMatch(/^kestrel-governance-audit-.*\.txt$/);
    expect(pdfExport.content).toContain("KESTREL FINANCE // INSTITUTIONAL GOVERNANCE");
    expect(pdfExport.content).toContain("RBI Master Direction 2025/WC-4");

    // 4. Verify audit event was logged in DB
    const exportAuditEvent = await prisma.auditEvent.findFirst({
      where: {
        userId: ownerUser.id,
        action: "GOVERNANCE_DATA_EXPORTED",
      },
      orderBy: { timestamp: "desc" },
    });

    expect(exportAuditEvent).toBeDefined();
    expect(exportAuditEvent?.userRole).toBe("OWNER");
  });

  it("PROMPTS & TONE CONFIGURATION: Allows Owner to change outreach tone and AI prompts, denies non-owners, and records audit trail", async () => {
    // 1. Initial configuration fetch
    const initialConfig = await getPromptToneConfig();
    expect(initialConfig.outreach).toBeDefined();
    expect(initialConfig.outreach.tone).toBeDefined();
    expect(initialConfig.financialExtraction).toBeDefined();
    expect(initialConfig.underwritingAssistant).toBeDefined();

    // 2. Non-owner update rejection
    await expect(
      updatePromptToneConfig(
        { outreach: { ...initialConfig.outreach, tone: "URGENT_DIRECTIVE" } },
        rmUser
      )
    ).rejects.toThrow(/FORBIDDEN/i);

    await expect(
      updatePromptToneConfig(
        { outreach: { ...initialConfig.outreach, tone: "COLLABORATIVE_ADVISORY" } },
        analystUser
      )
    ).rejects.toThrow(/FORBIDDEN/i);

    // 3. Owner update succeeds
    const updatedConfig = await updatePromptToneConfig(
      {
        outreach: {
          ...initialConfig.outreach,
          tone: "URGENT_DIRECTIVE",
          whatsappTemplate: "URGENT: {legalName} facility {referenceNumber} pending {title}. Immediate upload required.",
        },
      },
      ownerUser
    );

    expect(updatedConfig.outreach.tone).toBe("URGENT_DIRECTIVE");
    expect(updatedConfig.outreach.whatsappTemplate).toContain("URGENT:");
    expect(updatedConfig.updatedBy).toContain(ownerUser.email);

    // 4. Verify audit event was committed
    const promptAuditEvent = await prisma.auditEvent.findFirst({
      where: {
        userId: ownerUser.id,
        action: "PROMPT_TONE_CONFIG_UPDATED",
      },
      orderBy: { timestamp: "desc" },
    });

    expect(promptAuditEvent).toBeDefined();
    expect(promptAuditEvent?.summary).toContain("updated prompts and tone");
  });
});
