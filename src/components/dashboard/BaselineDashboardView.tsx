"use client";

import { useState } from "react";
import { DashboardMetrics, UserSession } from "@/types/domain";

interface BaselineDashboardViewProps {
  metrics: DashboardMetrics;
  user: UserSession;
}

export function BaselineDashboardView({ metrics, user }: BaselineDashboardViewProps) {
  const [viewMode, setViewMode] = useState<"days" | "pct">("days");

  return (
    <div className="flex flex-col w-full pb-space-xl">
      {/* Operational Context Banner */}
      <div className="relative overflow-hidden bg-surface-container-low rounded-xl p-space-md mb-space-lg shadow-sm border border-surface-container-high/40">
        <div className="absolute -right-16 -top-16 w-56 h-56 rounded-full bg-primary-container/5 blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-space-sm relative z-10">
          <div className="flex items-center gap-space-sm">
            <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-surface-dark-elevated text-primary-container">
              <span className="material-symbols-outlined text-[18px]">verified</span>
            </span>
            <div className="flex flex-col">
              <div className="flex items-center gap-space-xs flex-wrap">
                <span className="text-xs uppercase tracking-widest text-primary-container font-semibold">
                  Internal Operations
                </span>
                <span className="text-slate-muted text-xs">•</span>
                <span className="text-xs uppercase tracking-wider text-pure-white font-semibold">
                  Cycle Governance Directive 2026.Q1
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-muted mt-0.5">
                Median working days spent in each stage from application submission to final sanction.{" "}
                <span className="text-pure-white font-semibold">
                  Total: {metrics.aggregateCycleDays.toFixed(1)} Working Days.
                </span>
              </p>
            </div>
          </div>
          <div className="flex items-center gap-space-xs self-start md:self-auto">
            <span className="inline-flex items-center gap-1.5 px-space-sm py-1 rounded-lg bg-surface-dark text-xs text-slate-muted border border-surface-container-high/40">
              <span className="w-1.5 h-1.5 rounded-full bg-primary-container animate-pulse" />
              Live Telemetry Synced
            </span>
          </div>
        </div>
      </div>

      {/* Hero Baseline KPIs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-gutter mb-space-xl">
        {/* Metric 1: Aggregate Cycle */}
        <div className="bg-surface-dark p-space-lg rounded-xl shadow-md flex flex-col justify-between relative group hover:bg-surface-dark-elevated transition-colors border border-surface-container-high/40">
          <div className="flex items-center justify-between mb-space-sm">
            <span className="text-xs text-slate-muted uppercase tracking-wider font-semibold">
              Aggregate Cycle
            </span>
            <span className="material-symbols-outlined text-primary-container text-[20px]">
              timer
            </span>
          </div>
          <div className="mb-space-md">
            <div className="flex items-baseline gap-space-xs">
              <span className="text-3xl sm:text-4xl font-bold text-pure-white">
                {metrics.aggregateCycleDays.toFixed(1)}
              </span>
              <span className="text-xs font-semibold text-slate-muted">Working Days</span>
            </div>
            <p className="text-xs text-slate-muted mt-1">Application submission to final sanction</p>
          </div>
          <div className="pt-2 bg-surface-container-lowest/60 -mx-space-lg -mb-space-lg px-space-lg pb-space-md rounded-b-xl flex items-center justify-between border-t border-surface-container-high/30">
            <span className="text-xs text-primary-container flex items-center gap-1 font-semibold">
              <span className="material-symbols-outlined text-[16px]">trending_down</span>
              -2.8d accelerated
            </span>
            <span className="text-[11px] text-slate-muted">vs prior quarter</span>
          </div>
        </div>

        {/* Metric 2: Target SLA */}
        <div className="bg-surface-dark p-space-lg rounded-xl shadow-md flex flex-col justify-between relative group hover:bg-surface-dark-elevated transition-colors border border-surface-container-high/40">
          <div className="flex items-center justify-between mb-space-sm">
            <span className="text-xs text-slate-muted uppercase tracking-wider font-semibold">
              Target Quarterly SLA
            </span>
            <span className="material-symbols-outlined text-tertiary-fixed-dim text-[20px]">
              flag
            </span>
          </div>
          <div className="mb-space-md">
            <div className="flex items-baseline gap-space-xs">
              <span className="text-3xl sm:text-4xl font-bold text-pure-white">
                {metrics.targetSlaDays.toFixed(1)}
              </span>
              <span className="text-xs font-semibold text-slate-muted">Days</span>
            </div>
            <p className="text-xs text-slate-muted mt-1">Institutional committee delivery mandate</p>
          </div>
          <div className="pt-2 bg-surface-container-lowest/60 -mx-space-lg -mb-space-lg px-space-lg pb-space-md rounded-b-xl flex items-center justify-between border-t border-surface-container-high/30">
            <span className="text-xs text-tertiary-fixed-dim flex items-center gap-1 font-semibold">
              <span className="material-symbols-outlined text-[16px]">priority_high</span>
              +3.0d variance to target
            </span>
            <span className="text-[11px] text-slate-muted">Active gap</span>
          </div>
        </div>

        {/* Metric 3: Automation Efficiency */}
        <div className="bg-surface-dark p-space-lg rounded-xl shadow-md flex flex-col justify-between relative group hover:bg-surface-dark-elevated transition-colors border border-surface-container-high/40">
          <div className="flex items-center justify-between mb-space-sm">
            <span className="text-xs text-slate-muted uppercase tracking-wider font-semibold">
              Intake Integrity
            </span>
            <span className="material-symbols-outlined text-primary-fixed-dim text-[20px]">
              task_alt
            </span>
          </div>
          <div className="mb-space-md">
            <div className="flex items-baseline gap-space-xs">
              <span className="text-3xl sm:text-4xl font-bold text-primary-container">
                {metrics.intakeIntegrityPct}%
              </span>
              <span className="text-xs font-semibold text-slate-muted">Clean</span>
            </div>
            <p className="text-xs text-slate-muted mt-1">Automated GST &amp; banking checksum pass</p>
          </div>
          <div className="pt-2 bg-surface-container-lowest/60 -mx-space-lg -mb-space-lg px-space-lg pb-space-md rounded-b-xl flex items-center justify-between border-t border-surface-container-high/30">
            <span className="text-xs text-primary-fixed flex items-center gap-1 font-semibold">
              <span className="material-symbols-outlined text-[16px]">bolt</span>
              0.5d gate velocity
            </span>
            <span className="text-[11px] text-slate-muted">Zero friction</span>
          </div>
        </div>
      </div>

      {/* Stage Duration Composition - Horizontal Visualizer */}
      <div className="bg-surface-dark rounded-xl p-space-lg shadow-md mb-space-xl border border-surface-container-high/40">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-space-sm mb-space-lg">
          <div>
            <div className="flex items-center gap-space-xs flex-wrap">
              <span className="text-lg sm:text-xl text-pure-white font-bold">
                Stage Duration Composition
              </span>
              <span className="px-2 py-0.5 rounded-lg bg-surface-container-high text-xs text-slate-muted font-semibold">
                {metrics.aggregateCycleDays.toFixed(1)} Working Days Baseline
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-muted mt-1">
              Proportional time allocation across the 5 primary lending lifecycle gates. Hover segments for granular allocation data.
            </p>
          </div>
          <div className="flex items-center gap-1 bg-surface-container-lowest p-1 rounded-lg border border-surface-container-high/40">
            <button
              type="button"
              onClick={() => setViewMode("days")}
              className={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${
                viewMode === "days"
                  ? "bg-surface-dark-elevated text-primary-container shadow-sm"
                  : "text-slate-muted hover:text-pure-white"
              }`}
            >
              Days View
            </button>
            <button
              type="button"
              onClick={() => setViewMode("pct")}
              className={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${
                viewMode === "pct"
                  ? "bg-surface-dark-elevated text-primary-container shadow-sm"
                  : "text-slate-muted hover:text-pure-white"
              }`}
            >
              Percentage View
            </button>
          </div>
        </div>

        {/* Segmented Proportional Bar */}
        <div className="relative w-full mb-space-lg">
          <div className="w-full h-8 bg-surface-container-lowest rounded-lg overflow-hidden flex gap-1 p-1 shadow-inner border border-surface-container-high/30">
            {metrics.stages.map((stage) => (
              <div
                key={stage.id}
                className={`h-full ${stage.colorClass} rounded group relative transition-transform hover:brightness-110 cursor-pointer`}
                style={{ width: `${stage.pct}%` }}
                title={`${stage.name}: ${stage.days} Days (${stage.pct}%)`}
              >
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:flex flex-col items-center z-30 pointer-events-none">
                  <div className="bg-surface-dark-elevated text-pure-white p-2 rounded-lg shadow-xl text-xs whitespace-nowrap border border-surface-container-high/60">
                    <span className="font-bold">{stage.name}</span> • {stage.days} Days ({stage.pct}%)
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Segment Breakdown Legend / Data Chips */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-space-md">
          {metrics.stages.map((stage) => (
            <div
              key={stage.id}
              className="flex flex-col p-space-sm rounded-lg bg-surface-container-lowest/60 border border-surface-container-high/30"
            >
              <div className="flex items-center gap-space-xs mb-1">
                <div className={`w-2.5 h-2.5 rounded-sm ${stage.colorClass}`} />
                <span className="text-xs text-pure-white truncate font-medium">
                  {stage.name}
                </span>
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-base sm:text-lg font-bold text-pure-white font-mono">
                  {viewMode === "days" ? `${stage.days} Days` : `${stage.pct}%`}
                </span>
                <span className="text-xs text-slate-muted">
                  {viewMode === "days" ? `${stage.pct}%` : `${stage.days}d`}
                </span>
              </div>
              <span className="text-[11px] text-slate-muted truncate mt-0.5">
                {stage.description}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* In-Depth Stage-by-Stage Metric Table */}
      <div className="bg-surface-dark rounded-xl p-space-lg shadow-md mb-space-xl overflow-x-auto border border-surface-container-high/40">
        <div className="flex items-center justify-between mb-space-md">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-pure-white">
              Lending Gate Operational Benchmarks
            </h3>
            <p className="text-xs text-slate-muted mt-1">
              Variance attribution against internal target SLAs and functional owner accountability matrix
            </p>
          </div>
          <span className="hidden sm:inline text-xs text-slate-muted">
            Classification: Confirmed Working Days
          </span>
        </div>

        <div className="w-full min-w-[760px]">
          <div className="grid grid-cols-12 gap-space-sm px-space-md py-space-sm bg-surface-container-lowest rounded-lg text-xs font-semibold text-slate-muted uppercase tracking-wider mb-space-xs border border-surface-container-high/30">
            <div className="col-span-3">Gate Identifier &amp; Workflow</div>
            <div className="col-span-3">Functional Owner</div>
            <div className="col-span-2 text-right">Current Median</div>
            <div className="col-span-2 text-right">Target SLA</div>
            <div className="col-span-2 text-right">Attribution Variance</div>
          </div>

          <div className="divide-y divide-surface-container-high/30">
            {metrics.stages.map((stage) => (
              <div
                key={stage.id}
                className="grid grid-cols-12 gap-space-sm px-space-md py-3 items-center hover:bg-surface-container-low/60 transition-colors text-xs sm:text-sm"
              >
                <div className="col-span-3 font-semibold text-pure-white flex items-center gap-2">
                  <div className={`w-2.5 h-2.5 rounded-sm ${stage.colorClass} shrink-0`} />
                  <span>{stage.name}</span>
                </div>
                <div className="col-span-3 text-slate-muted">{stage.owner}</div>
                <div className="col-span-2 text-right font-mono font-bold text-pure-white">
                  {stage.days.toFixed(1)} Days
                </div>
                <div className="col-span-2 text-right font-mono text-slate-muted">
                  {stage.targetSlaDays.toFixed(1)} Days
                </div>
                <div className="col-span-2 text-right">
                  <span
                    className={`inline-flex items-center gap-1 font-semibold text-xs px-2 py-0.5 rounded ${
                      stage.varianceDays === 0
                        ? "text-primary-container bg-primary-container/10"
                        : "text-tertiary-fixed-dim bg-tertiary-container/10"
                    }`}
                  >
                    {stage.varianceLabel}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Operational Policy Governance Footer */}
      <div className="p-space-md rounded-xl bg-surface-container-low shadow-sm flex items-start gap-space-sm text-slate-muted border border-surface-container-high/30">
        <span className="material-symbols-outlined text-[20px] text-primary-container shrink-0 mt-0.5">
          gavel
        </span>
        <div className="flex flex-col">
          <span className="text-xs uppercase tracking-wider text-pure-white font-semibold">
            Institutional Discretion Directive
          </span>
          <p className="text-xs text-slate-muted leading-relaxed mt-0.5">
            Internal telemetry tracking only. No automated approval or rejection algorithms are deployed. All underwriting discretion adheres strictly to the credit policy manual. Stage durations reflect operational measurements across corporate portfolio tiers.
          </p>
        </div>
      </div>
    </div>
  );
}
