import { getSessionUserOrDefault } from "@/lib/auth";
import { listAllDocuments } from "@/services/document-service";
import { AppShell } from "@/components/layout/AppShell";
import { DocumentsListView } from "@/components/rm/DocumentsListView";

export const dynamic = "force-dynamic";

export default async function DocumentsPage() {
  const user = await getSessionUserOrDefault();
  const documents = await listAllDocuments();

  return (
    <AppShell user={user}>
      <DocumentsListView documents={documents} currentUser={user} />
    </AppShell>
  );
}
