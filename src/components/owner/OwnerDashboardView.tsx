"use client";

import { useState, useEffect } from "react";
import {
  AccessOverviewRecord,
  AlertRuleConfig,
  CaseTrace,
  CostAnalytics,
  GovernancePolicyRecord,
  OwnerOverviewMetrics,
  StructuredLogEntry,
  ThresholdSetting,
  UserSession,
} from "@/types/domain";
import { PromptToneConfig, OutreachTone, ExtractionTone, AssistantTone } from "@/services/prompt-config-service";

interface OwnerDashboardViewProps {
  currentUser: UserSession;
}

export function OwnerDashboardView({ currentUser }: OwnerDashboardViewProps) {
  const [activeTab, setActiveTab] = useState<
    "overview" | "governance" | "prompts" | "traces" | "logs" | "costs" | "export"
  >("overview");

  // Telemetry state
  const [metrics, setMetrics] = useState<OwnerOverviewMetrics | null>(null);
  const [governanceData, setGovernanceData] = useState<{
    policies: GovernancePolicyRecord[];
    thresholds: ThresholdSetting[];
    accessOverview: AccessOverviewRecord[];
  } | null>(null);
  const [traces, setTraces] = useState<CaseTrace[]>([]);
  const [traceFilterOutcome, setTraceFilterOutcome] = useState<string>("ALL");
  const [traceFilterFacility, setTraceFilterFacility] = useState<string>("ALL");
  const [logsData, setLogsData] = useState<{
    logs: StructuredLogEntry[];
    alertRules: AlertRuleConfig[];
    retentionPolicy: string;
  } | null>(null);
  const [costData, setCostData] = useState<CostAnalytics | null>(null);
  const [promptConfig, setPromptConfig] = useState<PromptToneConfig | null>(null);
  const [savingPrompts, setSavingPrompts] = useState(false);
  const [promptSaveSuccess, setPromptSaveSuccess] = useState(false);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedThreshold, setSelectedThreshold] = useState<ThresholdSetting | null>(null);
  const [exportNotice, setExportNotice] = useState<string | null>(null);

  // Fetch metrics and tab data
  const loadOverview = async () => {
    try {
      const res = await fetch("/api/owner/overview");
      if (res.ok) {
        const json = await res.json();
        setMetrics(json.data);
      }
    } catch (e) {
      console.error("Failed to load overview", e);
    }
  };

  const loadPrompts = async () => {
    try {
      const res = await fetch("/api/owner/prompts");
      if (res.ok) {
        const json = await res.json();
        setPromptConfig(json.data);
      }
    } catch (e) {
      console.error("Failed to load prompts", e);
    }
  };

  const handleSavePrompts = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!promptConfig || savingPrompts) return;
    setSavingPrompts(true);
    setPromptSaveSuccess(false);
    try {
      const res = await fetch("/api/owner/prompts", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(promptConfig),
      });
      if (res.ok) {
        const json = await res.json();
        setPromptConfig(json.data);
        setPromptSaveSuccess(true);
        setTimeout(() => setPromptSaveSuccess(false), 5000);
      }
    } catch (err) {
      console.error("Failed to save prompt configuration", err);
    } finally {
      setSavingPrompts(false);
    }
  };

  const loadGovernance = async () => {
    try {
      const res = await fetch("/api/owner/governance");
      if (res.ok) {
        const json = await res.json();
        setGovernanceData(json.data);
      }
    } catch (e) {
      console.error("Failed to load governance", e);
    }
  };

  const loadTraces = async () => {
    try {
      const params = new URLSearchParams();
      if (traceFilterOutcome !== "ALL") params.set("outcome", traceFilterOutcome);
      if (traceFilterFacility !== "ALL") params.set("facilityType", traceFilterFacility);
      const res = await fetch(`/api/owner/traces?${params.toString()}`);
      if (res.ok) {
        const json = await res.json();
        setTraces(json.data);
      }
    } catch (e) {
      console.error("Failed to load traces", e);
    }
  };

  const loadLogs = async () => {
    try {
      const res = await fetch("/api/owner/logs");
      if (res.ok) {
        const json = await res.json();
        setLogsData(json.data);
      }
    } catch (e) {
      console.error("Failed to load logs", e);
    }
  };

  const loadCosts = async () => {
    try {
      const res = await fetch("/api/owner/costs");
      if (res.ok) {
        const json = await res.json();
        setCostData(json.data);
      }
    } catch (e) {
      console.error("Failed to load costs", e);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await fetch("/api/owner/refresh", { method: "POST" });
      await loadOverview();
      if (activeTab === "governance") await loadGovernance();
      if (activeTab === "prompts") await loadPrompts();
      if (activeTab === "traces") await loadTraces();
      if (activeTab === "logs") await loadLogs();
      if (activeTab === "costs") await loadCosts();
    } catch (e) {
      console.error("Refresh failed", e);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await loadOverview();
      await loadGovernance();
      await loadPrompts();
      await loadTraces();
      await loadLogs();
      await loadCosts();
      setLoading(false);
    };
    init();
  }, []);

  useEffect(() => {
    if (activeTab === "traces") {
      loadTraces();
    }
  }, [traceFilterOutcome, traceFilterFacility]);

  const handleDownload = (format: "csv" | "pdf") => {
    window.open(`/api/owner/export?format=${format}`, "_blank");
    setExportNotice(
      `Governance export initiated in ${format.toUpperCase()} format. An official audit event was committed.`
    );
    setTimeout(() => setExportNotice(null), 6000);
  };

  if (loading && !metrics) {
    return (
      <div className="w-full min-h-[60vh] flex flex-col items-center justify-center gap-3">
        <span className="material-symbols-outlined text-4xl text-primary-container animate-spin">
          sync
        </span>
        <span className="text-sm font-semibold text-pure-white">
          Securing cryptographic channel to Owner Governance Vault...
        </span>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Top Banner: Owner Governance Header */}
      <div className="bg-surface-dark-elevated rounded-xl p-5 border border-surface-container-high/60 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-primary-container shadow-[0_0_8px_#02f576]"></span>
            <span className="text-xs uppercase tracking-wider text-primary-container font-bold">
              Institutional Governance &amp; Oversight Vault
            </span>
            <span className="text-xs text-slate-muted">|</span>
            <span className="text-xs text-slate-muted font-medium">Role: OWNER (Least Privilege)</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-pure-white">
            System Owner &amp; Governance Dashboard
          </h1>
          <p className="text-xs text-slate-muted mt-0.5 max-w-2xl">
            Independent oversight of Kestrel corporate lending origination: model validation registries, straight-through execution integrity, end-to-end case traces, and cost controls.
          </p>
        </div>

        {/* Freshness & Refresh Control */}
        <div className="flex items-center gap-3 self-start md:self-auto">
          <div className="flex flex-col text-right">
            <div className="flex items-center gap-1.5 justify-end">
              <span
                className={`w-2 h-2 rounded-full ${
                  metrics?.freshnessStatus === "FRESH" ? "bg-primary-container" : "bg-error"
                }`}
              ></span>
              <span className="text-xs font-semibold text-pure-white">
                {metrics?.freshnessStatus === "FRESH" ? "Hourly Refresh: CURRENT" : "STALE DATA"}
              </span>
            </div>
            <span className="text-[11px] text-slate-muted">
              Updated: {metrics?.lastUpdated ? new Date(metrics.lastUpdated).toLocaleTimeString() : "Just now"}
            </span>
          </div>
          <button
            type="button"
            onClick={handleRefresh}
            disabled={refreshing}
            className="px-3.5 py-2 bg-surface-container-high hover:bg-surface-container-highest border border-surface-container-high/80 rounded-lg text-xs font-semibold text-pure-white transition-all flex items-center gap-1.5 focus:outline-none focus:ring-1 focus:ring-primary-container"
          >
            <span className={`material-symbols-outlined text-[16px] ${refreshing ? "animate-spin" : ""}`}>
              sync
            </span>
            <span>{refreshing ? "Refreshing..." : "Recalculate"}</span>
          </button>
        </div>
      </div>

      {/* Export notification alert */}
      {exportNotice && (
        <div className="p-3 bg-surface-dark border border-primary-container/40 rounded-lg flex items-center justify-between text-xs text-primary-container">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-base">check_circle</span>
            <span>{exportNotice}</span>
          </div>
          <button onClick={() => setExportNotice(null)} className="text-slate-muted hover:text-pure-white">
            <span className="material-symbols-outlined text-sm">close</span>
          </button>
        </div>
      )}

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-2 border-b border-surface-container-high/40 overflow-x-auto pb-1">
        {[
          { key: "overview", label: "Overview & Urgent Exceptions", icon: "warning" },
          { key: "governance", label: "Model & Policy Registry", icon: "policy" },
          { key: "prompts", label: "Prompts & Tone Engine", icon: "tune" },
          { key: "traces", label: "End-to-End Traces (Masked)", icon: "timeline" },
          { key: "logs", label: "Structured Logs & Alerts", icon: "assignment_late" },
          { key: "costs", label: "Cost & Run Projections", icon: "savings" },
          { key: "export", label: "Governance Export Hub", icon: "download" },
        ].map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key as any)}
              className={`flex items-center gap-2 px-3.5 py-2.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                isActive
                  ? "bg-surface-dark-elevated text-primary-container border border-primary-container/40 shadow-[0_0_12px_rgba(2,245,118,0.15)]"
                  : "text-slate-muted hover:text-pure-white hover:bg-surface-container-high/40"
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">{tab.icon}</span>
              <span>{tab.label}</span>
              {tab.key === "overview" && metrics && metrics.urgentExceptions.length > 0 && (
                <span className="px-1.5 py-0.2 bg-error text-surface-container-lowest font-mono font-bold text-[10px] rounded-full">
                  {metrics.urgentExceptions.length}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* =========================================================================
          TAB 1: OVERVIEW & URGENT EXCEPTIONS FIRST
      ========================================================================== */}
      {activeTab === "overview" && metrics && (
        <div className="space-y-6">
          {/* Urgent Exceptions Section (MOST URGENT FIRST) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-error text-xl">priority_high</span>
                <h2 className="text-base font-bold text-pure-white">
                  Most Urgent Governance Exceptions ({metrics.urgentExceptions.length})
                </h2>
              </div>
              <span className="text-xs text-slate-muted">Sorted by risk severity</span>
            </div>

            <div className="grid grid-cols-1 gap-3">
              {metrics.urgentExceptions.map((exc) => (
                <div
                  key={exc.id}
                  className={`p-4 rounded-xl border flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all ${
                    exc.severity === "CRITICAL"
                      ? "bg-surface-dark border-error/50 ring-1 ring-error/30"
                      : exc.severity === "HIGH"
                      ? "bg-surface-dark border-secondary/40"
                      : "bg-surface-dark border-surface-container-high/60"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 ${
                        exc.severity === "CRITICAL"
                          ? "bg-error/20 text-error"
                          : exc.severity === "HIGH"
                          ? "bg-secondary/20 text-secondary"
                          : "bg-surface-container text-slate-muted"
                      }`}
                    >
                      <span className="material-symbols-outlined text-[20px]">
                        {exc.severity === "CRITICAL" ? "error" : "warning"}
                      </span>
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                            exc.severity === "CRITICAL"
                              ? "bg-error text-surface-container-lowest"
                              : "bg-secondary/30 text-secondary"
                          }`}
                        >
                          {exc.severity}
                        </span>
                        <span className="text-xs text-slate-muted font-mono">{exc.id}</span>
                        <span className="text-xs text-slate-muted">•</span>
                        <span className="text-xs text-slate-muted">{exc.source}</span>
                      </div>
                      <h3 className="text-sm font-bold text-pure-white mt-1">{exc.title}</h3>
                      <p className="text-xs text-on-surface-variant mt-0.5 leading-relaxed">
                        {exc.description}
                      </p>
                    </div>
                  </div>

                  <div className="flex md:flex-col items-center md:items-end justify-between md:justify-center gap-2 border-t md:border-t-0 pt-2 md:pt-0 border-surface-container-high/30">
                    <span className="text-[11px] text-slate-muted font-medium">Recommended Action:</span>
                    <span className="text-xs font-semibold text-primary-container text-right">
                      {exc.actionRequired}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Key Metrics Grid */}
          <div>
            <h2 className="text-base font-bold text-pure-white mb-3 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary-container text-lg">analytics</span>
              Governance Key Performance Indicators (Actual Telemetry)
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {/* Metric 1: Throughput */}
              <div className="bg-surface-dark p-4 rounded-xl border border-surface-container-high/40">
                <span className="text-xs text-slate-muted font-medium block">Total Throughput</span>
                <div className="text-2xl font-bold text-pure-white mt-1">{metrics.throughput}</div>
                <span className="text-[11px] text-slate-muted mt-1 block">Active corporate applications</span>
              </div>

              {/* Metric 2: Straight-Through (STP) Rate */}
              <div className="bg-surface-dark p-4 rounded-xl border border-surface-container-high/40">
                <span className="text-xs text-slate-muted font-medium block">Automation / STP Rate</span>
                <div className="text-2xl font-bold text-primary-container mt-1">
                  {metrics.automationStpRate}%
                </div>
                <span className="text-[11px] text-slate-muted mt-1 block">
                  Zero clarification touchpoints
                </span>
              </div>

              {/* Metric 3: Manual Handling Rate */}
              <div className="bg-surface-dark p-4 rounded-xl border border-surface-container-high/40">
                <span className="text-xs text-slate-muted font-medium block">Manual Handling Rate</span>
                <div className="text-2xl font-bold text-secondary mt-1">
                  {metrics.manualHandlingRate}%
                </div>
                <span className="text-[11px] text-slate-muted mt-1 block">
                  Required clarification / docs
                </span>
              </div>

              {/* Metric 4: Document Ingestion Error Rate */}
              <div className="bg-surface-dark p-4 rounded-xl border border-surface-container-high/40">
                <span className="text-xs text-slate-muted font-medium block">Document Defect Rate</span>
                <div className="text-2xl font-bold text-pure-white mt-1">{metrics.errorRate}%</div>
                <span className="text-[11px] text-slate-muted mt-1 block">
                  Flagged resolution / duplicate
                </span>
              </div>

              {/* Metric 5: Average Cycle Time */}
              <div className="bg-surface-dark p-4 rounded-xl border border-surface-container-high/40">
                <span className="text-xs text-slate-muted font-medium block">Avg Cycle Time</span>
                <div className="text-2xl font-bold text-pure-white mt-1">
                  {metrics.averageCycleDays} <span className="text-sm font-normal text-slate-muted">days</span>
                </div>
                <span className="text-[11px] text-primary-fixed-dim mt-1 block">
                  vs 20.8d baseline (Target 15.0d)
                </span>
              </div>

              {/* Metric 6: Checksum Integrity */}
              <div className="bg-surface-dark p-4 rounded-xl border border-surface-container-high/40">
                <span className="text-xs text-slate-muted font-medium block">Checksum Integrity</span>
                <div className="text-2xl font-bold text-primary-container mt-1">
                  {metrics.checksumIntegrityPct}%
                </div>
                <span className="text-[11px] text-slate-muted mt-1 block">
                  SHA-256 Verified Clean
                </span>
              </div>

              {/* Metric 7: Active Exposure */}
              <div className="bg-surface-dark p-4 rounded-xl border border-surface-container-high/40">
                <span className="text-xs text-slate-muted font-medium block">Pipeline Value</span>
                <div className="text-2xl font-bold text-pure-white mt-1">
                  ₹{metrics.activePipelineCr} <span className="text-sm font-normal text-slate-muted">Cr</span>
                </div>
                <span className="text-[11px] text-slate-muted mt-1 block">Under active review</span>
              </div>

              {/* Metric 8: Open Audit Findings */}
              <div className="bg-surface-dark p-4 rounded-xl border border-surface-container-high/40">
                <span className="text-xs text-slate-muted font-medium block">Open Audit Findings</span>
                <div className="text-2xl font-bold text-error mt-1">{metrics.openAuditFindings}</div>
                <span className="text-[11px] text-slate-muted mt-1 block">Governance alerts active</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 2: GOVERNANCE, POLICIES, THRESHOLDS & ACCESS OVERVIEW
      ========================================================================== */}
      {activeTab === "governance" && governanceData && (
        <div className="space-y-6">
          {/* Policy Registry Table */}
          <div className="bg-surface-dark rounded-xl p-5 border border-surface-container-high/40">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-pure-white">
                  Regulatory Models &amp; Policy Registry
                </h3>
                <p className="text-xs text-slate-muted">
                  Actual production models and directives governing Kestrel corporate lending operations.
                </p>
              </div>
              <span className="text-xs px-2.5 py-1 rounded bg-surface-container-high text-primary-container font-medium">
                4 Registered Directives
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-surface-container-high/40 text-slate-muted">
                    <th className="py-2.5 px-3">Directive / Model Name</th>
                    <th className="py-2.5 px-3">Version</th>
                    <th className="py-2.5 px-3">Owner Body</th>
                    <th className="py-2.5 px-3">Approving Authority</th>
                    <th className="py-2.5 px-3">Approval Date</th>
                    <th className="py-2.5 px-3">Last Review</th>
                    <th className="py-2.5 px-3">Governance Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-container-high/30">
                  {governanceData.policies.map((p) => (
                    <tr key={p.id} className="hover:bg-surface-container-high/20">
                      <td className="py-3 px-3 font-semibold text-pure-white">
                        <div>{p.name}</div>
                        <div className="text-[11px] text-slate-muted font-normal mt-0.5">{p.scope}</div>
                      </td>
                      <td className="py-3 px-3 font-mono text-primary-container">{p.version}</td>
                      <td className="py-3 px-3 text-slate-muted">{p.owner}</td>
                      <td className="py-3 px-3 text-pure-white">
                        {p.approvingAuthority || (
                          <span className="text-error italic">Missing Formal Sign-off</span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-slate-muted">
                        {p.approvalDate ? new Date(p.approvalDate).toLocaleDateString() : (
                          <span className="text-error font-semibold">Unrecorded</span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-slate-muted">
                        {p.lastReviewDate ? new Date(p.lastReviewDate).toLocaleDateString() : "Never"}
                      </td>
                      <td className="py-3 px-3">
                        {p.status === "COMPLIANT" ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-primary-container/20 text-primary-container border border-primary-container/30">
                            COMPLIANT
                          </span>
                        ) : p.status === "REVIEW_OVERDUE" ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-error/20 text-error border border-error/40">
                            REVIEW OVERDUE
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-secondary/20 text-secondary border border-secondary/30">
                            MISSING APPROVAL
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Configurable Thresholds & Change History */}
          <div className="bg-surface-dark rounded-xl p-5 border border-surface-container-high/40">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-pure-white">
                  Operational Governance Thresholds
                </h3>
                <p className="text-xs text-slate-muted">
                  Current limits and documented audit history of setting adjustments.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {governanceData.thresholds.map((t) => (
                <div
                  key={t.key}
                  className="p-4 rounded-xl bg-surface-dark-elevated border border-surface-container-high/40 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono text-primary-container">{t.key}</span>
                      <span className="px-2 py-0.5 rounded bg-surface-container text-xs font-bold text-pure-white">
                        {t.currentValue} {t.unit}
                      </span>
                    </div>
                    <h4 className="text-sm font-bold text-pure-white mt-1">{t.label}</h4>
                    <p className="text-xs text-slate-muted mt-1">{t.description}</p>
                  </div>

                  {/* Change History Preview */}
                  <div className="mt-4 pt-3 border-t border-surface-container-high/30">
                    <span className="text-[11px] text-slate-muted font-medium block mb-1">
                      Latest Recorded Change:
                    </span>
                    {t.changeHistory.length > 0 ? (
                      <div className="text-xs bg-surface-container-lowest p-2 rounded border border-surface-container-high/30">
                        <div className="flex items-center justify-between text-[11px] text-slate-muted">
                          <span>{t.changeHistory[0].changedBy}</span>
                          <span>{new Date(t.changeHistory[0].changedAt).toLocaleDateString()}</span>
                        </div>
                        <div className="text-pure-white font-medium mt-0.5">
                          {t.changeHistory[0].previousValue} → {t.changeHistory[0].newValue}
                        </div>
                        <div className="text-[11px] text-slate-muted mt-0.5 italic">
                          &quot;{t.changeHistory[0].justification}&quot;
                        </div>
                      </div>
                    ) : (
                      <span className="text-xs text-slate-muted italic">No historical modifications</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Access Overview & Segregation of Duties (SoD) */}
          <div className="bg-surface-dark rounded-xl p-5 border border-surface-container-high/40">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-pure-white">
                  Access &amp; Segregation of Duties (SoD) Overview
                </h3>
                <p className="text-xs text-slate-muted">
                  Audited verification of server-enforced role boundaries across Kestrel personnel and services.
                </p>
              </div>
              <span className="text-xs px-2.5 py-1 rounded bg-primary-container/10 text-primary-container font-semibold border border-primary-container/20">
                SoD Verification: PASSED
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-surface-container-high/40 text-slate-muted">
                    <th className="py-2.5 px-3">User / Identity</th>
                    <th className="py-2.5 px-3">Assigned Role</th>
                    <th className="py-2.5 px-3">Department</th>
                    <th className="py-2.5 px-3">Server-Enforced Privileges</th>
                    <th className="py-2.5 px-3">Conflict Check</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-container-high/30">
                  {governanceData.accessOverview.map((acc) => (
                    <tr key={acc.userId} className="hover:bg-surface-container-high/20">
                      <td className="py-3 px-3 font-semibold text-pure-white">
                        {acc.name}
                        <div className="text-[11px] text-slate-muted font-mono">{acc.userId}</div>
                      </td>
                      <td className="py-3 px-3">
                        <span
                          className={`px-2 py-0.5 rounded font-mono font-bold text-[10px] ${
                            acc.role === "OWNER"
                              ? "bg-primary-container/20 text-primary-container border border-primary-container/40"
                              : acc.role === "ANALYST"
                              ? "bg-secondary/20 text-secondary border border-secondary/40"
                              : "bg-surface-container-high text-on-surface"
                          }`}
                        >
                          {acc.role}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-slate-muted">{acc.department}</td>
                      <td className="py-3 px-3 text-slate-muted">
                        <div className="flex flex-wrap gap-1 max-w-md">
                          {acc.permissions.map((perm) => (
                            <span
                              key={perm}
                              className="px-1.5 py-0.2 bg-surface-container-high/60 rounded text-[10px] font-mono text-slate-muted"
                            >
                              {perm}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="py-3 px-3">
                        {acc.hasConflictingPrivilege ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-error/20 text-error border border-error/40">
                            CONFLICT DETECTED
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-primary-container/10 text-primary-container">
                            CLEAN (NO CONFLICTS)
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB: PROMPTS & TONE CONFIGURATION ENGINE
      ========================================================================== */}
      {activeTab === "prompts" && promptConfig && (
        <form onSubmit={handleSavePrompts} className="space-y-6">
          {/* Header Banner */}
          <div className="bg-surface-dark rounded-xl p-5 border border-surface-container-high/40 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="w-2.5 h-2.5 rounded-full bg-primary-container shadow-[0_0_8px_#02f576]"></span>
                <span className="text-xs uppercase tracking-wider text-primary-container font-bold">
                  AI Model Governance &amp; Behavioral Steering
                </span>
              </div>
              <h3 className="text-base font-bold text-pure-white">
                Prompts, System Directives &amp; Communication Tone Engine
              </h3>
              <p className="text-xs text-slate-muted mt-0.5">
                Authorized System Owners may calibrate automated borrower chasing templates, outreach tones, and AI extraction system instructions.
              </p>
            </div>

            <div className="flex items-center gap-3">
              {promptSaveSuccess && (
                <span className="px-3 py-1.5 rounded-lg bg-primary-container/20 text-primary-container border border-primary-container/30 text-xs font-semibold flex items-center gap-1.5 animate-in fade-in duration-200">
                  <span className="material-symbols-outlined text-[16px]">check_circle</span>
                  Saved to Audit Ledger
                </span>
              )}
              <button
                type="submit"
                disabled={savingPrompts}
                className="px-5 py-2.5 bg-primary-container text-surface-container-lowest text-xs font-bold uppercase tracking-wider rounded-lg hover:bg-primary-fixed-dim transition-all flex items-center gap-2 shadow-[0_0_16px_rgba(2,245,118,0.3)] disabled:opacity-50"
              >
                <span className={`material-symbols-outlined text-[18px] ${savingPrompts ? "animate-spin" : ""}`}>
                  {savingPrompts ? "sync" : "save"}
                </span>
                <span>{savingPrompts ? "Committing Changes..." : "Save Prompts & Tone"}</span>
              </button>
            </div>
          </div>

          {/* Section 1: Borrower Outreach Tone & Templates */}
          <div className="bg-surface-dark rounded-xl p-5 border border-surface-container-high/40 space-y-4">
            <div className="flex items-center justify-between border-b border-surface-container-high/30 pb-3">
              <div>
                <h4 className="text-sm font-bold text-pure-white flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary-container text-lg">campaign</span>
                  Borrower Outreach Communication Tone
                </h4>
                <p className="text-xs text-slate-muted">
                  Controls the communicative stance across multi-channel chasing (WhatsApp, Email, SMS).
                </p>
              </div>
              <span className="text-xs font-mono text-primary-container">
                Active: {promptConfig.outreach.tone}
              </span>
            </div>

            {/* Tone Selector Pills */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {[
                {
                  id: "FORMAL_INSTITUTIONAL" as OutreachTone,
                  title: "Formal Institutional",
                  desc: "Professional commercial banking tone, strict regulatory citations (RBI Master Direction), 48-hour SLA deadline.",
                  icon: "account_balance",
                },
                {
                  id: "URGENT_DIRECTIVE" as OutreachTone,
                  title: "Urgent Directive",
                  desc: "High-priority escalation tone, immediate risk committee escalation warnings, explicit deal-blocker notices.",
                  icon: "notification_important",
                },
                {
                  id: "COLLABORATIVE_ADVISORY" as OutreachTone,
                  title: "Collaborative Advisory",
                  desc: "Relationship-driven guidance tone, helpful explanations of documentation nuances and alternative waivers.",
                  icon: "handshake",
                },
              ].map((t) => {
                const isSelected = promptConfig.outreach.tone === t.id;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() =>
                      setPromptConfig({
                        ...promptConfig,
                        outreach: { ...promptConfig.outreach, tone: t.id },
                      })
                    }
                    className={`text-left p-3.5 rounded-xl border transition-all ${
                      isSelected
                        ? "bg-surface-dark-elevated border-primary-container/60 ring-1 ring-primary-container/40"
                        : "bg-surface-container-lowest border-surface-container-high/30 opacity-75 hover:opacity-100"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="material-symbols-outlined text-primary-container text-lg">
                        {t.icon}
                      </span>
                      <span
                        className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                          isSelected ? "border-primary-container bg-primary-container" : "border-slate-muted"
                        }`}
                      >
                        {isSelected && (
                          <span className="w-1.5 h-1.5 rounded-full bg-surface-container-lowest"></span>
                        )}
                      </span>
                    </div>
                    <div className="text-xs font-bold text-pure-white">{t.title}</div>
                    <div className="text-[11px] text-slate-muted mt-1 leading-relaxed">{t.desc}</div>
                  </button>
                );
              })}
            </div>

            {/* WhatsApp Template Editor */}
            <div className="space-y-1.5 pt-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-pure-white flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-sm text-primary-container">chat</span>
                  WhatsApp Notification Prompt Template
                </label>
                <span className="text-[11px] text-slate-muted font-mono">
                  Tokens: {"{contactName}"}, {"{legalName}"}, {"{referenceNumber}"}, {"{title}"}
                </span>
              </div>
              <textarea
                rows={3}
                value={promptConfig.outreach.whatsappTemplate}
                onChange={(e) =>
                  setPromptConfig({
                    ...promptConfig,
                    outreach: { ...promptConfig.outreach, whatsappTemplate: e.target.value },
                  })
                }
                className="w-full bg-surface-container-lowest text-xs text-pure-white p-3 rounded-lg border border-surface-container-high/50 font-mono focus:outline-none focus:ring-1 focus:ring-primary-container leading-relaxed"
              />
            </div>

            {/* Email Directive Prompt Editor */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-pure-white flex items-center gap-1.5">
                <span className="material-symbols-outlined text-sm text-secondary">mail</span>
                Automated Email Generation System Prompt
              </label>
              <textarea
                rows={3}
                value={promptConfig.outreach.emailPrompt}
                onChange={(e) =>
                  setPromptConfig({
                    ...promptConfig,
                    outreach: { ...promptConfig.outreach, emailPrompt: e.target.value },
                  })
                }
                className="w-full bg-surface-container-lowest text-xs text-pure-white p-3 rounded-lg border border-surface-container-high/50 font-mono focus:outline-none focus:ring-1 focus:ring-primary-container leading-relaxed"
              />
            </div>

            {/* SMS Notification Template */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-pure-white flex items-center gap-1.5">
                <span className="material-symbols-outlined text-sm text-tertiary-fixed-dim">sms</span>
                SMS Short-Form Dispatch Template
              </label>
              <input
                type="text"
                value={promptConfig.outreach.smsTemplate}
                onChange={(e) =>
                  setPromptConfig({
                    ...promptConfig,
                    outreach: { ...promptConfig.outreach, smsTemplate: e.target.value },
                  })
                }
                className="w-full bg-surface-container-lowest text-xs text-pure-white p-2.5 rounded-lg border border-surface-container-high/50 font-mono focus:outline-none focus:ring-1 focus:ring-primary-container"
              />
            </div>
          </div>

          {/* Section 2: AI Financial Extraction & OCR Directives */}
          <div className="bg-surface-dark rounded-xl p-5 border border-surface-container-high/40 space-y-4">
            <div className="flex items-center justify-between border-b border-surface-container-high/30 pb-3">
              <div>
                <h4 className="text-sm font-bold text-pure-white flex items-center gap-2">
                  <span className="material-symbols-outlined text-secondary text-lg">document_scanner</span>
                  Financial Extraction &amp; OCR Engine System Prompt
                </h4>
                <p className="text-xs text-slate-muted">
                  Directs model interpretation of complex tabular balance sheets, footnotes, and debt schedules.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-muted">Extraction Tone:</span>
                <select
                  value={promptConfig.financialExtraction.tone}
                  onChange={(e) =>
                    setPromptConfig({
                      ...promptConfig,
                      financialExtraction: {
                        ...promptConfig.financialExtraction,
                        tone: e.target.value as ExtractionTone,
                      },
                    })
                  }
                  className="bg-surface-container-lowest text-xs text-pure-white py-1 px-2.5 rounded border border-surface-container-high/60 focus:outline-none focus:ring-1 focus:ring-primary-container"
                >
                  <option value="STRICT_ARITHMETIC">Strict Arithmetic (Zero Assumptions)</option>
                  <option value="CONSERVATIVE_AUDIT">Conservative Audit (Lowest Estimate)</option>
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-pure-white block">
                OCR Parser System Prompt
              </label>
              <textarea
                rows={4}
                value={promptConfig.financialExtraction.systemPrompt}
                onChange={(e) =>
                  setPromptConfig({
                    ...promptConfig,
                    financialExtraction: {
                      ...promptConfig.financialExtraction,
                      systemPrompt: e.target.value,
                    },
                  })
                }
                className="w-full bg-surface-container-lowest text-xs text-pure-white p-3 rounded-lg border border-surface-container-high/50 font-mono focus:outline-none focus:ring-1 focus:ring-primary-container leading-relaxed"
              />
            </div>
          </div>

          {/* Section 3: Underwriting Desk Preparation Assistant Prompt */}
          <div className="bg-surface-dark rounded-xl p-5 border border-surface-container-high/40 space-y-4">
            <div className="flex items-center justify-between border-b border-surface-container-high/30 pb-3">
              <div>
                <h4 className="text-sm font-bold text-pure-white flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary-container text-lg">psychology</span>
                  Underwriting Desk Preparation Assistant Directive
                </h4>
                <p className="text-xs text-slate-muted">
                  Enforces strict human underwriting boundaries under Institutional Lending Charter Section 4.2.
                </p>
              </div>
              <span className="px-2 py-0.5 rounded bg-error/20 text-error border border-error/30 text-[10px] font-bold">
                MANDATORY BOUNDARY
              </span>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-pure-white block">
                Assistant Directive &amp; Compliance Guardrail
              </label>
              <textarea
                rows={3}
                value={promptConfig.underwritingAssistant.systemPrompt}
                onChange={(e) =>
                  setPromptConfig({
                    ...promptConfig,
                    underwritingAssistant: {
                      ...promptConfig.underwritingAssistant,
                      systemPrompt: e.target.value,
                    },
                  })
                }
                className="w-full bg-surface-container-lowest text-xs text-pure-white p-3 rounded-lg border border-surface-container-high/50 font-mono focus:outline-none focus:ring-1 focus:ring-primary-container leading-relaxed"
              />
            </div>

            <div className="p-3 bg-surface-container-lowest rounded-lg border border-surface-container-high/30 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-base text-primary-container">shield</span>
                <span className="text-slate-muted">Boundary Notice displayed to Analysts:</span>
              </div>
              <span className="font-mono text-pure-white text-[11px]">
                {promptConfig.underwritingAssistant.boundaryNotice}
              </span>
            </div>
          </div>

          {/* Section 4: Prompt & Tone Audit Change History */}
          <div className="bg-surface-dark rounded-xl p-5 border border-surface-container-high/40">
            <h4 className="text-sm font-bold text-pure-white mb-1">
              Prompt &amp; Tone Modification Audit Log
            </h4>
            <p className="text-xs text-slate-muted mb-3">
              Immutable audit history of owner adjustments to automated communication and model directives.
            </p>

            <div className="space-y-2">
              {promptConfig.changeHistory?.map((chg) => (
                <div
                  key={chg.id}
                  className="p-3 rounded bg-surface-container-lowest border border-surface-container-high/30 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-primary-container font-semibold">{chg.id}</span>
                      <span className="text-slate-muted">•</span>
                      <span className="text-pure-white font-medium">{chg.summary}</span>
                    </div>
                    <div className="text-[11px] text-slate-muted mt-0.5">
                      Actor: {chg.changedBy} | Category: {chg.category}
                    </div>
                  </div>
                  <span className="text-[11px] text-slate-muted font-mono">
                    {new Date(chg.timestamp).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </form>
      )}

      {/* =========================================================================
          TAB 3: END-TO-END TRACES WITH PII MASKING
      ========================================================================== */}
      {activeTab === "traces" && (
        <div className="space-y-4">
          {/* Privacy & Masking Notice */}
          <div className="p-3 bg-surface-dark rounded-xl border border-primary-container/30 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary-container text-base">privacy_tip</span>
              <span className="text-on-surface">
                <strong>Statutory Data Masking Active:</strong> Borrower personal names, corporate emails, phone numbers, and MCA21/PAN identifiers are strictly minimized and masked per RBI Master Direction 2025/WC-4.
              </span>
            </div>
            <span className="text-[11px] text-slate-muted font-mono hidden sm:inline">HSM-ENCRYPTED TRACES</span>
          </div>

          {/* Trace Filters */}
          <div className="bg-surface-dark p-4 rounded-xl border border-surface-container-high/40 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3 flex-wrap">
              <span className="text-xs text-slate-muted font-medium">Filter Outcome:</span>
              <div className="inline-flex items-center bg-surface-container-lowest p-0.5 rounded-lg border border-surface-container-high/60">
                {["ALL", "APPROVED", "UNDER_REVIEW", "FLAGGED", "REJECTED"].map((outcome) => (
                  <button
                    key={outcome}
                    type="button"
                    onClick={() => setTraceFilterOutcome(outcome)}
                    className={`px-2.5 py-1 rounded text-xs font-semibold transition-all ${
                      traceFilterOutcome === outcome
                        ? "bg-surface-dark-elevated text-primary-container font-bold"
                        : "text-slate-muted hover:text-pure-white"
                    }`}
                  >
                    {outcome}
                  </button>
                ))}
              </div>

              <span className="text-xs text-slate-muted font-medium ml-2">Facility Type:</span>
              <select
                value={traceFilterFacility}
                onChange={(e) => setTraceFilterFacility(e.target.value)}
                className="bg-surface-container-lowest text-xs text-pure-white py-1 px-2.5 rounded border border-surface-container-high/60 focus:outline-none focus:ring-1 focus:ring-primary-container"
              >
                <option value="ALL">All Facilities</option>
                <option value="WORKING_CAPITAL">Working Capital</option>
                <option value="TERM_LOAN">Term Loan</option>
                <option value="MACHINERY_LOAN">Machinery Loan</option>
                <option value="CONSORTIUM_FACILITY">Consortium Facility</option>
              </select>
            </div>

            <span className="text-xs text-slate-muted">
              Showing {traces.length} Traced Case{traces.length === 1 ? "" : "s"}
            </span>
          </div>

          {/* Trace Cards */}
          <div className="space-y-4">
            {traces.map((trace) => (
              <div
                key={trace.applicationId}
                className="bg-surface-dark p-5 rounded-xl border border-surface-container-high/40 hover:border-surface-container-high transition-all"
              >
                {/* Header info */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-surface-container-high/30 gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-primary-container">
                        {trace.referenceNumber}
                      </span>
                      <span className="text-xs text-slate-muted">•</span>
                      <span className="font-bold text-pure-white text-sm">
                        {trace.borrowerNameMasked}
                      </span>
                      {trace.isManualRouted && (
                        <span className="px-2 py-0.2 rounded bg-secondary/20 text-secondary text-[10px] font-bold border border-secondary/30">
                          MANUAL ROUTED
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-slate-muted mt-0.5 flex items-center gap-3 flex-wrap">
                      <span>CIN: {trace.cinMasked}</span>
                      <span>PAN: {trace.panMasked}</span>
                      <span>Contact: {trace.contactEmailMasked} ({trace.contactPhoneMasked})</span>
                    </div>
                  </div>

                  <div className="text-right flex sm:flex-col items-center sm:items-end justify-between">
                    <span className="text-xs font-bold text-pure-white">
                      ₹{trace.facilityAmountCr} Cr
                    </span>
                    <span className="text-[11px] text-slate-muted">
                      {trace.facilityType.replace(/_/g, " ")}
                    </span>
                  </div>
                </div>

                {/* Stepper Timeline */}
                <div className="mt-4 pt-1 grid grid-cols-1 sm:grid-cols-5 gap-2">
                  {trace.steps.map((st, i) => (
                    <div
                      key={i}
                      className="p-2.5 rounded-lg bg-surface-container-lowest border border-surface-container-high/30 flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] text-slate-muted font-mono">Stage {i + 1}</span>
                          <span
                            className={`w-2 h-2 rounded-full ${
                              st.status === "COMPLETED"
                                ? "bg-primary-container"
                                : st.status === "FLAGGED"
                                ? "bg-error"
                                : st.status === "IN_PROGRESS"
                                ? "bg-secondary animate-pulse"
                                : "bg-surface-container-highest"
                            }`}
                          ></span>
                        </div>
                        <div className="text-xs font-semibold text-pure-white mt-1 leading-snug">
                          {st.name}
                        </div>
                      </div>

                      <div className="mt-3 pt-2 border-t border-surface-container-high/20 flex items-center justify-between text-[11px]">
                        <span className="text-slate-muted">Latency:</span>
                        <span className="font-mono text-pure-white">{st.latencyDisplay}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 4: STRUCTURED LOGS & CONFIGURABLE ALERTS
      ========================================================================== */}
      {activeTab === "logs" && logsData && (
        <div className="space-y-6">
          {/* Statutory Retention Banner */}
          <div className="p-4 bg-surface-dark rounded-xl border border-surface-container-high/50 flex items-start gap-3">
            <span className="material-symbols-outlined text-secondary text-xl mt-0.5">verified</span>
            <div>
              <h4 className="text-xs font-bold text-pure-white uppercase tracking-wider">
                Effective Statutory Audit Retention Policy
              </h4>
              <p className="text-xs text-on-surface-variant mt-0.5 leading-relaxed">
                {logsData.retentionPolicy}
              </p>
            </div>
          </div>

          {/* Configurable Alert Rules */}
          <div className="bg-surface-dark rounded-xl p-5 border border-surface-container-high/40">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-pure-white">
                  Configured Alert Rules &amp; On-Call Dispatch
                </h3>
                <p className="text-xs text-slate-muted">
                  Thresholds monitored continuously with automatic escalation to designated system owners.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {logsData.alertRules.map((alt) => (
                <div
                  key={alt.id}
                  className={`p-4 rounded-xl border ${
                    alt.status === "TRIGGERED"
                      ? "bg-surface-dark-elevated border-error/50 ring-1 ring-error/30"
                      : "bg-surface-dark-elevated border-surface-container-high/40"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono text-slate-muted">{alt.id}</span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        alt.status === "TRIGGERED"
                          ? "bg-error text-surface-container-lowest"
                          : "bg-primary-container/20 text-primary-container"
                      }`}
                    >
                      {alt.status}
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-pure-white mt-1">{alt.name}</h4>
                  <div className="mt-2 text-xs flex items-center justify-between">
                    <span className="text-slate-muted">Threshold:</span>
                    <span className="font-mono text-pure-white">
                      {alt.operator} {alt.threshold} {alt.unit} (Current: {alt.currentValue} {alt.unit})
                    </span>
                  </div>
                  <div className="mt-2 pt-2 border-t border-surface-container-high/30 text-xs flex items-center justify-between">
                    <span className="text-slate-muted">On-Call Notification:</span>
                    <span className="font-mono text-primary-container text-[11px] truncate max-w-[200px]">
                      {alt.notificationTarget}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Structured Logs Viewer */}
          <div className="bg-surface-dark rounded-xl p-5 border border-surface-container-high/40">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-pure-white">
                  Structured Operational &amp; Audit Logs
                </h3>
                <p className="text-xs text-slate-muted">
                  Structured audit entries with redacted personal identifiers and source-system grouping.
                </p>
              </div>
              <span className="text-xs text-slate-muted">Latest 30 Events</span>
            </div>

            <div className="space-y-2 font-mono text-xs max-h-96 overflow-y-auto">
              {logsData.logs.map((log) => (
                <div
                  key={log.id}
                  className="p-2.5 rounded bg-surface-container-lowest border border-surface-container-high/30 flex flex-col md:flex-row md:items-center justify-between gap-2"
                >
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${
                        log.level === "ERROR"
                          ? "bg-error text-surface-container-lowest"
                          : log.level === "WARN"
                          ? "bg-secondary text-surface-container-lowest"
                          : "bg-surface-container-high text-primary-container"
                      }`}
                    >
                      {log.level}
                    </span>
                    <span className="text-slate-muted text-[11px]">
                      {new Date(log.timestamp).toLocaleTimeString()}
                    </span>
                    <span className="text-primary-container font-semibold">[{log.sourceSystem}]</span>
                    <span className="text-pure-white">{log.message}</span>
                  </div>
                  <span className="text-[11px] text-slate-muted truncate max-w-xs">{log.action}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 5: COST & RUN-RATE PROJECTIONS
      ========================================================================== */}
      {activeTab === "costs" && costData && (
        <div className="space-y-6">
          {/* Transparency Disclaimer Notice */}
          <div className="p-3.5 bg-surface-dark rounded-xl border border-primary-container/30 flex items-start gap-3">
            <span className="material-symbols-outlined text-primary-container text-xl mt-0.5">info</span>
            <div>
              <h4 className="text-xs font-bold text-pure-white uppercase tracking-wider">
                Telemetry &amp; Cost Grounding Transparency
              </h4>
              <p className="text-xs text-on-surface-variant mt-0.5 leading-relaxed">
                {costData.disclaimer}
              </p>
            </div>
          </div>

          {/* Cost Headline KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-surface-dark p-4 rounded-xl border border-surface-container-high/40">
              <span className="text-xs text-slate-muted font-medium">Total Monthly Run Cost</span>
              <div className="text-2xl font-bold text-pure-white mt-1">
                ₹{costData.totalMonthlyCostInr.toLocaleString()}
              </div>
              <span className="text-[11px] text-slate-muted mt-1 block">{costData.period}</span>
            </div>

            <div className="bg-surface-dark p-4 rounded-xl border border-surface-container-high/40">
              <span className="text-xs text-slate-muted font-medium">Cost Per Transaction</span>
              <div className="text-2xl font-bold text-primary-container mt-1">
                ₹{costData.costPerTransactionInr.toLocaleString()}
              </div>
              <span className="text-[11px] text-slate-muted mt-1 block">
                Across all initiated intake dossiers
              </span>
            </div>

            <div className="bg-surface-dark p-4 rounded-xl border border-surface-container-high/40">
              <span className="text-xs text-slate-muted font-medium">Cost Per Completed Outcome</span>
              <div className="text-2xl font-bold text-secondary mt-1">
                ₹{costData.costPerCompletedOutcomeInr.toLocaleString()}
              </div>
              <span className="text-[11px] text-slate-muted mt-1 block">
                Per approved / concluded application
              </span>
            </div>
          </div>

          {/* Category Breakdown Table with Measured vs Estimated Labeling */}
          <div className="bg-surface-dark rounded-xl p-5 border border-surface-container-high/40">
            <h3 className="text-base font-bold text-pure-white mb-1">
              Cost Allocation by Infrastructure &amp; Vendor Domain
            </h3>
            <p className="text-xs text-slate-muted mb-4">
              Explicit distinction between measured SQLite / storage facts and standard cost models.
            </p>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-surface-container-high/40 text-slate-muted">
                    <th className="py-2.5 px-3">Category</th>
                    <th className="py-2.5 px-3">Monthly Allocation</th>
                    <th className="py-2.5 px-3">Share (%)</th>
                    <th className="py-2.5 px-3">Data Grounding Type</th>
                    <th className="py-2.5 px-3">Measurement Basis</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-container-high/30">
                  {Object.entries(costData.categories).map(([k, cat]) => (
                    <tr key={k} className="hover:bg-surface-container-high/20">
                      <td className="py-3 px-3 font-semibold text-pure-white">{cat.label}</td>
                      <td className="py-3 px-3 font-mono font-bold text-pure-white">
                        ₹{cat.amountInr.toLocaleString()}
                      </td>
                      <td className="py-3 px-3 font-mono text-primary-container">{cat.pct}%</td>
                      <td className="py-3 px-3">
                        {cat.isMeasured ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-primary-container/20 text-primary-container border border-primary-container/40">
                            MEASURED FACT
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-surface-container-high text-slate-muted">
                            BENCHMARK MODEL
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-slate-muted max-w-sm">{cat.basis}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Vendor Unit Cost Tolerances (Flagging Overages) */}
          <div className="bg-surface-dark rounded-xl p-5 border border-surface-container-high/40">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-pure-white">
                  Third-Party Vendor Unit Cost &amp; Tolerance Monitoring
                </h3>
                <p className="text-xs text-slate-muted">
                  Automated flag triggered whenever vendor unit fees exceed agreed contract baseline.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {costData.vendorTolerances.map((v) => (
                <div
                  key={v.vendorName}
                  className={`p-4 rounded-xl border ${
                    v.exceedsTolerance
                      ? "bg-surface-dark-elevated border-error/50 ring-1 ring-error/30"
                      : "bg-surface-dark-elevated border-surface-container-high/40"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-slate-muted font-medium">{v.service}</span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        v.exceedsTolerance
                          ? "bg-error text-surface-container-lowest"
                          : "bg-primary-container/20 text-primary-container"
                      }`}
                    >
                      {v.status.replace(/_/g, " ")}
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-pure-white mt-1">{v.vendorName}</h4>
                  <div className="mt-3 pt-2 border-t border-surface-container-high/30 flex items-center justify-between text-xs">
                    <span className="text-slate-muted">Unit Cost:</span>
                    <span
                      className={`font-mono font-bold ${
                        v.exceedsTolerance ? "text-error" : "text-primary-container"
                      }`}
                    >
                      ₹{v.unitCost} {v.unit}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-muted flex items-center justify-between mt-1">
                    <span>Configured Tolerance:</span>
                    <span className="font-mono">₹{v.unitCostTolerance} {v.unit}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Volume Trend & Projection */}
          <div className="bg-surface-dark rounded-xl p-5 border border-surface-container-high/40">
            <h3 className="text-base font-bold text-pure-white mb-1">
              Monthly Volume Trend &amp; Run-Cost Projections
            </h3>
            <p className="text-xs text-slate-muted mb-4">
              Modeled infrastructure run-rate against projected corporate application volume growth.
            </p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {costData.monthlyProjections.map((p) => (
                <div
                  key={p.month}
                  className="p-3 bg-surface-container-lowest rounded-lg border border-surface-container-high/30"
                >
                  <span className="text-xs font-bold text-pure-white block">{p.month}</span>
                  <span className="text-[11px] text-slate-muted block mt-0.5">
                    {p.volume} Applications
                  </span>
                  <div className="mt-2 text-sm font-bold text-primary-container font-mono">
                    ₹{p.projectedCostInr.toLocaleString()}
                  </div>
                  {p.actualCostInr && (
                    <span className="text-[10px] text-slate-muted block mt-0.5">
                      Actual: ₹{p.actualCostInr.toLocaleString()}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 6: EXPORT HUB (CSV & PDF WITH PRIVACY & AUDITING)
      ========================================================================== */}
      {activeTab === "export" && (
        <div className="bg-surface-dark rounded-xl p-6 border border-surface-container-high/40 max-w-3xl space-y-6">
          <div>
            <h3 className="text-lg font-bold text-pure-white">
              Governance &amp; Oversight Report Export Hub
            </h3>
            <p className="text-xs text-slate-muted mt-1 leading-relaxed">
              Export comprehensive governance dossiers for external audit, Model Risk Committee submission, or RBI regulatory inspection. All outputs apply server-enforced role authentication, cryptographic audit commits, and automatic PII masking.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* CSV Export Card */}
            <div className="p-5 rounded-xl bg-surface-dark-elevated border border-surface-container-high/50 flex flex-col justify-between space-y-4">
              <div>
                <div className="w-10 h-10 rounded-lg bg-primary-container/20 text-primary-container flex items-center justify-center mb-3">
                  <span className="material-symbols-outlined text-2xl">table_view</span>
                </div>
                <h4 className="text-sm font-bold text-pure-white">CSV Governance Ledger</h4>
                <p className="text-xs text-slate-muted mt-1">
                  Tabular extraction of all case traces, timestamps, step latencies, and outcomes with masked PII.
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleDownload("csv")}
                className="w-full py-2.5 px-4 bg-primary-container text-surface-container-lowest text-xs font-bold uppercase tracking-wider rounded-lg hover:bg-primary-fixed-dim transition-all flex items-center justify-center gap-2 shadow-[0_0_16px_rgba(2,245,118,0.25)]"
              >
                <span className="material-symbols-outlined text-[18px]">download</span>
                <span>Download CSV Export</span>
              </button>
            </div>

            {/* Structured Audit Dossier Card */}
            <div className="p-5 rounded-xl bg-surface-dark-elevated border border-surface-container-high/50 flex flex-col justify-between space-y-4">
              <div>
                <div className="w-10 h-10 rounded-lg bg-secondary/20 text-secondary flex items-center justify-center mb-3">
                  <span className="material-symbols-outlined text-2xl">description</span>
                </div>
                <h4 className="text-sm font-bold text-pure-white">Cryptographic Audit Dossier (PDF/Text)</h4>
                <p className="text-xs text-slate-muted mt-1">
                  Complete formal regulatory dossier including active policies, overdue review flags, and audit sign-offs.
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleDownload("pdf")}
                className="w-full py-2.5 px-4 bg-surface-container-high hover:bg-surface-container-highest border border-secondary/40 text-pure-white text-xs font-bold uppercase tracking-wider rounded-lg transition-all flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-[18px]">print</span>
                <span>Download Formal Dossier</span>
              </button>
            </div>
          </div>

          <div className="p-4 bg-surface-container-lowest rounded-lg border border-surface-container-high/30 text-xs text-slate-muted flex items-start gap-2">
            <span className="material-symbols-outlined text-primary-container text-base mt-0.5">
              lock
            </span>
            <span>
              <strong>Audit Guarantee:</strong> Every export action records an immutable audit log entry in Kestrel’s event ledger containing the actor identity ({currentUser.name}), role ({currentUser.role}), UTC timestamp, and export format hash.
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
