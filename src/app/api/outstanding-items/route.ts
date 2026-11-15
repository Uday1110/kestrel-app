import { NextRequest, NextResponse } from "next/server";
import { getSessionUserOrDefault } from "@/lib/auth";
import { createOutstandingItemSchema } from "@/lib/validators";
import { createOutstandingItem, listOutstandingItems } from "@/services/outstanding-items-service";

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const applicationId = searchParams.get("applicationId") || undefined;
    const filter = (searchParams.get("filter") as any) || undefined;
    const search = searchParams.get("q") || undefined;

    const items = await listOutstandingItems({
      applicationId,
      filter,
      search,
    });

    return NextResponse.json({ success: true, items });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getSessionUserOrDefault();
    const body = await req.json();
    const validated = createOutstandingItemSchema.parse(body);

    const item = await createOutstandingItem(validated, user);
    return NextResponse.json({ success: true, item }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 400 });
  }
}
