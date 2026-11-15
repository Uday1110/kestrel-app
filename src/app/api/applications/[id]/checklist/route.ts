import { NextRequest, NextResponse } from "next/server";
import { getSessionUserOrDefault } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { updateChecklistSchema } from "@/lib/validators";
import { recalculateReadiness } from "@/services/application-service";

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getSessionUserOrDefault();
    const body = await req.json();
    const validated = updateChecklistSchema.parse({ ...body, applicationId: params.id });

    const item = await prisma.checklistItem.findUnique({
      where: { id: validated.itemId },
    });

    if (!item || item.applicationId !== params.id) {
      return NextResponse.json({ success: false, error: "Checklist item not found" }, { status: 404 });
    }

    const updated = await prisma.checklistItem.update({
      where: { id: validated.itemId },
      data: {
        status: validated.status,
        flagReason: validated.flagReason !== undefined ? validated.flagReason : item.flagReason,
        verifiedAt: validated.status === "CLEARED" ? new Date() : null,
        verifiedByUserId: validated.status === "CLEARED" ? user.id : null,
      },
      include: { document: true },
    });

    const newReadiness = await recalculateReadiness(params.id);

    await prisma.auditEvent.create({
      data: {
        applicationId: params.id,
        userId: user.id,
        userRole: user.role,
        action: "CHECKLIST_UPDATED",
        summary: `Checklist item "${item.title}" marked ${validated.status} by ${user.name}. ${validated.flagReason ? "Reason: " + validated.flagReason : ""}`,
      },
    });

    return NextResponse.json({
      success: true,
      checklistItem: updated,
      readinessPercent: newReadiness,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 400 });
  }
}
