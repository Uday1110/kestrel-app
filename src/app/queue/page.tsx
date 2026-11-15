import { getSessionUserOrDefault } from "@/lib/auth";
import { listApplications } from "@/services/application-service";
import { AppShell } from "@/components/layout/AppShell";
import { AnalystIntakeQueueView } from "@/components/analyst/AnalystIntakeQueueView";

export const dynamic = "force-dynamic";

export default async function QueuePage() {
  const user = await getSessionUserOrDefault();
  const applications = await listApplications();

  return (
    <AppShell user={user}>
      <AnalystIntakeQueueView applications={applications} currentUser={user} />
    </AppShell>
  );
}
