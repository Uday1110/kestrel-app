"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { UserRole, UserSession } from "@/types/domain";

interface HeaderProps {
  user: UserSession;
}

export function Header({ user }: HeaderProps) {
  const router = useRouter();
  const [switching, setSwitching] = useState(false);

  const handleRoleSwitch = async (targetRole: UserRole) => {
    if (user.role === targetRole || switching) return;
    setSwitching(true);
    try {
      const res = await fetch("/api/auth/switch-role", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: targetRole }),
      });
      if (res.ok) {
        if (targetRole === "RM") {
          router.push("/dashboard");
        } else {
          router.push("/queue");
        }
        router.refresh();
      }
    } catch (err) {
      console.error("Failed to switch role", err);
    } finally {
      setSwitching(false);
    }
  };

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  };

  return (
    <header className="fixed top-0 left-0 lg:left-72 right-0 h-16 bg-surface/90 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)] z-30 flex items-center justify-between px-4 lg:px-space-lg border-b border-surface-container-high/40">
      {/* Left controls: Role Switcher & Compliance */}
      <div className="flex items-center gap-space-md">
        {/* Mobile Brand icon on small screens */}
        <div className="flex lg:hidden items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-surface-dark-elevated flex items-center justify-center text-primary-container shadow-[0_0_12px_rgba(2,245,118,0.25)]">
            <span className="material-symbols-outlined text-[18px]">account_balance</span>
          </div>
          <span className="font-bold text-pure-white text-sm">Kestrel</span>
        </div>

        {/* Dual Role Clearance Gateway Switch */}
        <div className="inline-flex items-center bg-surface-container-lowest p-0.5 rounded-lg border border-surface-container-high/60">
          <button
            type="button"
            onClick={() => handleRoleSwitch("RM")}
            disabled={switching}
            className={`px-2.5 sm:px-space-md py-1 rounded-md text-xs font-semibold transition-all ${
              user.role === "RM"
                ? "bg-surface-dark-elevated text-primary-container font-bold shadow-[0_0_12px_rgba(2,245,118,0.2)]"
                : "text-slate-muted hover:text-pure-white"
            }`}
          >
            <span className="hidden sm:inline">Relationship Manager (RM)</span>
            <span className="sm:hidden">RM</span>
          </button>
          <button
            type="button"
            onClick={() => handleRoleSwitch("ANALYST")}
            disabled={switching}
            className={`px-2.5 sm:px-space-md py-1 rounded-md text-xs font-semibold transition-all ${
              user.role === "ANALYST"
                ? "bg-surface-dark-elevated text-primary-container font-bold shadow-[0_0_12px_rgba(2,245,118,0.2)]"
                : "text-slate-muted hover:text-pure-white"
            }`}
          >
            <span className="hidden sm:inline">Credit Analyst</span>
            <span className="sm:hidden">Analyst</span>
          </button>
        </div>

        {/* Compliance pill on wide screens */}
        <div className="hidden xl:flex items-center gap-1.5 px-space-md py-1 rounded-lg bg-surface-container-low text-slate-muted text-xs font-medium border border-surface-container-high/30">
          <span className="material-symbols-outlined text-primary-fixed-dim text-[16px]">
            verified_user
          </span>
          <span>RBI Master Direction 2025/WC-4 | 256-bit HSM Notary</span>
        </div>
      </div>

      {/* Right controls: User profile & Gateway badge */}
      <div className="flex items-center gap-space-sm sm:gap-space-md">
        <div className="hidden sm:flex flex-col text-right">
          <span className="text-xs sm:text-sm text-pure-white font-semibold leading-tight">
            {user.name}
          </span>
          <span className="text-[11px] text-slate-muted leading-tight truncate max-w-[180px]">
            {user.title}
          </span>
        </div>

        {/* User avatar circle */}
        <div
          onClick={handleLogout}
          title="Sign out of clearance gateway"
          className="w-8 h-8 rounded-full bg-surface-dark-elevated border border-primary-container/40 flex items-center justify-center cursor-pointer hover:border-primary-container transition-all text-primary-container"
        >
          <span className="material-symbols-outlined text-[18px]">person</span>
        </div>
      </div>
    </header>
  );
}
