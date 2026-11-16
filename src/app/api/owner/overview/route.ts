import { NextResponse } from "next/server";
import { requireRole } from "@/lib/auth";
import { getOwnerOverviewMetrics } from "@/services/owner-service";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const user = await requireRole(["OWNER"]);

    // Record audit event for governance dashboard access
    await prisma.auditEvent.create({
      data: {
        userId: user.id,
        userRole: user.role,
        action: "OWNER_DASHBOARD_ACCESSED",
        summary: `System Owner ${user.name} accessed Owner Governance Dashboard overview metrics`,
        metadata: JSON.stringify({
          endpoint: "/api/owner/overview",
          timestamp: new Date().toISOString(),
        }),
      },
    });

    const metrics = await getOwnerOverviewMetrics();
    return NextResponse.json({ success: true, data: metrics });
  } catch (err: any) {
    const isForbidden = err.message?.includes("FORBIDDEN") || err.message?.includes("UNAUTHORIZED");
    return NextResponse.json(
      { success: false, error: err.message || "Failed to load owner overview" },
      { status: isForbidden ? 403 : 500 }
    );
  }
}
