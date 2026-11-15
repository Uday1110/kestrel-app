import { describe, it, expect, beforeAll } from "vitest";
import { getFinancialSummary, updateExtractionValue } from "@/services/financial-service";
import { prisma } from "@/lib/prisma";
import { UserSession } from "@/types/domain";

describe("Governance Boundary & Financial Preparation Assistant", () => {
  const analystUser: UserSession = {
    id: "usr_ca_arunachalam",
    email: "analyst.williams@corporate.kestrel.internal",
    name: "Arunachalam V.",
    role: "ANALYST",
    title: "Lead Underwriting Analyst",
    department: "Credit Risk & Underwriting",
    avatarUrl: null,
  };

  let testAppId: string;

  beforeAll(async () => {
    const app = await prisma.application.findFirst({
      where: { referenceNumber: "APP-2026-0001" },
    });
    if (app) testAppId = app.id;
  });

  it("PROVIDES purely factual arithmetic summaries without automated ratings", async () => {
    const summary = await getFinancialSummary(testAppId);

    expect(summary).toBeDefined();
    expect(summary.arithmeticMetrics).toBeDefined();
    expect(summary.governanceDisclaimer).toContain("Human Credit Analyst");
    expect(summary.governanceDisclaimer).toContain("No automated credit decision");

    // Must NOT contain any automated credit score or automated approval
    expect((summary as any).creditScore).toBeUndefined();
    expect((summary as any).riskGrade).toBeUndefined();
    expect((summary as any).autoDecision).toBeUndefined();
  });

  it("ALLOWS human analyst to edit and audit extracted financial values", async () => {
    const extraction = await prisma.financialExtraction.findFirst({
      where: { applicationId: testAppId },
    });

    if (extraction) {
      const updated = await updateExtractionValue({
        id: extraction.id,
        parsedValue: "₹ 19.50 Cr",
        status: "EDITED",
        comment: "Analyst verified against Schedule III Note 18",
        currentUser: analystUser,
      });

      expect(updated.status).toBe("EDITED");
      expect(updated.editedValue).toBe("₹ 19.50 Cr");

      // Check audit event
      const audit = await prisma.auditEvent.findFirst({
        where: {
          applicationId: testAppId,
          action: "EXTRACTION_VALUE_UPDATED",
        },
        orderBy: { timestamp: "desc" },
      });

      expect(audit).toBeDefined();
      expect(audit?.userId).toBe(analystUser.id);
    }
  });
});
