import { NextRequest, NextResponse } from "next/server";
import { loginSchema } from "@/lib/validators";
import { DEMO_USERS, setSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validated = loginSchema.parse(body);

    let userKey: "rm" | "analyst" | "owner" = "rm";
    let redirectTo = "/dashboard";
    if (validated.role === "ANALYST") {
      userKey = "analyst";
      redirectTo = "/queue";
    } else if (validated.role === "OWNER") {
      userKey = "owner";
      redirectTo = "/owner";
    }

    const user = { ...DEMO_USERS[userKey] };

    // If custom staff ID provided, retain name & department
    if (validated.staffId) {
      user.email = validated.staffId.includes("@")
        ? validated.staffId
        : `${validated.staffId}@bank.kestrel.internal`;
    }

    await setSessionUser(user);

    // Audit log successful authentication
    try {
      await prisma.auditEvent.create({
        data: {
          userId: user.id,
          userRole: user.role,
          action: "USER_AUTHENTICATION_SUCCESS",
          summary: `User ${user.name} (${user.email}) authenticated with server-enforced role ${user.role}`,
          metadata: JSON.stringify({
            role: user.role,
            email: user.email,
            loginTime: new Date().toISOString(),
          }),
        },
      });
    } catch (auditErr) {
      console.warn("Could not record login audit event:", auditErr);
    }

    return NextResponse.json({
      success: true,
      user,
      redirectTo,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Invalid authentication request" },
      { status: 400 }
    );
  }
}
