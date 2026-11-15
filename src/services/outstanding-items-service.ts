import { prisma } from "@/lib/prisma";
import { OutreachChannel, OutstandingItemSeverity, UserSession } from "@/types/domain";

export async function listOutstandingItems(options?: {
  applicationId?: string;
  severity?: OutstandingItemSeverity;
  filter?: "all" | "critical" | "missing";
  search?: string;
}) {
  const where: any = {
    status: "OPEN",
  };

  if (options?.applicationId) {
    where.applicationId = options.applicationId;
  }

  if (options?.filter === "critical") {
    where.OR = [
      { severity: "CRITICAL" },
      { daysOutstanding: { gte: 10 } },
    ];
  }

  if (options?.search) {
    const s = options.search.trim().toLowerCase();
    where.OR = [
      { title: { contains: s } },
      { description: { contains: s } },
      { application: { referenceNumber: { contains: s } } },
      { application: { business: { legalName: { contains: s } } } },
    ];
  }

  const items = await prisma.outstandingItem.findMany({
    where,
    include: {
      application: {
        include: { business: true },
      },
      requestedBy: true,
      resolvedBy: true,
      resolvedDocument: true,
    },
    orderBy: [{ daysOutstanding: "desc" }, { createdAt: "desc" }],
  });

  return items;
}

export async function createOutstandingItem(
  data: {
    applicationId: string;
    title: string;
    description: string;
    category?: string;
    severity?: OutstandingItemSeverity;
    lastContactedChannel?: OutreachChannel;
    daysOutstanding?: number;
  },
  currentUser: UserSession
) {
  const item = await prisma.outstandingItem.create({
    data: {
      applicationId: data.applicationId,
      title: data.title,
      description: data.description,
      category: data.category || "DOCUMENTATION",
      severity: data.severity || "STANDARD",
      status: "OPEN",
      daysOutstanding: data.daysOutstanding || 0,
      requestedByUserId: currentUser.id,
      lastContactedChannel: data.lastContactedChannel || "EMAIL",
      lastContactedAt: new Date(),
    },
    include: { application: true },
  });

  // If application was in DOCS_IN_PROGRESS or SUBMITTED, update to INFO_REQUESTED if appropriate
  await prisma.application.update({
    where: { id: data.applicationId },
    data: {
      status: "INFO_REQUESTED",
      intakeStage: "GATE_3_BORROWER_CHASING",
    },
  });

  await prisma.auditEvent.create({
    data: {
      applicationId: data.applicationId,
      userId: currentUser.id,
      userRole: currentUser.role,
      action: "OUTSTANDING_ITEM_CREATED",
      summary: `Created outstanding item "${data.title}" (Severity: ${data.severity || "STANDARD"}) by ${currentUser.name}`,
    },
  });

  return item;
}

export async function dispatchBorrowerChase(
  itemId: string,
  channel: OutreachChannel,
  customNote: string,
  currentUser: UserSession
) {
  const item = await prisma.outstandingItem.findUnique({
    where: { id: itemId },
    include: { application: { include: { business: true } } },
  });

  if (!item) throw new Error("Outstanding item not found");

  const updated = await prisma.outstandingItem.update({
    where: { id: itemId },
    data: {
      lastContactedChannel: channel,
      lastContactedAt: new Date(),
    },
  });

  await prisma.auditEvent.create({
    data: {
      applicationId: item.applicationId,
      userId: currentUser.id,
      userRole: currentUser.role,
      action: "BORROWER_CHASE_DISPATCHED",
      summary: `Dispatched ${channel} chase to ${item.application.business.contactName} (${item.application.business.legalName}) for "${item.title}". Note: ${customNote || "Automated reminder link"}`,
    },
  });

  return updated;
}

export async function batchAutomatedPing(currentUser: UserSession) {
  const openItems = await prisma.outstandingItem.findMany({
    where: { status: "OPEN" },
    include: { application: { include: { business: true } } },
  });

  const now = new Date();
  await prisma.outstandingItem.updateMany({
    where: { status: "OPEN" },
    data: {
      lastContactedAt: now,
    },
  });

  await prisma.auditEvent.create({
    data: {
      userId: currentUser.id,
      userRole: currentUser.role,
      action: "BATCH_PING_TRANSMITTED",
      summary: `Transmitted multi-channel automated pings across ${openItems.length} pending borrower files.`,
    },
  });

  return { pingedCount: openItems.length };
}

export async function resolveOutstandingItem(
  arg1: string | { id: string; resolutionNote: string; documentId?: string | null; currentUser: UserSession },
  arg2?: string,
  arg3?: string | null,
  arg4?: UserSession
) {
  let itemId: string;
  let resolutionNote: string;
  let documentId: string | null | undefined;
  let currentUser: UserSession;

  if (typeof arg1 === "object") {
    itemId = arg1.id;
    resolutionNote = arg1.resolutionNote;
    documentId = arg1.documentId;
    currentUser = arg1.currentUser;
  } else {
    itemId = arg1;
    resolutionNote = arg2!;
    documentId = arg3;
    currentUser = arg4!;
  }

  const item = await prisma.outstandingItem.findUnique({
    where: { id: itemId },
  });

  if (!item) throw new Error("Item not found");

  const updated = await prisma.outstandingItem.update({
    where: { id: itemId },
    data: {
      status: "RESOLVED",
      resolutionNote,
      resolvedByUserId: currentUser.id,
      resolvedAt: new Date(),
      resolvedDocumentId: documentId || null,
    },
  });

  // Check if all outstanding items are now resolved for this application
  const remainingOpen = await prisma.outstandingItem.count({
    where: { applicationId: item.applicationId, status: "OPEN" },
  });

  if (remainingOpen === 0) {
    await prisma.application.update({
      where: { id: item.applicationId },
      data: {
        status: "DOCS_IN_PROGRESS",
      },
    });
  }

  await prisma.auditEvent.create({
    data: {
      applicationId: item.applicationId,
      userId: currentUser.id,
      userRole: currentUser.role,
      action: "OUTSTANDING_ITEM_RESOLVED",
      summary: `Resolved item "${item.title}". Resolution: ${resolutionNote}`,
    },
  });

  return updated;
}
