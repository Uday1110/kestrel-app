import { NextResponse } from "next/server";
import { requireRole } from "@/lib/auth";
import { recordRefreshSuccess, getFreshnessState } from "@/services/owner-service";
import { prisma } from "@/lib/prisma";

export async function POST() {
  try {
    const user = await requireRole(["OWNER"]);

    recordRefreshSuccess();
    const freshness = getFreshnessState();

    await prisma.auditEvent.create({
      data: {
        userId: user.id,
        userRole: user.role,
        action: "DASHBOARD_DATA_REFRESHED",
        summary: `System Owner ${user.name} initiated on-demand dashboard telemetry recalculation`,
        metadata: JSON.stringify({
          refreshedAt: freshness.lastUpdated,
          status: freshness.status,
        }),
      },
    });

    return NextResponse.json({
      success: true,
      data: freshness,
    });
  } catch (err: any) {
    const isForbidden = err.message?.includes("FORBIDDEN") || err.message?.includes("UNAUTHORIZED");
    return NextResponse.json(
      { success: false, error: err.message || "Failed to trigger dashboard refresh" },
      { status: isForbidden ? 403 : 500 }
    );
  }
}
