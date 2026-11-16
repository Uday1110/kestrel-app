import { NextResponse } from "next/server";
import { requireRole } from "@/lib/auth";
import { getGovernanceRegistry } from "@/services/owner-service";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const user = await requireRole(["OWNER"]);

    // Record audit event
    await prisma.auditEvent.create({
      data: {
        userId: user.id,
        userRole: user.role,
        action: "GOVERNANCE_REGISTRY_VIEWED",
        summary: `System Owner ${user.name} inspected Governance Policy and Thresholds Registry`,
        metadata: JSON.stringify({
          endpoint: "/api/owner/governance",
          timestamp: new Date().toISOString(),
        }),
      },
    });

    const data = await getGovernanceRegistry();
    return NextResponse.json({ success: true, data });
  } catch (err: any) {
    const isForbidden = err.message?.includes("FORBIDDEN") || err.message?.includes("UNAUTHORIZED");
    return NextResponse.json(
      { success: false, error: err.message || "Failed to load governance registry" },
      { status: isForbidden ? 403 : 500 }
    );
  }
}
