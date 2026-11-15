"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function MobileBottomNav() {
  const pathname = usePathname();

  const links = [
    {
      label: "Apps",
      href: "/applications",
      icon: "folder_shared",
      match: (p: string) => p.startsWith("/applications") || p.startsWith("/checklist"),
    },
    {
      label: "Docs",
      href: "/documents",
      icon: "description",
      match: (p: string) => p.startsWith("/documents"),
    },
    {
      label: "Pending",
      href: "/outstanding-items",
      icon: "pending_actions",
      match: (p: string) => p.startsWith("/outstanding-items"),
    },
    {
      label: "Queue",
      href: "/queue",
      icon: "rule_folder",
      match: (p: string) => p.startsWith("/queue") || p.startsWith("/analyst"),
    },
    {
      label: "Metrics",
      href: "/dashboard",
      icon: "monitoring",
      match: (p: string) => p === "/dashboard" || p === "/metrics",
    },
  ];

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-surface/95 backdrop-blur-xl border-t border-surface-container-high/60 shadow-[0_-1px_12px_rgba(0,0,0,0.25)]">
      <div className="flex justify-around items-center h-16 px-1">
        {links.map((link) => {
          const isActive = link.match(pathname);
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex flex-col items-center justify-center min-w-[56px] min-h-[44px] gap-0.5 transition-colors ${
                isActive
                  ? "text-primary-container font-semibold"
                  : "text-on-surface-variant hover:text-on-surface"
              }`}
            >
              <span className="material-symbols-outlined text-[20px]">{link.icon}</span>
              <span className="text-[11px] font-medium tracking-tight">{link.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
