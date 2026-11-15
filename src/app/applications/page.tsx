import { getSessionUserOrDefault } from "@/lib/auth";
import { listApplications } from "@/services/application-service";
import { AppShell } from "@/components/layout/AppShell";
import { ApplicationListView } from "@/components/rm/ApplicationListView";

export const dynamic = "force-dynamic";

export default async function ApplicationsPage() {
  const user = await getSessionUserOrDefault();
  const applications = await listApplications({ role: user.role });

  return (
    <AppShell user={user}>
      <ApplicationListView applications={applications} currentUser={user} />
    </AppShell>
  );
}
