import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/auth";
import { getEndToEndTraces } from "@/services/owner-service";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const user = await requireRole(["OWNER"]);

    const { searchParams } = new URL(req.url);
    const outcome = searchParams.get("outcome") || undefined;
    const facilityType = searchParams.get("facilityType") || undefined;

    // Record audit event for viewing masked case traces
    await prisma.auditEvent.create({
      data: {
        userId: user.id,
        userRole: user.role,
        action: "MASKED_CASE_TRACES_VIEWED",
        summary: `System Owner ${user.name} inspected End-to-End Case Traces (PII masked)`,
        metadata: JSON.stringify({
          endpoint: "/api/owner/traces",
          filters: { outcome, facilityType },
          timestamp: new Date().toISOString(),
        }),
      },
    });

    const traces = await getEndToEndTraces({ outcome, facilityType });
    return NextResponse.json({ success: true, data: traces });
  } catch (err: any) {
    const isForbidden = err.message?.includes("FORBIDDEN") || err.message?.includes("UNAUTHORIZED");
    return NextResponse.json(
      { success: false, error: err.message || "Failed to load case traces" },
      { status: isForbidden ? 403 : 500 }
    );
  }
}
