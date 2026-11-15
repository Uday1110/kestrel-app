import { NextRequest, NextResponse } from "next/server";
import { getSessionUserOrDefault } from "@/lib/auth";
import { updateExtractionStatus } from "@/services/financial-service";
import { updateFinancialExtractionSchema } from "@/lib/validators";

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getSessionUserOrDefault();
    const body = await req.json();
    const validated = updateFinancialExtractionSchema.parse({ ...body, extractionId: params.id });

    const updated = await updateExtractionStatus(
      params.id,
      validated.status,
      user,
      validated.editedValue,
      validated.analystComment
    );

    return NextResponse.json({
      success: true,
      extraction: updated,
      message: `Extraction ${updated.label} status updated to ${validated.status}`,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 400 });
  }
}
