import { NextRequest, NextResponse } from "next/server";
import { DEMO_USERS, setSessionUser } from "@/lib/auth";
import { UserRole } from "@/types/domain";

export async function POST(req: NextRequest) {
  try {
    const { role } = (await req.json()) as { role: UserRole };
    if (role !== "RM" && role !== "ANALYST") {
      return NextResponse.json({ success: false, error: "Invalid role specified" }, { status: 400 });
    }

    const targetUser = role === "RM" ? DEMO_USERS.rm : DEMO_USERS.analyst;
    await setSessionUser(targetUser);

    return NextResponse.json({
      success: true,
      user: targetUser,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
