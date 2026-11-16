import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST() {
  let currentUser = null;
  try {
    currentUser = await getCurrentUser();
  } catch {
    // Request scope may not be present in unit testing
  }

  // Log unauthorized attempt to switch role in-app
  if (currentUser) {
    try {
      await prisma.auditEvent.create({
        data: {
          userId: currentUser.id,
          userRole: currentUser.role,
          action: "ROLE_SWITCH_BLOCKED",
          summary: `In-app role switch attempt blocked for user ${currentUser.name} (${currentUser.role}). Governance policy mandates explicit sign-out and re-authentication.`,
          metadata: JSON.stringify({
            userId: currentUser.id,
            attemptedRoleSwitch: true,
            policy: "Cycle Governance Directive 2026.Q1",
          }),
        },
      });
    } catch (e) {
      console.warn("Failed to audit role switch block", e);
    }
  }

  return NextResponse.json(
    {
      success: false,
      error:
        "In-app profile/role switching is disabled under Institutional Governance & Segregation of Duties. To switch roles, you must sign out and authenticate with the designated role credentials.",
    },
    { status: 403 }
  );
}
