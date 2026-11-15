import { prisma } from "@/lib/prisma";
import { DashboardMetrics, UserRole } from "@/types/domain";

export async function getDashboardMetrics(role: UserRole): Promise<DashboardMetrics> {
  const applications = await prisma.application.findMany({
    include: {
      checklistItems: true,
      documents: { where: { isArchived: false } },
      outstandingItems: { where: { status: "OPEN" } },
    },
  });

  const total = applications.length;
  const inReview = applications.filter(
    (a) => a.status === "SUBMITTED" || a.status === "UNDER_REVIEW" || a.status === "ACKNOWLEDGED"
  ).length;
  const inProgress = applications.filter((a) => a.status === "DOCS_IN_PROGRESS").length;
  const actionRequired = applications.filter((a) => a.status === "INFO_REQUESTED").length;
  const approved = applications.filter((a) => a.status === "APPROVED").length;

  const totalActiveExposure = applications
    .filter((a) => a.status !== "REJECTED")
    .reduce((sum, a) => sum + a.facilityAmount, 0);

  // Calculate clean checksum rate
  const allDocs = await prisma.document.findMany({ where: { isArchived: false } });
  const cleanDocs = allDocs.filter((d) => d.validationStatus === "VALIDATED").length;
  const integrityPct = allDocs.length > 0 ? Number(((cleanDocs / allDocs.length) * 100).toFixed(1)) : 98.4;

  // Stages matching Stitch designs
  const stages = [
    {
      stageNumber: 1,
      id: "GATE_1_RM_INTAKE" as const,
      name: "1. RM Intake",
      owner: "Relationship Manager (RM)",
      days: 4.5,
      pct: 25.0,
      targetSlaDays: 3.5,
      varianceDays: 1.0,
      varianceLabel: "+1.0d Variance",
      description: "Front-office borrower dossier capture, initial checklist assembly, KYC collation",
      colorClass: "bg-secondary",
    },
    {
      stageNumber: 2,
      id: "GATE_2_AI_CHECKSUM" as const,
      name: "2. AI Checksum",
      owner: "Automated Verification Engine",
      days: 0.5,
      pct: 2.8,
      targetSlaDays: 0.5,
      varianceDays: 0.0,
      varianceLabel: "Zero Friction (On SLA)",
      description: "OCR ingestion, SHA-256 duplicate cross-check, statutory MCA21 syntax verification",
      colorClass: "bg-primary-container",
    },
    {
      stageNumber: 3,
      id: "GATE_3_BORROWER_CHASING" as const,
      name: "3. Borrower Chasing",
      owner: "Origination Desk & Borrower",
      days: 3.0,
      pct: 16.7,
      targetSlaDays: 2.0,
      varianceDays: 1.0,
      varianceLabel: "+1.0d Variance",
      description: "Discrepancy clarifications, replacement files for duplicate/blurry uploads",
      colorClass: "bg-tertiary-fixed-dim",
    },
    {
      stageNumber: 4,
      id: "GATE_4_UNDERWRITING_DESK" as const,
      name: "4. Credit Desk UW",
      owner: "Lead Credit Analyst",
      days: 7.0,
      pct: 38.9,
      targetSlaDays: 6.0,
      varianceDays: 1.0,
      varianceLabel: "+1.0d Variance",
      description: "Financial model spreads, debt service capacity modeling, field citation cross-examination",
      colorClass: "bg-error",
    },
    {
      stageNumber: 5,
      id: "GATE_5_SANCTION_COMMITTEE" as const,
      name: "5. Committee Sanction",
      owner: "Designated Underwriting Director",
      days: 3.0,
      pct: 16.6,
      targetSlaDays: 3.0,
      varianceDays: 0.0,
      varianceLabel: "On SLA",
      description: "Credit committee quorum review, statutory sign-off, facility memorandum commit",
      colorClass: "bg-secondary-fixed",
    },
  ];

  const aggregateCycleDays = stages.reduce((acc, s) => acc + s.days, 0);

  return {
    aggregateCycleDays,
    preKestrelBaselineDays: 20.8,
    targetSlaDays: 15.0,
    intakeIntegrityPct: integrityPct,
    activePipelineValueCr: Number((totalActiveExposure / 10000000).toFixed(2)),
    underReviewCount: inReview,
    stages,
    queueCounts: {
      total,
      readyForReview: inReview,
      actionRequired,
      inProgress,
      approved,
    },
  };
}
