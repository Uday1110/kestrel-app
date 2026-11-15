import { notFound } from "next/navigation";
import { getSessionUserOrDefault } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getApplicationById } from "@/services/application-service";
import { AppShell } from "@/components/layout/AppShell";
import { FinancialPreparationView } from "@/components/analyst/FinancialPreparationView";

interface FinancialAssistantPageProps {
  searchParams?: {
    appId?: string;
  };
}

export const dynamic = "force-dynamic";

export default async function FinancialAssistantPage({ searchParams }: FinancialAssistantPageProps) {
  const user = await getSessionUserOrDefault();

  let targetId = searchParams?.appId;
  if (!targetId) {
    const defaultApp = await prisma.application.findFirst({
      where: {
        financialExtractions: {
          some: {},
        },
      },
      orderBy: { createdAt: "asc" },
    });
    targetId = defaultApp?.id;
  }

  if (!targetId) {
    const anyApp = await prisma.application.findFirst({
      orderBy: { createdAt: "asc" },
    });
    targetId = anyApp?.id;
  }

  if (!targetId) {
    notFound();
  }

  const application = await getApplicationById(targetId);
  if (!application) {
    notFound();
  }

  return (
    <AppShell user={user}>
      <FinancialPreparationView application={application} currentUser={user} />
    </AppShell>
  );
}
