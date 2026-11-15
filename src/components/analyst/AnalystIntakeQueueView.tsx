"use client";

import { useState } from "react";
import Link from "next/link";
import { formatINR, formatINRRaw } from "@/lib/formatters";

interface AnalystIntakeQueueViewProps {
  applications: any[];
  currentUser: any;
}

export function AnalystIntakeQueueView({
  applications: initialApps,
  currentUser,
}: AnalystIntakeQueueViewProps) {
  const [apps, setApps] = useState(initialApps);
  const [activeTab, setActiveTab] = useState<"priority" | "wc" | "term" | "all">("priority");
  const [search, setSearch] = useState("");

  const filteredApps = apps.filter((app) => {
    if (activeTab === "wc" && app.facilityType !== "WORKING_CAPITAL") return false;
    if (activeTab === "term" && app.facilityType !== "TERM_LOAN" && app.facilityType !== "MACHINERY_LOAN") return false;
    if (activeTab === "all") return true;

    if (search.trim()) {
      const q = search.toLowerCase();
      const name = app.business.legalName.toLowerCase();
      const ref = app.referenceNumber.toLowerCase();
      return name.includes(q) || ref.includes(q);
    }
    return true;
  });

  const totalExposure = apps.reduce((sum, a) => sum + a.facilityAmount, 0);

  return (
    <div className="flex flex-col w-full pb-space-xl">
      {/* Primary Header & Regulatory Banner */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-space-md mb-space-lg">
        <div className="flex flex-col max-w-3xl">
          <div className="flex items-center gap-space-sm mb-space-xs">
            <span className="inline-flex items-center gap-1.5 px-space-sm py-0.5 rounded-lg bg-surface-dark-elevated text-primary-container text-xs uppercase tracking-wider font-semibold border border-surface-container-high/40">
              <span className="w-1.5 h-1.5 rounded-full bg-primary-container shadow-[0_0_8px_#02f576] animate-pulse" />
              Underwriting Intake Portal
            </span>
            <span className="text-slate-muted text-xs font-semibold">/</span>
            <span className="text-slate-muted text-xs font-semibold tracking-wider">POLICY STAGE 02</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-bold text-pure-white tracking-tight">
            Credit Analyst Intake Queue
          </h1>
          <p className="text-xs sm:text-sm text-slate-muted mt-1">
            Intake-validated dossiers ready for policy underwriting. Underwriting decision strictly rests with accredited analyst.
          </p>
        </div>

        {/* Live Telemetry Status Capsule */}
        <div className="flex items-center gap-space-sm bg-surface-dark p-space-sm rounded-xl shadow-md border border-surface-container-high/40 self-start lg:self-auto">
          <div className="w-10 h-10 rounded-lg bg-surface-dark-elevated flex items-center justify-center text-primary-container border border-surface-container-high/30">
            <span className="material-symbols-outlined text-[22px]">policy</span>
          </div>
          <div className="flex flex-col pr-space-sm">
            <span className="text-xs text-pure-white font-semibold">Governance Protocol</span>
            <span className="text-[11px] text-slate-muted">Zero-Auto-Decisioning Mandate</span>
          </div>
        </div>
      </div>

      {/* Operational Metrics Bento Strip */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-space-lg">
        {/* Stat 1: Ready Queue */}
        <div className="bg-surface-dark p-space-md rounded-xl shadow-md flex flex-col justify-between relative overflow-hidden group border border-surface-container-high/40">
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-primary-container" />
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-wider text-slate-muted font-semibold">
              Ready Queue
            </span>
            <span className="material-symbols-outlined text-primary-container text-[20px]">
              fact_check
            </span>
          </div>
          <div className="mt-2">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl sm:text-4xl font-bold text-pure-white">
                {apps.length}
              </span>
              <span className="text-xs text-primary-fixed-dim font-medium">Dossiers</span>
            </div>
            <p className="text-xs text-slate-muted mt-1">
              Complete Dossiers (Ready for Policy Review)
            </p>
          </div>
          <div className="mt-2 pt-2 flex items-center justify-between text-slate-muted text-[11px] border-t border-surface-container-high/30">
            <span>Checklist Accuracy</span>
            <span className="text-primary-container font-semibold">100% Verified</span>
          </div>
        </div>

        {/* Stat 2: Intake Velocity */}
        <div className="bg-surface-dark p-space-md rounded-xl shadow-md flex flex-col justify-between relative overflow-hidden border border-surface-container-high/40">
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-secondary" />
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-wider text-slate-muted font-semibold">
              Intake Velocity
            </span>
            <span className="material-symbols-outlined text-secondary text-[20px]">speed</span>
          </div>
          <div className="mt-2">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl sm:text-4xl font-bold text-pure-white font-mono">
                2.1
              </span>
              <span className="text-xs text-secondary font-medium">hrs</span>
            </div>
            <p className="text-xs text-slate-muted mt-1">
              Avg Turnaround: 2.1 hrs (Intake to Queue)
            </p>
          </div>
          <div className="mt-2 pt-2 flex items-center justify-between text-slate-muted text-[11px] border-t border-surface-container-high/30">
            <span>SLA Baseline</span>
            <span className="text-pure-white font-semibold">4.0 hrs Threshold</span>
          </div>
        </div>

        {/* Stat 3: Pipeline Aggregation Sparkline */}
        <div className="bg-surface-dark p-space-md rounded-xl shadow-md flex flex-col justify-between border border-surface-container-high/40">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-wider text-slate-muted font-semibold">
              Pipeline Volume
            </span>
            <span className="material-symbols-outlined text-slate-muted text-[20px]">
              equalizer
            </span>
          </div>
          <div className="mt-2 flex items-end justify-between gap-space-md">
            <div>
              <div className="text-xl sm:text-2xl font-bold text-pure-white font-mono">
                {formatINR(totalExposure)}
              </div>
              <p className="text-[11px] text-slate-muted mt-0.5">Aggregate Exposure in Queue</p>
            </div>
            <svg className="w-24 h-10 text-primary-container shrink-0" fill="none" viewBox="0 0 100 40">
              <path
                d="M0 32 L20 28 L40 34 L60 16 L80 18 L100 4"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2.5"
              />
              <path
                d="M0 32 L20 28 L40 34 L60 16 L80 18 L100 4 L100 40 L0 40 Z"
                fill="currentColor"
                fillOpacity="0.1"
              />
            </svg>
          </div>
          <div className="mt-2 pt-2 flex items-center justify-between text-slate-muted text-[11px] border-t border-surface-container-high/30">
            <span>Multi-facility Pool</span>
            <span className="text-pure-white font-semibold">{apps.length} Active Files</span>
          </div>
        </div>

        {/* Stat 4: Document Verification Nodes */}
        <div className="bg-surface-dark p-space-md rounded-xl shadow-md flex flex-col justify-between border border-surface-container-high/40">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-wider text-slate-muted font-semibold">
              OCR &amp; Pre-Checks
            </span>
            <span className="inline-flex items-center gap-1 text-[11px] text-primary-container bg-primary-container/10 px-2 py-0.5 rounded font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-primary-container animate-pulse" /> SYNCED
            </span>
          </div>
          <div className="mt-2">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-bold text-pure-white font-mono">
                48 / 48
              </span>
            </div>
            <p className="text-xs text-slate-muted mt-1">
              Artifacts Passed Automated Ingestion
            </p>
          </div>
          <div className="mt-2 pt-2 flex items-center justify-between text-slate-muted text-[11px] border-t border-surface-container-high/30">
            <span>Engine Validation</span>
            <span className="text-pure-white font-semibold">Kestrel Optical v2.8</span>
          </div>
        </div>
      </div>

      {/* Operational Filter Strip & Search Matrix */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-space-md bg-surface-container-low p-2 rounded-xl mb-space-md shadow-sm border border-surface-container-high/40">
        <div className="flex items-center overflow-x-auto gap-1 p-1 bg-surface-dark rounded-lg border border-surface-container-high/30">
          <button
            type="button"
            onClick={() => setActiveTab("priority")}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5 whitespace-nowrap transition-all ${
              activeTab === "priority"
                ? "bg-surface-dark-elevated text-primary-container shadow-[0_0_12px_rgba(2,245,118,0.15)] font-bold"
                : "text-slate-muted hover:text-pure-white"
            }`}
          >
            <span>Priority Queue</span>
            <span className="bg-primary-container text-surface-container-lowest font-bold px-1.5 py-0.2 rounded-full text-[10px]">
              {apps.length}
            </span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("wc")}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold whitespace-nowrap transition-colors ${
              activeTab === "wc"
                ? "bg-surface-dark-elevated text-primary-container shadow-sm font-bold"
                : "text-slate-muted hover:text-pure-white"
            }`}
          >
            Corporate WC
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("term")}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold whitespace-nowrap transition-colors ${
              activeTab === "term"
                ? "bg-surface-dark-elevated text-primary-container shadow-sm font-bold"
                : "text-slate-muted hover:text-pure-white"
            }`}
          >
            Term Loans
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("all")}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold whitespace-nowrap transition-colors ${
              activeTab === "all"
                ? "bg-surface-dark-elevated text-primary-container shadow-sm font-bold"
                : "text-slate-muted hover:text-pure-white"
            }`}
          >
            All Completed
          </button>
        </div>

        {/* Search */}
        <div className="relative flex-1 sm:w-72">
          <span className="material-symbols-outlined absolute left-3 top-2 text-slate-muted text-[18px]">
            search
          </span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search entity, ref ID..."
            className="w-full bg-surface-container-lowest text-pure-white pl-9 pr-3 py-1.5 rounded-lg text-xs placeholder-slate-muted focus:outline-none focus:ring-1 focus:ring-primary-container border border-surface-container-high/60 transition-all"
          />
        </div>
      </div>

      {/* Queue Data Table */}
      <div className="rounded-xl bg-surface-dark shadow-xl overflow-hidden mb-space-lg border border-surface-container-high/40">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs sm:text-sm min-w-[980px]">
            <thead>
              <tr className="bg-surface-container-lowest text-slate-muted text-xs uppercase tracking-wider border-b border-surface-container-high/30">
                <th className="py-3.5 px-4">Ref ID</th>
                <th className="py-3.5 px-4">Borrower / Applicant Entity</th>
                <th className="py-3.5 px-4 text-right">Facility Requested</th>
                <th className="py-3.5 px-4">Waiting / Ingestion Time</th>
                <th className="py-3.5 px-4">Readiness &amp; Pre-Checks</th>
                <th className="py-3.5 px-4 text-center">Intake State</th>
                <th className="py-3.5 px-4 text-right">Review Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-container-high/30">
              {filteredApps.map((app) => {
                const is100Ready = app.intakeReadinessPercent >= 75;
                return (
                  <tr
                    key={app.id}
                    className="hover:bg-surface-container-high/60 transition-colors group"
                  >
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono font-bold text-primary-container">
                          {app.referenceNumber}
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-muted">Direct Client Intake</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex flex-col min-w-0">
                        <span className="font-semibold text-pure-white text-sm truncate max-w-[220px]">
                          {app.business.legalName}
                        </span>
                        <div className="flex items-center gap-2 text-slate-muted text-xs mt-0.5">
                          <span>CIN: {app.business.cin}</span>
                          <span>•</span>
                          <span>{app.business.city}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="font-bold text-pure-white font-mono">
                        ₹ {formatINRRaw(app.facilityAmount)}
                      </div>
                      <span className="text-[11px] text-slate-muted">
                        {app.facilityType.replace(/_/g, " ")}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5 text-pure-white font-medium text-xs">
                        <span className="material-symbols-outlined text-[16px] text-primary-container">
                          schedule
                        </span>
                        <span>Today, 10:15 IST</span>
                      </div>
                      <span className="text-[11px] text-slate-muted">Latency: 2.1 hrs</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex flex-col gap-1">
                        <div className="inline-flex items-center gap-1 text-primary-container text-xs font-semibold">
                          <span className="material-symbols-outlined text-[16px]">verified</span>
                          <span>{app.intakeReadinessPercent}% Ready</span>
                        </div>
                        <div className="w-32 h-1.5 bg-surface-dark-elevated rounded-full overflow-hidden border border-surface-container-high/40">
                          <div
                            className="h-full bg-primary-container rounded-full"
                            style={{ width: `${app.intakeReadinessPercent}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold tracking-wider uppercase ${
                          is100Ready
                            ? "bg-primary-container/10 text-primary-container"
                            : "bg-tertiary-container/10 text-tertiary-fixed-dim"
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            is100Ready ? "bg-primary-container shadow-[0_0_6px_#02f576]" : "bg-tertiary-fixed-dim"
                          }`}
                        />
                        {app.status === "DOCS_IN_PROGRESS" ? "IN PROGRESS" : app.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <Link
                        href={`/analyst/review/${app.id}`}
                        className="inline-flex items-center justify-center gap-1 px-3.5 py-1.5 rounded-lg bg-primary-container hover:bg-primary text-surface-container-lowest text-xs font-bold shadow-[0_0_16px_rgba(2,245,118,0.25)] hover:shadow-[0_0_24px_rgba(2,245,118,0.4)] transition-all"
                      >
                        <span>Open for Review</span>
                        <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
