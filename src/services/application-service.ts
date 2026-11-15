import { prisma } from "@/lib/prisma";
import { ApplicationStatus, UserRole, UserSession } from "@/types/domain";

export async function listApplications(options?: {
  role?: UserRole;
  userId?: string;
  statusFilter?: string;
  search?: string;
  facilityType?: string;
}) {
  const where: any = {};

  if (options?.search) {
    const s = options.search.trim();
    where.OR = [
      { referenceNumber: { contains: s } },
      { business: { legalName: { contains: s } } },
      { business: { cin: { contains: s } } },
    ];
  }

  if (options?.facilityType && options.facilityType !== "ALL") {
    where.facilityType = options.facilityType;
  }

  if (options?.statusFilter && options.statusFilter !== "ALL") {
    if (options.statusFilter === "PRIORITY") {
      where.status = { in: ["SUBMITTED", "UNDER_REVIEW", "DOCS_IN_PROGRESS"] };
    } else if (options.statusFilter === "ACTION_REQUIRED") {
      where.status = { in: ["INFO_REQUESTED", "DOCS_IN_PROGRESS"] };
    } else if (options.statusFilter === "COMPLETED") {
      where.status = { in: ["APPROVED", "REJECTED"] };
    } else {
      where.status = options.statusFilter;
    }
  }

  const applications = await prisma.application.findMany({
    where,
    include: {
      business: true,
      assignedRm: true,
      assignedAnalyst: true,
      checklistItems: true,
      documents: {
        where: { isArchived: false },
      },
      outstandingItems: {
        where: { status: "OPEN" },
      },
    },
    orderBy: {
      updatedAt: "desc",
    },
  });

  return applications;
}

export async function getApplicationById(idOrRef: string) {
  const application = await prisma.application.findFirst({
    where: {
      OR: [{ id: idOrRef }, { referenceNumber: idOrRef }],
    },
    include: {
      business: true,
      assignedRm: true,
      assignedAnalyst: true,
      checklistItems: {
        orderBy: { itemIndex: "asc" },
        include: { document: true },
      },
      documents: {
        where: { isArchived: false },
        orderBy: { uploadedAt: "desc" },
      },
      outstandingItems: {
        orderBy: [{ severity: "asc" }, { daysOutstanding: "desc" }],
        include: { requestedBy: true, resolvedBy: true, resolvedDocument: true },
      },
      financialExtractions: {
        orderBy: { createdAt: "asc" },
      },
      analystNotes: {
        orderBy: { createdAt: "desc" },
        include: { author: true },
      },
      statusHistory: {
        orderBy: { createdAt: "desc" },
      },
      auditEvents: {
        orderBy: { timestamp: "desc" },
        take: 20,
      },
    },
  });

  return application;
}

