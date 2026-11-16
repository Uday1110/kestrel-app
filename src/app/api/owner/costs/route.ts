import { NextResponse } from "next/server";
import { requireRole } from "@/lib/auth";
import { getCostAnalytics } from "@/services/owner-service";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const user = await requireRole(["OWNER"]);

    await prisma.auditEvent.create({
      data: {
        userId: user.id,
        userRole: user.role,
        action: "COST_ANALYTICS_VIEWED",
        summary: `System Owner ${user.name} reviewed system unit cost and vendor tolerance projections`,
        metadata: JSON.stringify({
          endpoint: "/api/owner/costs",
          timestamp: new Date().toISOString(),
        }),
      },
    });

    const data = await getCostAnalytics();
    return NextResponse.json({ success: true, data });
  } catch (err: any) {
    const isForbidden = err.message?.includes("FORBIDDEN") || err.message?.includes("UNAUTHORIZED");
    return NextResponse.json(
      { success: false, error: err.message || "Failed to load cost analytics" },
      { status: isForbidden ? 403 : 500 }
    );
  }
}
