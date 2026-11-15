import { NextRequest, NextResponse } from "next/server";
import { getSessionUserOrDefault } from "@/lib/auth";
import { validateAndUploadDocument } from "@/services/document-service";

export async function POST(req: NextRequest) {
  try {
    const user = await getSessionUserOrDefault();
    const formData = await req.formData();

    const file = formData.get("file") as File | null;
    const applicationId = formData.get("applicationId") as string | null;
    const category = (formData.get("category") as string) || "AUDITED_FINANCIALS";
    const checklistItemId = formData.get("checklistItemId") as string | undefined;

    if (!file || !applicationId) {
      return NextResponse.json(
        { success: false, error: "File and applicationId are required" },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const result = await validateAndUploadDocument(
      buffer,
      file.name,
      file.type || "application/pdf",
      applicationId,
      category,
      user,
      checklistItemId || undefined
    );

    return NextResponse.json({
      success: true,
      document: result.document,
      validation: result.validationPayload,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Failed to process document upload" },
      { status: 400 }
    );
  }
}
