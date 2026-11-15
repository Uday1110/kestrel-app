import { NextRequest, NextResponse } from "next/server";
import { getSessionUserOrDefault } from "@/lib/auth";
import { getDashboardMetrics } from "@/services/dashboard-service";

export async function GET(req: NextRequest) {
  try {
    const user = await getSessionUserOrDefault();
    const metrics = await getDashboardMetrics(user.role);
    return NextResponse.json({ success: true, metrics, user });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
