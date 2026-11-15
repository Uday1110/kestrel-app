import { NextRequest, NextResponse } from "next/server";
import { getSessionUserOrDefault } from "@/lib/auth";
import { dispatchBorrowerChase } from "@/services/outstanding-items-service";
import { OutreachChannel } from "@/types/domain";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getSessionUserOrDefault();
    const { channel, customNote } = (await req.json()) as {
      channel: OutreachChannel;
      customNote?: string;
    };

    const updated = await dispatchBorrowerChase(
      params.id,
      channel || "EMAIL",
      customNote || "Automated compliance document reminder",
      user
    );

    return NextResponse.json({
      success: true,
      item: updated,
      message: `Dispatched chase via ${channel}`,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 400 });
  }
}
