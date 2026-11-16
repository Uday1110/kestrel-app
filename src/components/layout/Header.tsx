"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { UserSession } from "@/types/domain";

interface HeaderProps {
  user: UserSession;
}

export function Header({ user }: HeaderProps) {
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    if (loggingOut) return;
    setLoggingOut(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/login");
      router.refresh();
    } catch (err) {
      console.error("Logout failed:", err);
      setLoggingOut(false);
    }
  };

  const getRoleBadge = () => {
    switch (user.role) {
      case "OWNER":
        return {
          label: "System Owner & Governance",
          shortLabel: "Owner",
          icon: "security",
          classes: "bg-surface-dark-elevated text-primary-container border-primary-container/40 shadow-[0_0_12px_rgba(2,245,118,0.2)]",
        };
      case "ANALYST":
        return {
          label: "Credit Underwriting Analyst",
          shortLabel: "Analyst",
          icon: "fact_check",
          classes: "bg-surface-dark-elevated text-secondary border-secondary/40 shadow-[0_0_12px_rgba(201,190,255,0.2)]",
        };
      case "RM":
      default:
        return {
          label: "Relationship Manager (RM)",
          shortLabel: "RM",
          icon: "folder_shared",
          classes: "bg-surface-dark-elevated text-primary border-primary/40 shadow-[0_0_12px_rgba(2,245,118,0.15)]",
        };
    }
  };

  const roleBadge = getRoleBadge();

  return (
    <header className="fixed top-0 left-0 lg:left-72 right-0 h-16 bg-surface/90 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)] z-30 flex items-center justify-between px-4 lg:px-space-lg border-b border-surface-container-high/40">
      {/* Left controls: Role Badge & Compliance */}
      <div className="flex items-center gap-space-md">
        {/* Mobile Brand icon on small screens */}
        <div className="flex lg:hidden items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-surface-dark-elevated flex items-center justify-center text-primary-container shadow-[0_0_12px_rgba(2,245,118,0.25)]">
            <span className="material-symbols-outlined text-[18px]">account_balance</span>
          </div>
          <span className="font-bold text-pure-white text-sm">Kestrel</span>
        </div>

        {/* Server-Enforced Role Status Pill (No in-app switching) */}
        <div
          data-testid="authenticated-role-badge"
          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold border ${roleBadge.classes}`}
          title="Server-enforced authenticated role. To change roles, sign out and sign in with the target credentials."
        >
          <span className="material-symbols-outlined text-[16px]">{roleBadge.icon}</span>
          <span className="hidden sm:inline">{roleBadge.label}</span>
          <span className="sm:hidden">{roleBadge.shortLabel}</span>
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-primary-container ml-1"></span>
        </div>

        {/* Compliance pill on wide screens */}
        <div className="hidden xl:flex items-center gap-1.5 px-space-md py-1 rounded-lg bg-surface-container-low text-slate-muted text-xs font-medium border border-surface-container-high/30">
          <span className="material-symbols-outlined text-primary-fixed-dim text-[16px]">
            verified_user
          </span>
          <span>RBI Master Direction 2025/WC-4 | 256-bit HSM Notary</span>
        </div>
      </div>

      {/* Right controls: User profile & Explicit Sign Out */}
      <div className="flex items-center gap-space-sm sm:gap-space-md">
        <div className="hidden sm:flex flex-col text-right">
          <span className="text-xs sm:text-sm text-pure-white font-semibold leading-tight">
            {user.name}
          </span>
          <span className="text-[11px] text-slate-muted leading-tight truncate max-w-[180px]">
            {user.title}
          </span>
        </div>

        {/* Explicit Sign Out Button */}
        <button
          type="button"
          onClick={handleLogout}
          disabled={loggingOut}
          title="Sign out of Kestrel Finance"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-container-high/60 hover:bg-surface-container-high border border-surface-container-high/80 text-xs font-medium text-slate-muted hover:text-pure-white transition-all focus:outline-none focus:ring-1 focus:ring-primary-container"
        >
          <span className="material-symbols-outlined text-[16px] text-error">logout</span>
          <span className="hidden md:inline">{loggingOut ? "Signing out..." : "Sign Out"}</span>
        </button>
      </div>
    </header>
  );
}
