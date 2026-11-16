"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { UserRole } from "@/types/domain";

export function LoginRoleSwitchView() {
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState<UserRole>("RM");
  const [staffId, setStaffId] = useState("rm.sharma@corporate.kestrel.internal");
  const [otpToken, setOtpToken] = useState("94821034");
  const [extendedSession, setExtendedSession] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleRoleSelect = (role: UserRole) => {
    setSelectedRole(role);
    if (role === "RM") {
      setStaffId("rm.sharma@corporate.kestrel.internal");
      setOtpToken("94821034");
    } else if (role === "ANALYST") {
      setStaffId("analyst.williams@corporate.kestrel.internal");
      setOtpToken("88219401");
    } else if (role === "OWNER") {
      setStaffId("owner.governance@corporate.kestrel.internal");
      setOtpToken("71940285");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          staffId,
          role: selectedRole,
          otpToken,
          extendedSession,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Authentication failed");
      }

      router.push(data.redirectTo || (selectedRole === "RM" ? "/dashboard" : "/queue"));
      router.refresh();
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to authenticate");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full min-h-screen bg-surface flex items-center justify-center p-4 sm:p-6 lg:p-gutter">
      <div className="flex flex-col w-full max-w-5xl mx-auto py-6">
        {/* Governance Protocol Banner */}
        <div className="relative overflow-hidden bg-surface-container-lowest rounded-xl shadow-xl p-space-md mb-space-lg flex items-start sm:items-center gap-space-md border border-surface-container-high/60">
          <div className="absolute inset-0 bg-gradient-to-r from-primary-container/10 via-transparent to-transparent pointer-events-none"></div>
          <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-surface-container-high flex items-center justify-center text-primary-container">
            <span className="material-symbols-outlined text-lg">policy</span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-space-xs flex-wrap">
              <span className="text-xs uppercase tracking-wider text-primary-container font-semibold">
                Strict Governance Protocol
              </span>
              <span className="text-xs text-slate-muted">|</span>
              <span className="text-xs text-slate-muted font-medium">Internal Bank Deployment Only</span>
            </div>
            <p className="text-xs sm:text-sm text-on-surface-variant mt-0.5 leading-snug">
              All corporate credit underwriting decisions and exposure allocations are strictly executed by accredited human credit analysts under Institutional Lending Charter Section 4.2.
            </p>
          </div>
          <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 bg-surface-container rounded-full text-slate-muted flex-shrink-0 border border-surface-container-high/50">
            <span className="inline-block w-2 h-2 rounded-full bg-primary-container shadow-[0_0_8px_#02f576]"></span>
            <span className="text-xs font-semibold tracking-wide uppercase text-on-surface">SOC2 // FIPS-140-3</span>
          </div>
        </div>

        {/* Main Gateway Container */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg items-stretch">
          {/* Left Column: Role Gateway Selector & Telemetry */}
          <div className="lg:col-span-7 flex flex-col justify-between space-y-space-md">
            {/* Brand & Title Block */}
            <div className="bg-surface-dark rounded-xl p-space-lg shadow-xl relative overflow-hidden border border-surface-container-high/40">
              <div className="flex items-center justify-between mb-space-md">
                <div className="flex items-center gap-space-sm">
                  <div className="w-10 h-10 rounded-lg bg-primary-container flex items-center justify-center text-surface-container-lowest shadow-[0_0_16px_rgba(2,245,118,0.35)]">
                    <span className="material-symbols-outlined font-bold text-2xl">account_balance</span>
                  </div>
                  <div>
                    <span className="text-xl sm:text-2xl text-pure-white font-bold tracking-tight">
                      KESTREL<span className="text-primary-container font-light">FINANCE</span>
                    </span>
                    <p className="text-xs text-slate-muted">Corporate Lending Origination Engine</p>
                  </div>
                </div>
                <span className="text-xs px-2.5 py-1 rounded bg-surface-container text-primary-container font-semibold tracking-wider border border-surface-container-high/40">
                  PORTAL v4.8.2
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-bold text-pure-white mb-space-xs">
                Select Clearance Gateway
              </h1>
              <p className="text-xs sm:text-sm text-slate-muted mb-space-lg">
                Routing context determines workspace encryption cipher, ledger isolation constraints, and forensic tool suites.
              </p>

              {/* Interactive Role Tiles */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-space-md">
                {/* Tile 1: Relationship Manager */}
                <button
                  type="button"
                  onClick={() => handleRoleSelect("RM")}
                  className={`text-left p-space-md rounded-xl shadow-lg transition-all duration-200 relative overflow-hidden group border ${
                    selectedRole === "RM"
                      ? "bg-surface-dark-elevated border-primary-container/40 ring-1 ring-primary-container/30"
                      : "bg-surface-container-high/40 border-surface-container-high/30 opacity-80 hover:opacity-100"
                  }`}
                >
                  <div
                    className={`absolute top-0 left-0 right-0 h-1 transition-all ${
                      selectedRole === "RM"
                        ? "bg-primary-container shadow-[0_0_12px_#02f576]"
                        : "bg-transparent"
                    }`}
                  />
                  <div className="flex items-center justify-between mb-space-sm">
                    <div className="w-8 h-8 rounded-lg bg-surface-container-high flex items-center justify-center text-primary-container group-hover:scale-105 transition-transform">
                      <span className="material-symbols-outlined text-lg">folder_shared</span>
                    </div>
                    <span
                      className={`w-4 h-4 rounded-full flex items-center justify-center ${
                        selectedRole === "RM" ? "bg-primary-container" : "bg-surface-container-lowest"
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          selectedRole === "RM" ? "bg-surface-container-lowest" : "bg-transparent"
                        }`}
                      />
                    </span>
                  </div>
                  <h3 className="text-pure-white font-bold text-base leading-snug">
                    Relationship Manager
                  </h3>
                  <p className="text-xs text-primary font-medium tracking-wide uppercase mt-0.5">
                    Origination &amp; Intake
                  </p>
                  <ul className="mt-space-sm space-y-1">
                    <li className="flex items-center gap-1.5 text-xs text-slate-muted">
                      <span className="material-symbols-outlined text-sm text-primary-container">
                        check_circle
                      </span>
                      Intake Orchestration
                    </li>
                    <li className="flex items-center gap-1.5 text-xs text-slate-muted">
                      <span className="material-symbols-outlined text-sm text-primary-container">
                        check_circle
                      </span>
                      Borrower Collation
                    </li>
                    <li className="flex items-center gap-1.5 text-xs text-slate-muted">
                      <span className="material-symbols-outlined text-sm text-primary-container">
                        check_circle
                      </span>
                      Completeness Gatechecks
                    </li>
                  </ul>
                </button>

                {/* Tile 2: Credit Analyst */}
                <button
                  type="button"
                  onClick={() => handleRoleSelect("ANALYST")}
                  className={`text-left p-space-md rounded-xl shadow-lg transition-all duration-200 relative overflow-hidden group border ${
                    selectedRole === "ANALYST"
                      ? "bg-surface-dark-elevated border-secondary/50 ring-1 ring-secondary/30"
                      : "bg-surface-container-high/40 border-surface-container-high/30 opacity-80 hover:opacity-100"
                  }`}
                >
                  <div
                    className={`absolute top-0 left-0 right-0 h-1 transition-all ${
                      selectedRole === "ANALYST"
                        ? "bg-secondary shadow-[0_0_12px_#c9beff]"
                        : "bg-transparent"
                    }`}
                  />
                  <div className="flex items-center justify-between mb-space-sm">
                    <div className="w-8 h-8 rounded-lg bg-surface-container flex items-center justify-center text-secondary group-hover:scale-105 transition-transform">
                      <span className="material-symbols-outlined text-lg">fact_check</span>
                    </div>
                    <span
                      className={`w-4 h-4 rounded-full flex items-center justify-center ${
                        selectedRole === "ANALYST" ? "bg-secondary" : "bg-surface-container-lowest"
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          selectedRole === "ANALYST" ? "bg-surface-container-lowest" : "bg-transparent"
                        }`}
                      />
                    </span>
                  </div>
                  <h3 className="text-pure-white font-bold text-base leading-snug">
                    Credit Analyst
                  </h3>
                  <p className="text-xs text-secondary font-medium tracking-wide uppercase mt-0.5">
                    Risk &amp; Underwriting
                  </p>
                  <ul className="mt-space-sm space-y-1">
                    <li className="flex items-center gap-1.5 text-xs text-slate-muted">
                      <span className="material-symbols-outlined text-sm text-secondary">
                        verified_user
                      </span>
                      Underwriting Readiness
                    </li>
                    <li className="flex items-center gap-1.5 text-xs text-slate-muted">
                      <span className="material-symbols-outlined text-sm text-secondary">
                        verified_user
                      </span>
                      Forensic Inspection
                    </li>
                    <li className="flex items-center gap-1.5 text-xs text-slate-muted">
                      <span className="material-symbols-outlined text-sm text-secondary">
                        verified_user
                      </span>
                      Financial Spreads
                    </li>
                  </ul>
                </button>

                {/* Tile 3: System Owner & Governance */}
                <button
                  type="button"
                  onClick={() => handleRoleSelect("OWNER")}
                  className={`text-left p-space-md rounded-xl shadow-lg transition-all duration-200 relative overflow-hidden group border ${
                    selectedRole === "OWNER"
                      ? "bg-surface-dark-elevated border-primary-container/60 ring-1 ring-primary-container/40"
                      : "bg-surface-container-high/40 border-surface-container-high/30 opacity-80 hover:opacity-100"
                  }`}
                >
                  <div
                    className={`absolute top-0 left-0 right-0 h-1 transition-all ${
                      selectedRole === "OWNER"
                        ? "bg-primary-container shadow-[0_0_12px_#02f576]"
                        : "bg-transparent"
                    }`}
                  />
                  <div className="flex items-center justify-between mb-space-sm">
                    <div className="w-8 h-8 rounded-lg bg-surface-container flex items-center justify-center text-primary-container group-hover:scale-105 transition-transform">
                      <span className="material-symbols-outlined text-lg">security</span>
                    </div>
                    <span
                      className={`w-4 h-4 rounded-full flex items-center justify-center ${
                        selectedRole === "OWNER" ? "bg-primary-container" : "bg-surface-container-lowest"
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          selectedRole === "OWNER" ? "bg-surface-container-lowest" : "bg-transparent"
                        }`}
                      />
                    </span>
                  </div>
                  <h3 className="text-pure-white font-bold text-base leading-snug">
                    System Owner
                  </h3>
                  <p className="text-xs text-primary-container font-medium tracking-wide uppercase mt-0.5">
                    Governance &amp; Oversight
                  </p>
                  <ul className="mt-space-sm space-y-1">
                    <li className="flex items-center gap-1.5 text-xs text-slate-muted">
                      <span className="material-symbols-outlined text-sm text-primary-container">
                        policy
                      </span>
                      Model &amp; Rule Registry
                    </li>
                    <li className="flex items-center gap-1.5 text-xs text-slate-muted">
                      <span className="material-symbols-outlined text-sm text-primary-container">
                        timeline
                      </span>
                      Traces (Masked PII)
                    </li>
                    <li className="flex items-center gap-1.5 text-xs text-slate-muted">
                      <span className="material-symbols-outlined text-sm text-primary-container">
                        savings
                      </span>
                      Cost Analytics &amp; Runs
                    </li>
                  </ul>
                </button>
              </div>
            </div>

            {/* Live Underwriting Intake Telemetry Mini-Card */}
            <div className="bg-surface-dark rounded-xl p-space-md shadow-xl flex items-center justify-between border border-surface-container-high/40">
              <div className="flex items-center gap-space-md">
                <div className="relative w-12 h-12 flex-shrink-0">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                    <path
                      className="text-surface-container-highest"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3"
                    />
                    <path
                      className="text-primary-container"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="currentColor"
                      strokeDasharray="82, 100"
                      strokeLinecap="round"
                      strokeWidth="3"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center text-xs font-bold text-pure-white">
                    82%
                  </div>
                </div>
                <div>
                  <span className="text-xs uppercase text-slate-muted tracking-wider block font-semibold">
                    Intake Queue Health
                  </span>
                  <span className="text-sm text-pure-white font-semibold">
                    14 Syndicated Facilities Under Review
                  </span>
                </div>
              </div>
              <div className="text-right hidden sm:block">
                <span className="text-xs text-primary-container font-mono block font-bold">
                  $1.24B ACTIVE PIPELINE
                </span>
                <span className="text-xs text-slate-muted">Avg Turnaround: 4.2h</span>
              </div>
            </div>
          </div>

          {/* Right Column: Authentication Terminal */}
          <div className="lg:col-span-5 flex flex-col">
            <div className="bg-surface-dark-elevated rounded-xl p-space-lg shadow-xl flex-1 flex flex-col justify-between relative overflow-hidden border border-surface-container-high/50">
              <div>
                {/* Header Inside Auth */}
                <div className="flex items-center justify-between pb-space-sm mb-space-md border-b border-surface-container-high/30">
                  <div>
                    <span className="text-xs uppercase text-primary-container font-semibold tracking-wider">
                      HSM-Secured Terminal
                    </span>
                    <h2 className="text-lg sm:text-xl font-bold text-pure-white">
                      Staff Credential Access
                    </h2>
                  </div>
                  <div className="w-8 h-8 rounded-lg bg-surface-container flex items-center justify-center text-primary-container">
                    <span className="material-symbols-outlined text-lg">vpn_key</span>
                  </div>
                </div>

                {errorMsg && (
                  <div className="p-3 mb-4 rounded-lg bg-error-container/30 border border-error/40 text-error text-xs">
                    {errorMsg}
                  </div>
                )}

                <form className="space-y-space-md" onSubmit={handleSubmit}>
                  {/* Field 1: Staff ID / Email */}
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-on-surface" htmlFor="staff-id">
                      Staff Corporate ID / UPN
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-muted">
                        <span className="material-symbols-outlined text-lg">badge</span>
                      </div>
                      <input
                        className="w-full bg-surface-container-lowest text-pure-white pl-10 pr-3 py-2.5 rounded text-sm focus:outline-none focus:ring-1 focus:ring-primary-container border border-surface-container-high/60 transition-all font-mono"
                        id="staff-id"
                        value={staffId}
                        onChange={(e) => setStaffId(e.target.value)}
                        required
                        type="text"
                      />
                    </div>
                  </div>

                  {/* Field 2: Entrust Token / Hardware OTP */}
                  <div className="space-y-1">
                    <div className="flex justify-between items-center">
                      <label className="text-xs font-semibold uppercase tracking-wider text-on-surface" htmlFor="otp-token">
                        Hardware OTP / Entrust Code
                      </label>
                      <button
                        type="button"
                        onClick={() => setOtpToken(String(Math.floor(10000000 + Math.random() * 90000000)))}
                        className="text-xs text-primary hover:text-primary-container transition-colors"
                      >
                        Resync Token
                      </button>
                    </div>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-muted">
                        <span className="material-symbols-outlined text-lg">pin</span>
                      </div>
                      <input
                        className="w-full bg-surface-container-lowest text-pure-white font-mono tracking-widest pl-10 pr-3 py-2.5 rounded text-sm focus:outline-none focus:ring-1 focus:ring-primary-container border border-surface-container-high/60 transition-all"
                        id="otp-token"
                        maxLength={10}
                        value={otpToken}
                        onChange={(e) => setOtpToken(e.target.value)}
                        required
                        type="password"
                      />
                    </div>
                    <p className="text-[11px] text-slate-muted">
                      Enter algorithmic hash from physical cryptographic fob or internal Knox token.
                    </p>
                  </div>

                  {/* Session Persistence Toggle */}
                  <div
                    className="p-space-sm bg-surface-container-low rounded-lg flex items-center justify-between cursor-pointer border border-surface-container-high/40 hover:bg-surface-container transition-colors"
                    onClick={() => setExtendedSession(!extendedSession)}
                  >
                    <div className="flex items-center gap-space-sm">
                      <div
                        className={`w-5 h-5 rounded flex items-center justify-center transition-all ${
                          extendedSession ? "bg-primary-container" : "bg-surface-container-highest"
                        }`}
                      >
                        {extendedSession && (
                          <span className="material-symbols-outlined text-sm font-bold text-surface-container-lowest">
                            check
                          </span>
                        )}
                      </div>
                      <div>
                        <span className="text-xs font-semibold text-pure-white block leading-tight">
                          Extended Trading Session
                        </span>
                        <span className="text-[11px] text-slate-muted">
                          Retain encrypted token across intake desks (8 Hours)
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Active Gateway Badge Indicator */}
                  <div className="p-2.5 bg-surface-container rounded flex items-center justify-between text-on-surface border border-surface-container-high/30">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-base text-primary-container">shield</span>
                      <span className="text-xs font-medium">Gateway Context:</span>
                    </div>
                    <span className="text-xs font-bold text-primary-container uppercase tracking-wider">
                      {selectedRole === "RM"
                        ? "RELATIONSHIP MANAGER"
                        : selectedRole === "ANALYST"
                        ? "CREDIT ANALYST"
                        : "SYSTEM OWNER & GOVERNANCE"}
                    </span>
                  </div>

                  {/* Primary CTA Button */}
                  <button
                    className="w-full py-3.5 px-space-md rounded bg-primary-container text-surface-container-lowest text-sm font-bold tracking-wide uppercase shadow-[0_0_24px_rgba(2,245,118,0.35)] hover:shadow-[0_0_32px_rgba(2,245,118,0.6)] hover:bg-primary-fixed-dim transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                    type="submit"
                    disabled={loading}
                  >
                    <span>
                      {loading
                        ? "Verifying Certificate..."
                        : selectedRole === "RM"
                        ? "Access Origination Workspace"
                        : "Access Underwriting Workspace"}
                    </span>
                    <span className="material-symbols-outlined text-xl font-bold">arrow_forward</span>
                  </button>
                </form>
              </div>

              {/* Terminal Footer Identity Hash */}
              <div className="pt-space-md mt-space-md flex items-center justify-between text-xs text-slate-muted border-t border-surface-container-high/30">
                <div className="flex items-center gap-1.5">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-primary-container"></span>
                  <span className="font-mono text-[11px]">NODE: LDN-GATE-04</span>
                </div>
                <span className="font-mono text-[11px]">ECDSA-P384 VALIDATED</span>
              </div>
            </div>
          </div>
        </div>

        {/* Operational Audit Disclaimers */}
        <div className="mt-space-lg grid grid-cols-1 md:grid-cols-3 gap-space-md text-slate-muted">
          <div className="bg-surface-dark p-space-md rounded-lg flex items-start gap-space-sm border border-surface-container-high/30">
            <span className="material-symbols-outlined text-primary-container text-lg shrink-0">lock_clock</span>
            <div>
              <h4 className="text-xs font-semibold text-pure-white mb-0.5">Session Immutability</h4>
              <p className="text-xs leading-relaxed">
                Idle state timeouts execute automatically after 15 minutes of inactive queue manipulation.
              </p>
            </div>
          </div>
          <div className="bg-surface-dark p-space-md rounded-lg flex items-start gap-space-sm border border-surface-container-high/30">
            <span className="material-symbols-outlined text-primary-container text-lg shrink-0">history_edu</span>
            <div>
              <h4 className="text-xs font-semibold text-pure-white mb-0.5">Forensic Audit Log</h4>
              <p className="text-xs leading-relaxed">
                All pipeline access attempts, telemetry downloads, and credit memo previews are recorded to WORM storage.
              </p>
            </div>
          </div>
          <div className="bg-surface-dark p-space-md rounded-lg flex items-start gap-space-sm border border-surface-container-high/30">
            <span className="material-symbols-outlined text-primary-container text-lg shrink-0">verified</span>
            <div>
              <h4 className="text-xs font-semibold text-pure-white mb-0.5">Dual-Control Protocol</h4>
              <p className="text-xs leading-relaxed">
                Credit lines exceeding $25M mandate secondary co-signing by a Designated Underwriting Director.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