export async function createApplication(
  data: {
    legalName?: string;
    applicantName?: string;
    tradeName?: string;
    cin: string;
    pan: string;
    gstin?: string;
    incorporationDate?: string;
    annualTurnover?: number;
    industrySector?: string;
    registeredAddress?: string;
    city?: string;
    state?: string;
    pincode?: string;
    contactName?: string;
    contactPerson?: string;
    contactEmail?: string;
    contactPhone?: string;
    facilityType: string;
    facilityAmount: number;
    tenorMonths: number;
    purpose?: string;
    purposeOfLoan?: string;
    assignedAnalystId?: string;
    currentUser?: UserSession;
  },
  maybeCurrentUser?: UserSession
) {
  const currentUser = maybeCurrentUser || data.currentUser;
  if (!currentUser) {
    throw new Error("UNAUTHORIZED: Current user session is required to create application");
  }

  const legalName = data.legalName || data.applicantName || "Applicant Entity";
  const purpose = data.purpose || data.purposeOfLoan || "General Corporate Purpose";
  const gstin = data.gstin || `27${data.pan}1Z5`;
  const city = data.city || "Mumbai";
  const state = data.state || "Maharashtra";
  const pincode = data.pincode || "400001";
  const contactName = data.contactName || data.contactPerson || "Authorized Signatory";
  const contactEmail = data.contactEmail || "finance@corporate.example.com";
  const contactPhone = data.contactPhone || "+91 98200 00000";
  const industrySector = data.industrySector || "Diversified Corporate";
  const registeredAddress = data.registeredAddress || "Registered Office, India";
  const incorporationDate = data.incorporationDate || "2020-01-01";

  // 1. Find or create Business
  let business = await prisma.applicantBusiness.findFirst({
    where: { cin: data.cin },
  });

  if (!business) {
    business = await prisma.applicantBusiness.create({
      data: {
        legalName,
        tradeName: data.tradeName,
        cin: data.cin,
        pan: data.pan,
        gstin,
        incorporationDate,
        industrySector,
        registeredAddress,
        city,
        state,
        pincode,
        contactName,
        contactEmail,
        contactPhone,
      },
    });
  }

  // 2. Generate unique reference ID
  let refNum = `APP-2026-${Math.floor(1000 + Math.random() * 9000)}`;
  while (await prisma.application.findUnique({ where: { referenceNumber: refNum } })) {
    refNum = `APP-2026-${Math.floor(1000 + Math.random() * 9000)}`;
  }

  // 3. Create Application
  const application = await prisma.application.create({
    data: {
      referenceNumber: refNum,
      businessId: business.id,
      assignedRmId: currentUser.id,
      facilityType: data.facilityType,
      facilityAmount: data.facilityAmount,
      tenorMonths: data.tenorMonths,
      purpose,
      status: "DOCS_IN_PROGRESS",
      intakeStage: "GATE_1_RM_INTAKE",
      intakeReadinessPercent: 0,
    },
  });

  // 4. Populate default standard 8 checklist items
  const defaultItems = [
    {
      itemIndex: 1,
      category: "FINANCIAL_STATEMENTS",
      title: "Audited Financials (Last 2 Years)",
      specification: "Balance Sheet, P&L, Auditor Notes with UDIN stamp",
    },
    {
      itemIndex: 2,
      category: "BANKING",
      title: "Bank Statements (Last 12 Months)",
      specification: "Primary Operative Current Accounts e-stamped & parsed",
    },
    {
      itemIndex: 3,
      category: "REGULATORY_TAX",
      title: "GST Returns (Last 12 Months)",
      specification: "GSTR-3B & GSTR-1 matching batch receipts",
    },
    {
      itemIndex: 4,
      category: "REGULATORY_TAX",
      title: "Income Tax Returns & Computation (Last 2 AY)",
      specification: "ITR-6 with tax audit report 3CA/3CD",
    },
    {
      itemIndex: 5,
      category: "LEGAL_CONSTITUTIONAL",
      title: "Board Resolution & Borrowing Power Authorization",
      specification: "Certified True Copy under Section 179/180(1)(c)",
    },
    {
      itemIndex: 6,
      category: "LEGAL_CONSTITUTIONAL",
      title: "Promoter & Director KYC Dossier",
      specification: "PAN, Aadhaar, DIN registry, and C-KYC verification",
    },
    {
      itemIndex: 7,
      category: "FINANCIAL_STATEMENTS",
      title: "Pro-forma Invoices / Machinery Quotations",
      specification: "Original vendor quotation for facility capital expenditure",
    },
    {
      itemIndex: 8,
      category: "SANCTION_LETTERS",
      title: "Existing Credit Facility Sanction Letters",
      specification: "All current banking arrangements & NOC copies",
    },
  ];

  for (const item of defaultItems) {
    await prisma.checklistItem.create({
      data: {
        applicationId: application.id,
        ...item,
        status: "MISSING",
      },
    });
  }

  // 5. Initial Audit Log & Status History
  await prisma.applicationStatusHistory.create({
    data: {
      applicationId: application.id,
      fromStatus: null,
      toStatus: "DOCS_IN_PROGRESS",
      changedByUserId: currentUser.id,
      changedByRole: currentUser.role,
      note: "Application initiated via RM intake gateway",
    },
  });

  await prisma.auditEvent.create({
    data: {
      applicationId: application.id,
      userId: currentUser.id,
      userRole: currentUser.role,
      action: "APPLICATION_CREATED",
      summary: `Created application ${refNum} for ${data.legalName} (${data.facilityType}, ₹ ${data.facilityAmount})`,
    },
  });

  const complete = await getApplicationById(application.id);
  return complete || application;
}

