import { prisma } from "@/lib/prisma";
import { ExtractionStatus, UserSession } from "@/types/domain";

export async function getFinancialExtractions(applicationId: string) {
  const extractions = await prisma.financialExtraction.findMany({
    where: { applicationId },
    orderBy: { createdAt: "asc" },
  });

  // Calculate arithmetic summaries strictly without automated decisions
  let totalRevenue = 0;
  let ebitda = 0;
  let bankBalance = 0;
  let totalDebt = 0;

  extractions.forEach((e) => {
    if (e.metricKey === "TOTAL_REVENUE" && e.numericValue) totalRevenue = e.numericValue;
    if (e.metricKey === "OPERATING_EBITDA" && e.numericValue) ebitda = e.numericValue;
    if (e.metricKey === "CLOSING_BANK_BALANCE" && e.numericValue) bankBalance = e.numericValue;
    if (e.metricKey === "TOTAL_DEBT" && e.numericValue) totalDebt = e.numericValue;
  });

  const ebitdaMarginPct = totalRevenue > 0 ? Number(((ebitda / totalRevenue) * 100).toFixed(2)) : null;
  const debtToEbitda = ebitda > 0 ? Number((totalDebt / ebitda).toFixed(2)) : null;

  return {
    extractions,
    arithmeticSummary: {
      totalRevenue,
      ebitda,
      ebitdaMarginPct,
      bankBalance,
      totalDebt,
      debtToEbitda,
    },
  };
}

export async function updateExtractionStatus(
  extractionId: string,
  status: ExtractionStatus,
  currentUser: UserSession,
  editedValue?: string | null,
  analystComment?: string | null
) {
  const ext = await prisma.financialExtraction.findUnique({
    where: { id: extractionId },
    include: { application: true },
  });

  if (!ext) throw new Error("Financial extraction not found");

  const updated = await prisma.financialExtraction.update({
    where: { id: extractionId },
    data: {
      status,
      editedValue: editedValue !== undefined ? editedValue : ext.editedValue,
      analystComment: analystComment !== undefined ? analystComment : ext.analystComment,
      reconciledByUserId: currentUser.id,
      reconciledAt: new Date(),
    },
  });

  await prisma.auditEvent.create({
    data: {
      applicationId: ext.applicationId,
      userId: currentUser.id,
      userRole: currentUser.role,
      action: `EXTRACTION_${status}`,
      summary: `Extraction ${ext.label} marked ${status} by ${currentUser.name}. ${editedValue ? "Edited Value: " + editedValue : ""} ${analystComment ? "Comment: " + analystComment : ""}`,
    },
  });

  return updated;
}

export async function getFinancialSummary(applicationId: string) {
  const result = await getFinancialExtractions(applicationId);
  return {
    extractions: result.extractions,
    arithmeticMetrics: result.arithmeticSummary,
    governanceDisclaimer: "Factual arithmetic collation only. Human Credit Analyst holds exclusive authority for risk assessment and underwriting decisions. No automated credit decision, rating, or sanction is performed by this system.",
  };
}

export async function updateExtractionValue({
  id,
  parsedValue,
  status,
  comment,
  currentUser,
}: {
  id: string;
  parsedValue?: string;
  status: ExtractionStatus;
  comment?: string;
  currentUser: UserSession;
}) {
  const ext = await prisma.financialExtraction.findUnique({
    where: { id },
  });
  if (!ext) throw new Error("Extraction not found");

  const updated = await prisma.financialExtraction.update({
    where: { id },
    data: {
      status,
      editedValue: parsedValue ?? ext.editedValue,
      analystComment: comment ?? ext.analystComment,
      reconciledByUserId: currentUser.id,
      reconciledAt: new Date(),
    },
  });

  await prisma.auditEvent.create({
    data: {
      applicationId: ext.applicationId,
      userId: currentUser.id,
      userRole: currentUser.role,
      action: "EXTRACTION_VALUE_UPDATED",
      summary: `Extraction ${ext.label} updated to ${parsedValue || ext.editedValue || ext.extractedValue} (${status}) by ${currentUser.name}. ${comment ? "Comment: " + comment : ""}`,
    },
  });

  return updated;
}

