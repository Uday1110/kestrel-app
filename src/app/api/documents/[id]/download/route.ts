import { NextRequest, NextResponse } from "next/server";
import { getSessionUserOrDefault } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { documentStorage } from "@/lib/storage";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getSessionUserOrDefault();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const doc = await prisma.document.findUnique({
      where: { id: params.id },
      include: { application: true },
    });

    if (!doc || doc.isArchived) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 });
    }

    // Access check: User must be RM or Analyst or Admin
    if (user.role !== "RM" && user.role !== "ANALYST" && user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const fileBuffer = await documentStorage.readFile(doc.storagePath);

    const headers = new Headers();
    headers.set("Content-Type", doc.mimeType || "application/pdf");
    headers.set("Content-Disposition", `inline; filename="${encodeURIComponent(doc.originalName)}"`);
    headers.set("Content-Length", String(fileBuffer.length));
    headers.set("Cache-Control", "private, no-cache, no-store, must-revalidate");

    return new NextResponse(new Uint8Array(fileBuffer), {
      status: 200,
      headers,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to download document" }, { status: 500 });
  }
}
