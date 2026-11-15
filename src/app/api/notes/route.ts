import { NextRequest, NextResponse } from "next/server";
import { getSessionUserOrDefault } from "@/lib/auth";
import { createAnalystNoteSchema } from "@/lib/validators";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const user = await getSessionUserOrDefault();
    const body = await req.json();
    const validated = createAnalystNoteSchema.parse(body);

    const note = await prisma.analystNote.create({
      data: {
        applicationId: validated.applicationId,
        authorId: user.id,
        title: validated.title,
        content: validated.content,
        category: validated.category,
      },
      include: { author: true },
    });

    await prisma.auditEvent.create({
      data: {
        applicationId: validated.applicationId,
        userId: user.id,
        userRole: user.role,
        action: "ANALYST_NOTE_ADDED",
        summary: `Added analyst note: "${validated.title}" by ${user.name}`,
      },
    });

    return NextResponse.json({ success: true, note }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 400 });
  }
}
