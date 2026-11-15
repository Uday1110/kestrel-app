import { NextRequest, NextResponse } from "next/server";
import { getSessionUserOrDefault } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { updateApplicationStatus } from "@/services/application-service";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getSessionUserOrDefault();
    const body = await req.json().catch(() => ({}));
    const { forceSubmit, waiverReason } = body as { forceSubmit?: boolean; waiverReason?: string };

    const app = await prisma.application.findUnique({
      where: { id: params.id },
      include: {
        checklistItems: true,
      },
    });

    if (!app) {
      return NextResponse.json({ success: false, error: "Application not found" }, { status: 404 });
    }

    // Identify blockers
    const blockers = app.checklistItems.filter(
      (item) => item.mandatory && (item.status === "MISSING" || item.status === "ATTENTION")
    );

    if (blockers.length > 0 && !forceSubmit) {
      return NextResponse.json(
        {
          success: false,
          blocked: true,
          error: `Submission Blocked: Dossier incomplete with ${blockers.length} active blocker(s).`,
          blockers: blockers.map((b) => ({
            id: b.id,
            title: b.title,
            status: b.status,
            reason: b.flagReason,
          })),
        },
        { status: 422 }
      );
    }

    const note = forceSubmit
      ? `Submitted with ${blockers.length} flagged item(s) under RM supervisory sign-off. Waiver reason: ${waiverReason || "Conditional Fast-Track Handover"}`
      : "Full dossier verified and submitted to Credit Desk.";

    const updated = await updateApplicationStatus(app.id, "SUBMITTED", user, note);

    return NextResponse.json({
      success: true,
      application: updated,
      message: "Application successfully submitted to Credit Desk queue.",
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
