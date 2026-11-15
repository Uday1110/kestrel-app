import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/auth";
import { analystDecisionSchema } from "@/lib/validators";
import { updateApplicationStatus } from "@/services/application-service";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Enforce server-side role authorization: Analyst only!
    const user = await requireRole(["ANALYST", "ADMIN"]);
    const body = await req.json();
    const validated = analystDecisionSchema.parse({ ...body, applicationId: params.id });

    let targetStatus: any = "UNDER_REVIEW";
    if (validated.decision === "ACKNOWLEDGE_AND_PROCEED") {
      targetStatus = "ACKNOWLEDGED";
    } else if (validated.decision === "REQUEST_DOCUMENTS") {
      targetStatus = "INFO_REQUESTED";
    } else if (validated.decision === "RECOMMEND_SANCTION") {
      targetStatus = "APPROVED";
    } else if (validated.decision === "REJECT_APPLICATION") {
      targetStatus = "REJECTED";
    }

    const updated = await updateApplicationStatus(
      params.id,
      targetStatus,
      user,
      `${validated.decision}: ${validated.notes}`
    );

    // Also record as an analyst note
    await prisma.analystNote.create({
      data: {
        applicationId: params.id,
        authorId: user.id,
        title: `Underwriting Decision: ${validated.decision.replace(/_/g, " ")}`,
        content: validated.notes,
        category: "COMPLIANCE",
      },
    });

    return NextResponse.json({
      success: true,
      application: updated,
      message: `Underwriting decision executed: ${validated.decision}`,
    });
  } catch (err: any) {
    const isForbidden = err.message?.startsWith("FORBIDDEN");
    return NextResponse.json(
      { success: false, error: err.message },
      { status: isForbidden ? 403 : 400 }
    );
  }
}
