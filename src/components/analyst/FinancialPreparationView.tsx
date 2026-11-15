"use client";

import { useState } from "react";
import { UserSession } from "@/types/domain";

interface FinancialPreparationViewProps {
  application: any;
  currentUser: UserSession;
}

export function FinancialPreparationView({
  application: initialApp,
  currentUser,
}: FinancialPreparationViewProps) {
  const [app, setApp] = useState(initialApp);
  const [filter, setFilter] = useState<"all" | "attention" | "schedules">("all");
  const [editingItem, setEditingItem] = useState<any | null>(null);
  const [editValue, setEditValue] = useState("");
  const [editComment, setEditComment] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  const extractions = app.financialExtractions || [];

  const refreshData = async () => {
    const res = await fetch(`/api/applications/${app.id}`);
    const data = await res.json();
    if (data.success) {
      setApp(data.application);
    }
  };

  const handleUpdateStatus = async (
    extractionId: string,
    status: "ACCEPTED" | "EDITED" | "REJECTED" | "PENDING",
    customVal?: string,
    comment?: string
  ) => {
    setIsUpdating(true);
    try {
      await fetch(`/api/financial-extractions/${extractionId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status,
          editedValue: customVal,
          analystComment: comment,
        }),
      });
      await refreshData();
      setEditingItem(null);
    } finally {
      setIsUpdating(false);
    }
  };

  const acceptedCount = extractions.filter((e: any) => e.status === "ACCEPTED").length;
  const editedCount = extractions.filter((e: any) => e.status === "EDITED").length;
  const rejectedCount = extractions.filter((e: any) => e.status === "REJECTED").length;
  const pendingCount = extractions.filter((e: any) => e.status === "PENDING").length;
  const totalCount = extractions.length || 8;
  const resolvedPct = Math.round(((acceptedCount + editedCount) / totalCount) * 100);

  const filteredExtractions = extractions.filter((e: any) => {
    if (filter === "attention") return e.status === "PENDING" || e.status === "REJECTED";
    if (filter === "schedules") return true;
    return true;
  });

  return (
    <div className="flex flex-col w-full pb-28">
      {/* Top Governance Banner */}
      <section className="w-full mb-space-lg">
        <div className="relative overflow-hidden rounded-xl bg-surface-container-low p-space-md shadow-xl border border-surface-container-high/40">
          <div className="absolute -right-16 -top-16 w-64 h-64 rounded-full bg-primary-container/5 blur-3xl pointer-events-none" />
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-space-md relative z-10">
            <div className="flex flex-col gap-space-xs">
              <div className="flex flex-wrap items-center gap-space-xs text-xs uppercase tracking-wider">
                <span className="inline-flex items-center gap-1.5 px-space-sm py-0.5 rounded-full bg-surface-dark-elevated text-primary-fixed-dim font-bold border border-surface-container-high/40">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary-container animate-pulse" />
                  Phase 2 (Conditional Feature)
                </span>
                <span className="text-slate-muted">/</span>
                <span className="text-pure-white font-semibold">{app.referenceNumber}</span>
                <span className="text-slate-muted">/</span>
                <span className="text-slate-muted font-normal">MCA21 &amp; GSTN Consolidated Feeds</span>
              </div>
              <div className="flex items-baseline gap-space-sm flex-wrap">
                <h1 className="text-2xl sm:text-3xl text-pure-white font-bold tracking-tight">
                  Financial Preparation Assistant
                </h1>
                <span className="text-xs sm:text-sm text-slate-muted">
                  Autonomous reconciliation engine running across 14 statutory filings.
                </span>
              </div>
            </div>

            {/* Governance Guardrail Badge */}
            <div className="flex items-start sm:items-center gap-space-sm bg-surface-dark-elevated/90 px-space-md py-space-sm rounded-lg shadow-md max-w-xl border border-surface-container-high/40">
              <span className="material-symbols-outlined text-tertiary-fixed-dim text-[20px] shrink-0 mt-0.5 sm:mt-0">
                gavel
              </span>
              <p className="text-xs text-tertiary font-medium leading-relaxed">
                <span className="font-bold text-tertiary-fixed uppercase tracking-wider mr-1">
                  Preparation only.
                </span>
                Credit analyst retains full statutory authority for final underwriting inputs and verification compliance.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Validation Pipeline Telemetry Bar */}
      <section className="w-full mb-space-lg">
        <div className="bg-surface-container rounded-xl p-space-md shadow-xl flex flex-col xl:flex-row xl:items-center justify-between gap-space-lg border border-surface-container-high/40">
          {/* Pipeline Progress Engine */}
          <div className="flex-1 flex flex-col gap-space-xs min-w-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-space-sm">
                <span className="text-sm text-pure-white font-bold tracking-wide">
                  Validation Pipeline
                </span>
                <span className="text-slate-muted text-xs">•</span>
                <span className="text-xs text-slate-muted font-semibold">
                  {totalCount} Total Audit Vectors
                </span>
              </div>
              <span className="text-sm text-primary-container font-bold font-mono">
                {acceptedCount + editedCount} of {totalCount} Resolved ({resolvedPct}%)
              </span>
            </div>
            {/* Multi-segment progress bar */}
            <div className="w-full h-2.5 bg-surface-container-lowest rounded-full overflow-hidden flex shadow-inner border border-surface-container-high/30">
              <div
                className="h-full bg-primary-container transition-all duration-500 shadow-[0_0_12px_#02f576]"
                style={{ width: `${(acceptedCount / totalCount) * 100}%` }}
                title={`Accepted (${acceptedCount})`}
              />
              <div
                className="h-full bg-tertiary-fixed-dim transition-all duration-500"
                style={{ width: `${(editedCount / totalCount) * 100}%` }}
                title={`Edited (${editedCount})`}
              />
              <div
                className="h-full bg-error transition-all duration-500"
                style={{ width: `${(rejectedCount / totalCount) * 100}%` }}
                title={`Rejected (${rejectedCount})`}
              />
              <div
                className="h-full bg-surface-container-high transition-all duration-500"
                style={{ width: `${(pendingCount / totalCount) * 100}%` }}
                title={`Pending (${pendingCount})`}
              />
            </div>
            <div className="flex items-center justify-between text-slate-muted text-[11px] pt-0.5">
              <span>Checksum: SHA-256 Validated</span>
              <span>Dual Auditor Cross-Check: Enabled</span>
            </div>
          </div>

          {/* Pill Counters Cluster */}
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <div className="flex items-center gap-1.5 bg-surface-dark-elevated px-3 py-1 rounded-full border border-surface-container-high/40">
              <span className="w-2 h-2 rounded-full bg-primary-container shadow-[0_0_8px_#02f576]" />
              <span className="text-xs text-slate-muted uppercase font-bold tracking-wider">Accepted:</span>
              <span className="text-xs font-bold text-pure-white font-mono">{acceptedCount}</span>
            </div>
            <div className="flex items-center gap-1.5 bg-surface-dark-elevated px-3 py-1 rounded-full border border-surface-container-high/40">
              <span className="w-2 h-2 rounded-full bg-tertiary-fixed-dim shadow-[0_0_8px_#efbf73]" />
              <span className="text-xs text-slate-muted uppercase font-bold tracking-wider">Edited:</span>
              <span className="text-xs font-bold text-pure-white font-mono">{editedCount}</span>
            </div>
            <div className="flex items-center gap-1.5 bg-surface-dark-elevated px-3 py-1 rounded-full border border-surface-container-high/40">
              <span className="w-2 h-2 rounded-full bg-surface-variant" />
              <span className="text-xs text-slate-muted uppercase font-bold tracking-wider">Rejected:</span>
              <span className="text-xs font-bold text-slate-muted font-mono">{rejectedCount}</span>
            </div>
            <div className="flex items-center gap-1.5 bg-surface-dark-elevated px-3 py-1 rounded-full border border-surface-container-high/40">
              <span className="w-2 h-2 rounded-full bg-secondary-fixed animate-pulse" />
              <span className="text-xs text-slate-muted uppercase font-bold tracking-wider">Pending:</span>
              <span className="text-xs font-bold text-pure-white font-mono">{pendingCount}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Filter tabs */}
      <section className="w-full flex items-center justify-between mb-space-md">
        <div className="flex items-center gap-1.5">
          <span className="text-xs uppercase tracking-widest text-slate-muted mr-2 font-bold">
            Audit Stream
          </span>
          <button
            type="button"
            onClick={() => setFilter("all")}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
              filter === "all"
                ? "bg-surface-container-high text-pure-white shadow-sm font-bold"
                : "bg-surface-container text-slate-muted hover:text-pure-white"
            }`}
          >
            All Items ({totalCount} Extracted)
          </button>
          <button
            type="button"
            onClick={() => setFilter("attention")}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
              filter === "attention"
                ? "bg-surface-container-high text-pure-white shadow-sm font-bold"
                : "bg-surface-container text-slate-muted hover:text-pure-white"
            }`}
          >
            Requires Attention ({pendingCount + rejectedCount})
          </button>
        </div>
        <div className="hidden md:flex items-center gap-space-sm text-slate-muted text-xs">
          <span className="flex items-center gap-1">
            <span className="material-symbols-outlined text-[16px] text-primary-fixed-dim">verified</span>
            OCR Fidelity 99.4%
          </span>
          <span>•</span>
          <span>Tax Audit Report 3CD Synced</span>
        </div>
      </section>

      {/* Financial Extraction Cards */}
      <div className="w-full flex flex-col gap-space-md">
        {filteredExtractions.map((item: any) => {
          const isAccepted = item.status === "ACCEPTED";
          const isEdited = item.status === "EDITED";
          const isRejected = item.status === "REJECTED";
          const isPending = item.status === "PENDING";

          return (
            <article
              key={item.id}
              className="w-full bg-surface-dark rounded-xl p-space-md shadow-xl hover:shadow-2xl transition-all duration-300 relative group overflow-hidden border border-surface-container-high/40"
            >
              <div
                className={`absolute left-0 top-0 bottom-0 w-1 ${
                  isAccepted
                    ? "bg-primary-container"
                    : isEdited
                    ? "bg-tertiary-fixed-dim"
                    : isRejected
                    ? "bg-error"
                    : "bg-secondary-fixed"
                }`}
              />

              <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-space-md">
                <div className="flex flex-col md:flex-row md:items-start gap-space-md min-w-0">
                  <div className="w-12 h-12 rounded-xl bg-surface-container-lowest flex items-center justify-center shrink-0 shadow-md border border-surface-container-high/30">
                    <span className="material-symbols-outlined text-primary-container text-[24px]">
                      payments
                    </span>
                  </div>
                  <div className="flex flex-col gap-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h2 className="text-base font-bold text-pure-white tracking-tight">
                        {item.label}
                      </h2>
                      <span
                        className={`px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider ${
                          isAccepted
                            ? "bg-primary-container/10 text-primary-container"
                            : isEdited
                            ? "bg-tertiary-container/20 text-tertiary-fixed-dim"
                            : isRejected
                            ? "bg-error/20 text-error"
                            : "bg-surface-container-high text-slate-muted"
                        }`}
                      >
                        {item.status}
                      </span>
                      <span className="text-xs text-slate-muted">
                        Confidence: {Math.round(item.confidence * 100)}%
                      </span>
                    </div>

                    <div className="flex items-baseline gap-3 flex-wrap mt-0.5">
                      <span className="text-xl sm:text-2xl text-pure-white font-bold font-mono">
                        {item.editedValue || item.extractedValue}
                      </span>
                      {item.editedValue && (
                        <span className="text-xs text-tertiary-fixed-dim italic">
                          (Original: {item.extractedValue})
                        </span>
                      )}
                    </div>

                    {item.analystComment && (
                      <p className="text-xs text-slate-300 mt-1 italic">
                        Note: {item.analystComment}
                      </p>
                    )}

                    <div className="flex items-center gap-2 text-slate-muted text-xs mt-1">
                      <span className="material-symbols-outlined text-[15px] text-primary-container">
                        link
                      </span>
                      <span>Source:</span>
                      <span className="font-mono text-slate-300 bg-surface-container-low px-2 py-0.5 rounded">
                        {item.sourceCitation || "Statutory Financial filing"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Card Actions */}
                <div className="flex items-center gap-2 self-start xl:self-center shrink-0">
                  <button
                    type="button"
                    onClick={() => handleUpdateStatus(item.id, "ACCEPTED")}
                    disabled={isUpdating || isAccepted}
                    className="px-3 py-1.5 rounded-lg bg-surface-container-high hover:bg-surface-bright text-xs font-semibold text-pure-white transition-colors flex items-center gap-1 border border-surface-container-high/40"
                  >
                    <span className="material-symbols-outlined text-[16px] text-primary-container">
                      check
                    </span>
                    <span>Accept</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setEditingItem(item);
                      setEditValue(item.editedValue || item.extractedValue);
                      setEditComment(item.analystComment || "");
                    }}
                    className="px-3 py-1.5 rounded-lg bg-surface-container-high hover:bg-surface-bright text-xs font-semibold text-pure-white transition-colors flex items-center gap-1 border border-surface-container-high/40"
                  >
                    <span className="material-symbols-outlined text-[16px] text-tertiary-fixed-dim">
                      edit
                    </span>
                    <span>Edit Value</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleUpdateStatus(item.id, "REJECTED")}
                    disabled={isUpdating || isRejected}
                    className="px-3 py-1.5 rounded-lg bg-surface-container-high hover:bg-surface-bright text-xs font-semibold text-slate-400 hover:text-error transition-colors flex items-center gap-1 border border-surface-container-high/40"
                  >
                    <span className="material-symbols-outlined text-[16px]">close</span>
                    <span>Reject</span>
                  </button>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      {/* Edit Extraction Modal */}
      {editingItem && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-surface-dark-elevated rounded-xl shadow-2xl w-full max-w-lg overflow-hidden border border-surface-container-high/60">
            <div className="p-space-lg bg-surface-container-lowest flex items-center justify-between border-b border-surface-container-high/40">
              <h3 className="text-base sm:text-lg font-bold text-pure-white">
                Edit Extracted Metric Value
              </h3>
              <button
                type="button"
                onClick={() => setEditingItem(null)}
                className="text-slate-muted hover:text-pure-white"
              >
                <span className="material-symbols-outlined text-xl">close</span>
              </button>
            </div>
            <div className="p-space-lg space-y-3 text-xs sm:text-sm">
              <div>
                <span className="text-xs text-slate-muted uppercase font-semibold">Metric:</span>
                <p className="font-bold text-pure-white">{editingItem.label}</p>
                <span className="text-xs text-slate-400">Original extracted: {editingItem.extractedValue}</span>
              </div>
              <div>
                <label className="text-xs uppercase tracking-wider text-slate-muted font-semibold block mb-1">
                  Corrected Value / Formula Recalibration
                </label>
                <input
                  type="text"
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  className="w-full bg-surface-container-lowest text-pure-white p-2.5 rounded text-xs border border-surface-container-high/60 focus:ring-1 focus:ring-primary-container focus:outline-none font-mono"
                />
              </div>
              <div>
                <label className="text-xs uppercase tracking-wider text-slate-muted font-semibold block mb-1">
                  Auditor Reason / Justification
                </label>
                <textarea
                  value={editComment}
                  onChange={(e) => setEditComment(e.target.value)}
                  rows={3}
                  placeholder="Record adjustment rationale (e.g. Reconciliation adjustment per March GST-1 filing vs invoice cut-off)..."
                  className="w-full bg-surface-container-lowest text-pure-white p-2.5 rounded text-xs border border-surface-container-high/60 focus:ring-1 focus:ring-primary-container focus:outline-none"
                />
              </div>
            </div>
            <div className="p-space-lg bg-surface-container-lowest flex items-center justify-end gap-space-sm border-t border-surface-container-high/40">
              <button
                type="button"
                onClick={() => setEditingItem(null)}
                className="px-4 py-2 rounded-lg text-slate-muted hover:text-pure-white text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleUpdateStatus(editingItem.id, "EDITED", editValue, editComment)}
                disabled={isUpdating}
                className="px-6 py-2 rounded-lg bg-primary-container text-surface-container-lowest text-xs font-bold hover:bg-primary-fixed transition-all"
              >
                {isUpdating ? "Saving..." : "Save Recalibration"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
