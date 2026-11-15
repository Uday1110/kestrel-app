import { getSessionUserOrDefault } from "@/lib/auth";
import { getDashboardMetrics } from "@/services/dashboard-service";
import { AppShell } from "@/components/layout/AppShell";
import { BaselineDashboardView } from "@/components/dashboard/BaselineDashboardView";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const user = await getSessionUserOrDefault();
  const metrics = await getDashboardMetrics(user.role);

  return (
    <AppShell user={user}>
      <BaselineDashboardView metrics={metrics} user={user} />
    </AppShell>
  );
}
