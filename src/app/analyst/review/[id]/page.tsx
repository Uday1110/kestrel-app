import { notFound } from "next/navigation";
import { getSessionUserOrDefault } from "@/lib/auth";
import { getApplicationById } from "@/services/application-service";
import { AppShell } from "@/components/layout/AppShell";
import { AnalystApplicationReviewView } from "@/components/analyst/AnalystApplicationReviewView";

interface AnalystReviewPageProps {
  params: {
    id: string;
  };
}

export const dynamic = "force-dynamic";

export default async function AnalystReviewPage({ params }: AnalystReviewPageProps) {
  const user = await getSessionUserOrDefault();
  const application = await getApplicationById(params.id);

  if (!application) {
    notFound();
  }

  return (
    <AppShell user={user}>
      <AnalystApplicationReviewView application={application} currentUser={user} />
    </AppShell>
  );
}
