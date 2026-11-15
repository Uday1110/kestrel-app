import { UserSession } from "@/types/domain";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { MobileBottomNav } from "./MobileBottomNav";

interface AppShellProps {
  user: UserSession;
  children: React.ReactNode;
}

export function AppShell({ user, children }: AppShellProps) {
  return (
    <div className="min-h-screen bg-surface text-on-surface">
      <Sidebar currentRole={user.role} />
      <Header user={user} />
      <main className="w-full pt-16 pb-20 lg:pb-12 lg:pl-72 min-h-screen transition-all">
        <div className="px-4 sm:px-6 lg:px-8 py-6 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
      <MobileBottomNav />
    </div>
  );
}
