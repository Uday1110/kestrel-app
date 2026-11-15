import { describe, it, expect, beforeAll } from "vitest";
import { executeAnalystDecision } from "@/services/application-service";
import { prisma } from "@/lib/prisma";
import { UserSession } from "@/types/domain";

describe("Server-Side Role Authorization & Governance Boundaries", () => {
  let testAppId: string;

  const rmUser: UserSession = {
    id: "usr_rm_naveen",
    email: "rm.sharma@corporate.kestrel.internal",
    name: "Naveen Sharma",
    role: "RM",
    title: "Relationship Manager",
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
    // Look up an existing test application or use APP-2026-0001
    const app = await prisma.application.findFirst({
      where: { referenceNumber: "APP-2026-0001" },
    });
    if (app) {
      testAppId = app.id;
    }
  });

  it("STRICT ROLE ENFORCEMENT: Rejects RM attempts to execute analyst underwriting decisions", async () => {
    // An RM user attempting to execute a credit decision MUST throw an unauthorized / forbidden error
    await expect(
      executeAnalystDecision({
        applicationId: testAppId,
        action: "RECOMMEND_SANCTION",
        notes: "Attempted RM override",
        currentUser: rmUser,
      })
    ).rejects.toThrow(/UNAUTHORIZED|Credit Analyst role required/i);
  });

  it("ANALYST PRIVILEGE: Allows authorized Credit Analyst to record review progress and decisions", async () => {
    const result = await executeAnalystDecision({
      applicationId: testAppId,
      action: "ACKNOWLEDGE",
      notes: "Audit verification of file completeness by Lead Analyst",
      currentUser: analystUser,
    });

    expect(result.success).toBe(true);
    expect(result.status).toBe("ACKNOWLEDGED");

    // Verify audit event was logged with analyst identity
    const auditEvent = await prisma.auditEvent.findFirst({
      where: {
        applicationId: testAppId,
        action: "ANALYST_DECISION_ACKNOWLEDGE",
      },
      orderBy: { timestamp: "desc" },
    });

    expect(auditEvent).toBeDefined();
    expect(auditEvent?.userId).toBe(analystUser.id);
    expect(auditEvent?.userRole).toBe("ANALYST");
  });
});
