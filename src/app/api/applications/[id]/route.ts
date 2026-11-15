import { NextRequest, NextResponse } from "next/server";
import { getApplicationById, updateApplicationStatus } from "@/services/application-service";
import { getSessionUserOrDefault } from "@/lib/auth";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const app = await getApplicationById(params.id);
    if (!app) {
      return NextResponse.json({ success: false, error: "Application not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true, application: app });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getSessionUserOrDefault();
    const { status, note } = await req.json();

    const updated = await updateApplicationStatus(params.id, status, user, note);
    return NextResponse.json({ success: true, application: updated });
  } catch (err: any) {
    const statusCode = err.message?.includes("GOVERNANCE RESTRICTION") ? 403 : 400;
    return NextResponse.json({ success: false, error: err.message }, { status: statusCode });
  }
}
