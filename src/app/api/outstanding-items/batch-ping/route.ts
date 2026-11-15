import { NextResponse } from "next/server";
import { getSessionUserOrDefault } from "@/lib/auth";
import { batchAutomatedPing } from "@/services/outstanding-items-service";

export async function POST() {
  try {
    const user = await getSessionUserOrDefault();
    const result = await batchAutomatedPing(user);
    return NextResponse.json({
      success: true,
      pingedCount: result.pingedCount,
      message: `Transmitted automated pings to ${result.pingedCount} borrower files`,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
