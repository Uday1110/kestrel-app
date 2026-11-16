import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/auth";
import { getPromptToneConfig, updatePromptToneConfig } from "@/services/prompt-config-service";

export async function GET() {
  try {
    await requireRole(["OWNER"]);
    const config = await getPromptToneConfig();
    return NextResponse.json({ success: true, data: config });
  } catch (err: any) {
    const isForbidden = err.message?.includes("FORBIDDEN") || err.message?.includes("UNAUTHORIZED");
    return NextResponse.json(
      { success: false, error: err.message || "Failed to load prompt configuration" },
      { status: isForbidden ? 403 : 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const user = await requireRole(["OWNER"]);
    const body = await req.json();

    const updated = await updatePromptToneConfig(body, user);
    return NextResponse.json({
      success: true,
      data: updated,
      message: "Prompts and tone configuration successfully saved and committed to audit ledger.",
    });
  } catch (err: any) {
    const isForbidden = err.message?.includes("FORBIDDEN") || err.message?.includes("UNAUTHORIZED");
    return NextResponse.json(
      { success: false, error: err.message || "Failed to update prompt configuration" },
      { status: isForbidden ? 403 : 500 }
    );
  }
}
