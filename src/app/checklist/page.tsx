import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function ChecklistPage() {
  const app = await prisma.application.findFirst({
    orderBy: { createdAt: "asc" },
  });

  if (app) {
    redirect(`/applications/${app.id}`);
  } else {
    redirect("/applications");
  }
}
