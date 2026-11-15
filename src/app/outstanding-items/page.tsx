import { getSessionUserOrDefault } from "@/lib/auth";
import { listOutstandingItems } from "@/services/outstanding-items-service";
import { AppShell } from "@/components/layout/AppShell";
import { OutstandingItemsView } from "@/components/rm/OutstandingItemsView";

export const dynamic = "force-dynamic";

export default async function OutstandingItemsPage() {
  const user = await getSessionUserOrDefault();
  const items = await listOutstandingItems();

  return (
    <AppShell user={user}>
      <OutstandingItemsView initialItems={items} currentUser={user} />
    </AppShell>
  );
}