export async function updateApplicationStatus(
  applicationId: string,
  newStatus: ApplicationStatus,
  user: UserSession,
  note?: string
) {
  const current = await prisma.application.findUnique({
    where: { id: applicationId },
  });

  if (!current) {
    throw new Error(`Application not found: ${applicationId}`);
  }

  // Governance check: RM cannot approve or reject applications!
  if (user.role === "RM" && (newStatus === "APPROVED" || newStatus === "REJECTED" || newStatus === "ACKNOWLEDGED")) {
    throw new Error("GOVERNANCE RESTRICTION: Only an authorized Credit Analyst may commit underwriting review decisions.");
  }

  let stage = current.intakeStage;
  if (newStatus === "SUBMITTED") {
    stage = "GATE_4_UNDERWRITING_DESK";
  } else if (newStatus === "INFO_REQUESTED") {
    stage = "GATE_3_BORROWER_CHASING";
  } else if (newStatus === "APPROVED") {
    stage = "GATE_5_SANCTION_COMMITTEE";
  }

  const updated = await prisma.application.update({
    where: { id: applicationId },
    data: {
      status: newStatus,
      intakeStage: stage,
      submittedAt: newStatus === "SUBMITTED" && !current.submittedAt ? new Date() : current.submittedAt,
      finalDecisionAt: newStatus === "APPROVED" || newStatus === "REJECTED" ? new Date() : current.finalDecisionAt,
      finalDecision: newStatus === "APPROVED" ? "APPROVED" : newStatus === "REJECTED" ? "REJECTED" : current.finalDecision,
      decisionReason: note || current.decisionReason,
    },
  });

  await prisma.applicationStatusHistory.create({
    data: {
      applicationId,
      fromStatus: current.status,
      toStatus: newStatus,
      changedByUserId: user.id,
      changedByRole: user.role,
      note: note || `Status transitioned to ${newStatus}`,
    },
  });

  await prisma.auditEvent.create({
    data: {
      applicationId,
      userId: user.id,
      userRole: user.role,
      action: "STATUS_CHANGED",
      summary: `Application status changed from ${current.status} to ${newStatus} by ${user.name} (${user.role}). ${note ? "Note: " + note : ""}`,
    },
  });

  return updated;
}

export async function recalculateReadiness(applicationId: string) {
  const items = await prisma.checklistItem.findMany({
    where: { applicationId },
  });

  if (items.length === 0) return 0;

  const clearedCount = items.filter((i) => i.status === "CLEARED" || i.status === "WAIVED").length;
  const pct = Math.round((clearedCount / items.length) * 100);

  await prisma.application.update({
    where: { id: applicationId },
    data: { intakeReadinessPercent: pct },
  });

  return pct;
}

export async function executeAnalystDecision({
  applicationId,
  action,
  notes,
  currentUser,
}: {
  applicationId: string;
  action: "ACKNOWLEDGE" | "REQUEST_DOCUMENTS" | "RECOMMEND_SANCTION" | "REJECT";
  notes: string;
  currentUser: UserSession;
}) {
  if (currentUser.role !== "ANALYST" && currentUser.role !== "ADMIN") {
    throw new Error("UNAUTHORIZED: Credit Analyst role required to execute underwriting decisions");
  }

  let targetStatus: ApplicationStatus = "UNDER_REVIEW";
  if (action === "ACKNOWLEDGE") targetStatus = "ACKNOWLEDGED";
  else if (action === "REQUEST_DOCUMENTS") targetStatus = "INFO_REQUESTED";
  else if (action === "RECOMMEND_SANCTION") targetStatus = "APPROVED";
  else if (action === "REJECT") targetStatus = "REJECTED";

  const updated = await updateApplicationStatus(applicationId, targetStatus, currentUser, notes);

  await prisma.auditEvent.create({
    data: {
      applicationId,
      userId: currentUser.id,
      userRole: currentUser.role,
      action: `ANALYST_DECISION_${action}`,
      summary: `Underwriting Decision: ${action}. Notes: ${notes}`,
    },
  });

  return { success: true, status: updated.status, application: updated };
}

export async function submitApplication(
  applicationId: string,
  currentUser: UserSession,
  waiverReason?: string
) {
  const updated = await updateApplicationStatus(
    applicationId,
    "SUBMITTED",
    currentUser,
    waiverReason || "Application submitted for underwriting triage"
  );

  await prisma.auditEvent.create({
    data: {
      applicationId,
      userId: currentUser.id,
      userRole: currentUser.role,
      action: "STATUS_TRANSITION_SUBMITTED",
      summary: `Application submitted by RM ${currentUser.name}. ${waiverReason ? "Waiver Note: " + waiverReason : ""}`,
    },
  });

  return updated;
}

export async function updateChecklistStatus({
  checklistItemId,
  status,
  flagReason,
  currentUser,
}: {
  checklistItemId: string;
  status: "CLEARED" | "ATTENTION" | "MISSING" | "WAIVED";
  flagReason?: string | null;
  currentUser: UserSession;
}) {
  const item = await prisma.checklistItem.findUnique({
    where: { id: checklistItemId },
  });

  if (!item) throw new Error("Checklist item not found");

  const updated = await prisma.checklistItem.update({
    where: { id: checklistItemId },
    data: {
      status,
      flagReason: flagReason !== undefined ? flagReason : item.flagReason,
      verifiedAt: status === "CLEARED" ? new Date() : null,
      verifiedByUserId: status === "CLEARED" ? currentUser.id : null,
    },
  });

  await recalculateReadiness(item.applicationId);

  return updated;
}

