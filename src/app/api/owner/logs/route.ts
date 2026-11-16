import { NextResponse } from "next/server";
import { requireRole } from "@/lib/auth";
import { getSystemLogsAndAlerts } from "@/services/owner-service";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const user = await requireRole(["OWNER"]);

    await prisma.auditEvent.create({
      data: {
        userId: user.id,
        userRole: user.role,
        action: "SYSTEM_LOGS_VIEWED",
        summary: `System Owner ${user.name} reviewed structured logs and alert triggers`,
        metadata: JSON.stringify({
          endpoint: "/api/owner/logs",
          timestamp: new Date().toISOString(),
        }),
      },
    });

    const data = await getSystemLogsAndAlerts();
    return NextResponse.json({ success: true, data });
  } catch (err: any) {
    const isForbidden = err.message?.includes("FORBIDDEN") || err.message?.includes("UNAUTHORIZED");
    return NextResponse.json(
      { success: false, error: err.message || "Failed to load system logs and alerts" },
      { status: isForbidden ? 403 : 500 }
    );
  }
}
