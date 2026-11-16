import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { AppShell } from "@/components/layout/AppShell";
import { OwnerDashboardView } from "@/components/owner/OwnerDashboardView";

export const dynamic = "force-dynamic";

export default async function OwnerPage() {
  const user = await getCurrentUser();

  // Strict server-enforced role access
  if (!user) {
    redirect("/login?error=unauthorized");
  }

  if (user.role !== "OWNER") {
    // Forbidden for non-owner roles (RM, Analyst)
    return (
      <AppShell user={user}>
        <div className="w-full min-h-[60vh] flex flex-col items-center justify-center p-6 text-center">
          <div className="w-16 h-16 rounded-2xl bg-error/10 border border-error/30 flex items-center justify-center text-error mb-4 shadow-[0_0_24px_rgba(255,84,73,0.2)]">
            <span className="material-symbols-outlined text-3xl">security</span>
          </div>
          <h1 className="text-xl font-bold text-pure-white mb-2">
            403 - Forbidden: Least Privilege Access Control
          </h1>
          <p className="text-sm text-slate-muted max-w-md mb-6">
            The Owner Governance Dashboard is restricted strictly to authorized System Owners and Model Risk Governance stakeholders. Your authenticated role ({user.role}) does not possess clearance for this domain.
          </p>
          <div className="p-3 bg-surface-dark rounded-lg border border-surface-container-high/40 text-xs text-slate-muted font-mono mb-6">
            User: {user.email} | Role: {user.role} | Policy: Institutional Lending Charter 4.2
          </div>
          <a
            href={user.role === "RM" ? "/dashboard" : "/queue"}
            className="px-5 py-2.5 bg-surface-container-high hover:bg-surface-container-highest border border-surface-container-high/80 rounded-lg text-xs font-semibold text-pure-white transition-all"
          >
            Return to Authorized Workspace
          </a>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell user={user}>
      <OwnerDashboardView currentUser={user} />
    </AppShell>
  );
}
