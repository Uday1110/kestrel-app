import { NextRequest, NextResponse } from "next/server";
import { getSessionUserOrDefault, requireRole } from "@/lib/auth";
import { createApplicationSchema } from "@/lib/validators";
import { createApplication, listApplications } from "@/services/application-service";

export async function GET(req: NextRequest) {
  try {
    const user = await getSessionUserOrDefault();
    const searchParams = req.nextUrl.searchParams;
    const statusFilter = searchParams.get("status") || undefined;
    const search = searchParams.get("q") || undefined;
    const facilityType = searchParams.get("facilityType") || undefined;

    const applications = await listApplications({
      role: user.role,
      userId: user.id,
      statusFilter,
      search,
      facilityType,
    });

    return NextResponse.json({ success: true, applications });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    // Only RM or ADMIN may create lending intake applications
    const user = await requireRole(["RM", "ADMIN"]);
    const body = await req.json();
    const validated = createApplicationSchema.parse(body);

    const app = await createApplication(validated, user);

    return NextResponse.json({ success: true, application: app }, { status: 201 });
  } catch (err: any) {
    const status = err.message?.startsWith("FORBIDDEN") ? 403 : 400;
    return NextResponse.json({ success: false, error: err.message }, { status });
  }
}
