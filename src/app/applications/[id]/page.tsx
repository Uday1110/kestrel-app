import { notFound } from "next/navigation";
import { getSessionUserOrDefault } from "@/lib/auth";
import { getApplicationById } from "@/services/application-service";
import { AppShell } from "@/components/layout/AppShell";
import { ApplicationChecklistView } from "@/components/rm/ApplicationChecklistView";

interface ApplicationDetailPageProps {
  params: {
    id: string;
  };
}

export const dynamic = "force-dynamic";

export default async function ApplicationDetailPage({ params }: ApplicationDetailPageProps) {
  const user = await getSessionUserOrDefault();
  const application = await getApplicationById(params.id);

  if (!application) {
    notFound();
  }

  return (
    <AppShell user={user}>
      <ApplicationChecklistView application={application} currentUser={user} />
    </AppShell>
  );
}
