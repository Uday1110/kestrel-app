"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserRole } from "@/types/domain";

interface SidebarProps {
  currentRole?: UserRole;
}

export function Sidebar({ currentRole }: SidebarProps) {
  const pathname = usePathname();

  const ownerItem = {
    label: "Owner Governance",
    href: "/owner",
    icon: "security",
    activeMatch: (p: string) => p.startsWith("/owner"),
  };

  const baseNavItems = [
    {
      label: "Applications",
      href: "/applications",
      icon: "folder_shared",
      activeMatch: (p: string) => p.startsWith("/applications") || p.startsWith("/checklist"),
    },
    {
      label: "Documents",
      href: "/documents",
      icon: "description",
      activeMatch: (p: string) => p.startsWith("/documents"),
    },
    {
      label: "Outstanding Items",
      href: "/outstanding-items",
      icon: "pending_actions",
      activeMatch: (p: string) => p.startsWith("/outstanding-items"),
    },
    {
      label: "Queue",
      href: "/queue",
      icon: "rule_folder",
      activeMatch: (p: string) => p.startsWith("/queue") || p.startsWith("/analyst"),
    },
    {
      label: "Metrics / Baseline",
      href: "/dashboard",
      icon: "monitoring",
      activeMatch: (p: string) => p === "/dashboard" || p === "/metrics",
    },
    {
      label: "Financial Prep",
      href: "/financial-assistant",
      icon: "analytics",
      activeMatch: (p: string) => p.startsWith("/financial-assistant"),
    },
  ];

  const navItems = currentRole === "OWNER" ? [ownerItem, ...baseNavItems] : baseNavItems;

  return (
    <aside className="hidden lg:flex fixed left-0 top-0 h-full w-72 bg-surface-container-lowest z-40 flex-col justify-between shadow-[0_1px_8px_rgba(0,0,0,0.04)] border-r border-surface-container-high/40">
      <div className="flex flex-col">
        {/* Brand header */}
        <div className="h-16 flex items-center px-space-lg gap-space-sm bg-surface-container-lowest border-b border-surface-container-high/30">
          <div className="w-8 h-8 rounded-lg bg-surface-dark-elevated flex items-center justify-center shadow-[0_0_16px_rgba(2,245,118,0.25)]">
            <span className="material-symbols-outlined text-primary-container text-[20px]">
              account_balance
            </span>
          </div>
          <div className="flex flex-col">
            <span className="font-bold tracking-wider text-pure-white uppercase text-[15px]">
              Kestrel
            </span>
            <span className="font-semibold text-primary-fixed-dim uppercase tracking-widest text-[10px]">
              Finance Intake
            </span>
          </div>
        </div>

        {/* Section title */}
        <div className="px-space-md py-space-sm">
          <div className="px-space-sm py-space-xs font-semibold text-[11px] uppercase tracking-wider text-slate-muted">
            Lending Navigation
          </div>
        </div>

        {/* Navigation list */}
        <nav className="flex flex-col px-space-sm gap-1">
          {navItems.map((item) => {
            const isActive = item.activeMatch(pathname);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-space-sm px-space-md py-2.5 rounded-lg transition-all text-sm ${
                  isActive
                    ? "bg-surface-dark-elevated text-primary font-bold shadow-[inset_2px_0_0_#02f576]"
                    : "text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface"
                }`}
              >
                <span
                  className={`material-symbols-outlined text-[20px] ${
                    isActive ? "text-primary-container" : "text-slate-muted"
                  }`}
                >
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Production node status */}
      <div className="p-space-md bg-surface-container-lowest border-t border-surface-container-high/30">
        <div className="bg-surface-dark p-space-sm rounded-lg flex items-center gap-space-sm">
          <div className="w-2 h-2 rounded-full bg-primary-container shadow-[0_0_8px_#02f576] animate-pulse"></div>
          <div className="flex flex-col overflow-hidden">
            <span className="text-xs text-pure-white truncate font-semibold">
              Production Node LDN-04
            </span>
            <span className="text-[10px] text-slate-muted tracking-tight truncate">
              Latency 14ms | HSM Clean
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
}
