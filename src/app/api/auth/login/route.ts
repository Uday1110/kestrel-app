import { NextRequest, NextResponse } from "next/server";
import { loginSchema } from "@/lib/validators";
import { DEMO_USERS, setSessionUser } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validated = loginSchema.parse(body);

    const userKey = validated.role === "RM" ? "rm" : "analyst";
    const user = { ...DEMO_USERS[userKey] };

    // If custom staff ID provided, retain name & department
    if (validated.staffId) {
      user.email = validated.staffId.includes("@")
        ? validated.staffId
        : `${validated.staffId}@bank.kestrel.internal`;
    }

    await setSessionUser(user);

    return NextResponse.json({
      success: true,
      user,
      redirectTo: validated.role === "RM" ? "/dashboard" : "/queue",
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Invalid authentication request" },
      { status: 400 }
    );
  }
}
