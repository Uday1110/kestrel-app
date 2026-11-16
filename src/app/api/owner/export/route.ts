import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/auth";
import { exportGovernanceReport } from "@/services/owner-service";

export async function GET(req: NextRequest) {
  try {
    const user = await requireRole(["OWNER"]);

    const { searchParams } = new URL(req.url);
    const format = (searchParams.get("format") || "csv") as "csv" | "pdf";

    const exportResult = await exportGovernanceReport(format, user);

    return new NextResponse(exportResult.content, {
      status: 200,
      headers: {
        "Content-Type": exportResult.contentType,
        "Content-Disposition": `attachment; filename="${exportResult.filename}"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (err: any) {
    const isForbidden = err.message?.includes("FORBIDDEN") || err.message?.includes("UNAUTHORIZED");
    return NextResponse.json(
      { success: false, error: err.message || "Failed to generate export" },
      { status: isForbidden ? 403 : 500 }
    );
  }
}
