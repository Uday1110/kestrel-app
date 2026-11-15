import { NextRequest, NextResponse } from "next/server";
import { getSessionUserOrDefault } from "@/lib/auth";
import { resolveOutstandingItemSchema } from "@/lib/validators";
import { resolveOutstandingItem } from "@/services/outstanding-items-service";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getSessionUserOrDefault();
    const body = await req.json();
    const validated = resolveOutstandingItemSchema.parse({ ...body, itemId: params.id });

    const updated = await resolveOutstandingItem(
      params.id,
      validated.resolutionNote,
      validated.documentId,
      user
    );

    return NextResponse.json({
      success: true,
      item: updated,
      message: "Outstanding item marked resolved",
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 400 });
  }
}
