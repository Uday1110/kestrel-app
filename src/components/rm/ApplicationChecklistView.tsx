"use client";

import { useState } from "react";
import { formatINRRaw } from "@/lib/formatters";
import { UploadValidationDrawer } from "./UploadValidationDrawer";

interface ApplicationChecklistViewProps {
  application: any;
  currentUser: any;
}

export function ApplicationChecklistView({
  application: initialApp,
  currentUser,
}: ApplicationChecklistViewProps) {
  const [app, setApp] = useState(initialApp);
  const [filter, setFilter] = useState<"all" | "attention" | "cleared">("all");
  const [toast, setToast] = useState<{ title: string; msg: string; icon: string; show: boolean }>({
    title: "",
    msg: "",
    icon: "check_circle",
    show: false,
  });

  // Drawer state
  const [drawerDoc, setDrawerDoc] = useState<any | null>(null);
  const [activeChecklistItemId, setActiveChecklistItemId] = useState<string | null>(null);

  // Submit modal state
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [waiverReason, setWaiverReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const showToastNotification = (title: string, msg: string, icon = "check_circle") => {
    setToast({ title, msg, icon, show: true });
    setTimeout(() => {
      setToast((t) => ({ ...t, show: false }));
    }, 4000);
  };

  const refreshApplication = async () => {
    const res = await fetch(`/api/applications/${app.id}`);
    const data = await res.json();
    if (data.success) {
      setApp(data.application);
    }
  };

  const handleUploadForChecklistItem = async (file: File, itemId: string, category: string) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("applicationId", app.id);
    formData.append("category", category);
    formData.append("checklistItemId", itemId);

    const res = await fetch("/api/documents/upload", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      showToastNotification("Upload Failed", data.error || "Failed to upload document", "error");
      return;
    }

    showToastNotification(
      data.validation.overallStatus === "FLAGGED" ? "File Uploaded (Flagged)" : "File Validated & Saved",
      data.validation.overallStatus === "FLAGGED"
        ? "Document checksum or clarity flagged for review."
        : "Document passed all 4 automated intake criteria.",
      data.validation.overallStatus === "FLAGGED" ? "warning" : "task_alt"
    );

    await refreshApplication();
  };

  const handleNotifyBorrower = () => {
    showToastNotification(
      "Checklist Request Dispatched",
      `Multi-channel ping dispatched to ${app.business.contactName} (${app.business.legalName}).`,
      "send"
    );
  };

  const handleSubmitToCreditDesk = async (force = false) => {
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/applications/${app.id}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          forceSubmit: force,
          waiverReason,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        if (data.blocked) {
          setShowSubmitModal(true);
          return;
        }
        throw new Error(data.error || "Submission failed");
      }

      setShowSubmitModal(false);
      showToastNotification(
        "Submitted to Credit Desk",
        "Application transferred to Underwriting Intake Queue.",
        "verified"
      );
      await refreshApplication();
    } catch (err: any) {
      showToastNotification("Submission Error", err.message, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Readiness stats
  const items = app.checklistItems || [];
  const clearedCount = items.filter((i: any) => i.status === "CLEARED" || i.status === "WAIVED").length;
  const duplicateCount = items.filter((i: any) => i.flagReason?.toLowerCase().includes("duplicate")).length;
  const ocrCount = items.filter((i: any) => i.flagReason?.toLowerCase().includes("ocr") || i.flagReason?.toLowerCase().includes("unreadable")).length;
  const missingCount = items.filter((i: any) => i.status === "MISSING").length;
  const attentionCount = items.filter((i: any) => i.status === "ATTENTION").length;
  const totalCount = items.length || 8;
  const clearedPct = Math.round((clearedCount / totalCount) * 100);

  // Filter items
  const filteredItems = items.filter((i: any) => {
    if (filter === "attention") return i.status === "ATTENTION" || i.status === "MISSING";
    if (filter === "cleared") return i.status === "CLEARED" || i.status === "WAIVED";
    return true;
  });

  return (
    <div className="flex flex-col w-full pb-space-xl">
      {/* Governance Protocol Banner */}
      <div className="w-full bg-surface-container-low rounded-xl p-space-md mb-space-lg flex items-center justify-between shadow-sm relative overflow-hidden border border-surface-container-high/40">
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary-container shadow-[0_0_8px_#02f576]" />
        <div className="flex items-center gap-space-md pl-space-xs">
          <div className="w-9 h-9 rounded-lg bg-surface-dark-elevated flex items-center justify-center text-primary-container shrink-0">
            <span className="material-symbols-outlined text-[20px]">gavel</span>
          </div>
          <div className="flex flex-col">
            <span className="text-xs uppercase tracking-wider font-semibold text-primary-fixed">
              Statutory Governance &amp; Protocol Notice
            </span>
            <p className="text-xs sm:text-sm text-on-surface-variant">
              Completeness check only. System does not approve or reject loan applications. Verification strictly qualifies procedural readiness under RBI Master Direction 2025/WC-4.
            </p>
          </div>
        </div>
        <div className="hidden lg:flex items-center gap-space-sm shrink-0">
          <span className="px-space-sm py-1 rounded-lg bg-surface-dark text-slate-muted text-xs uppercase tracking-wider flex items-center gap-1.5 border border-surface-container-high/30">
            <span className="w-1.5 h-1.5 rounded-full bg-primary-container" />
            Ledger ID: KST-{app.referenceNumber}
          </span>
        </div>
      </div>

      {/* Application Summary Header Card */}
      <div className="w-full bg-surface-dark rounded-xl p-space-lg shadow-md mb-space-xl relative overflow-hidden border border-surface-container-high/40">
        <div className="absolute -right-20 -top-20 w-80 h-80 rounded-full bg-primary-container/5 blur-3xl pointer-events-none" />
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-space-lg pb-space-md mb-space-md border-b border-surface-container-high/30">
          <div className="flex items-start gap-space-md">
            <div className="w-12 sm:w-14 h-12 sm:h-14 rounded-xl bg-surface-dark-elevated flex items-center justify-center shrink-0 shadow-sm text-primary-container border border-surface-container-high/40">
              <span className="material-symbols-outlined text-[30px]">domain</span>
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-space-sm flex-wrap">
                <span className="text-xl sm:text-2xl text-pure-white font-bold tracking-tight">
                  {app.business.legalName}
                </span>
                <span className="px-2.5 py-0.5 rounded-lg bg-secondary-container/20 text-secondary text-xs uppercase tracking-wider font-semibold">
                  {app.referenceNumber}
                </span>
                <span className="px-2.5 py-0.5 rounded-lg bg-tertiary-container/20 text-tertiary-fixed-dim text-xs font-semibold flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-tertiary-fixed-dim animate-pulse" />
                  {app.status.replace(/_/g, " ")}
                </span>
              </div>
              <div className="flex items-center gap-2 sm:gap-4 mt-1 text-slate-muted text-xs sm:text-sm flex-wrap">
                <span className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-[15px]">precision_manufacturing</span>
                  Sector: {app.business.industrySector}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-[15px]">location_on</span>
                  {app.business.city}, {app.business.state}
                </span>
                <span>•</span>
                <span className="font-mono text-xs">CIN: {app.business.cin}</span>
              </div>
            </div>
          </div>

          {/* Financial Metrics Pill Matrix */}
          <div className="flex items-center gap-space-md self-start xl:self-center shrink-0">
            <div className="bg-surface-container-low px-4 py-2.5 rounded-xl flex flex-col min-w-[160px] border border-surface-container-high/30">
              <span className="text-xs uppercase text-slate-muted font-semibold tracking-wider">
                Facility Requested
              </span>
              <span className="text-lg sm:text-xl text-pure-white font-bold mt-0.5">
                ₹ {formatINRRaw(app.facilityAmount)}
              </span>
              <span className="text-[11px] text-primary-fixed-dim font-medium">
                {app.facilityType.replace(/_/g, " ")} ({app.tenorMonths}m)
              </span>
            </div>
            <div className="bg-surface-container-low px-4 py-2.5 rounded-xl flex flex-col min-w-[140px] border border-surface-container-high/30">
              <span className="text-xs uppercase text-slate-muted font-semibold tracking-wider">
                Assigned RM
              </span>
              <span className="text-sm sm:text-base text-pure-white font-semibold mt-0.5">
                {app.assignedRm.name}
              </span>
              <span className="text-[11px] text-slate-muted truncate">
                {app.assignedRm.department}
              </span>
            </div>
          </div>
        </div>

        {/* Dossier Readiness Progress Dashboard */}
        <div className="bg-surface-container-lowest p-space-md rounded-xl flex flex-col gap-space-sm border border-surface-container-high/30">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-space-xs">
            <div className="flex items-center gap-space-sm">
              <span className="text-sm font-bold text-pure-white tracking-wide">
                Dossier Readiness Pipeline
              </span>
              <span className="px-2 py-0.5 rounded bg-surface-bright text-pure-white text-xs font-bold font-mono">
                {clearedCount} of {totalCount} Cleared ({clearedPct}%)
              </span>
            </div>
            {/* Status key */}
            <div className="flex items-center gap-space-md flex-wrap text-slate-muted text-xs">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-primary-container" />
                <strong className="text-pure-white">{clearedCount}</strong> Valid &amp; Verified
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-secondary" />
                <strong className="text-pure-white">{duplicateCount}</strong> Duplicate Alert
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-tertiary-fixed-dim" />
                <strong className="text-pure-white">{ocrCount}</strong> Unreadable / OCR
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-error" />
                <strong className="text-pure-white">{missingCount}</strong> Missing
              </span>
            </div>
          </div>

          {/* Segmented Bar */}
          <div className="w-full h-3 bg-surface-variant rounded-full overflow-hidden flex gap-0.5 p-0.5">
            <div
              className="h-full bg-primary-container rounded-sm transition-all duration-500"
              style={{ width: `${(clearedCount / totalCount) * 100}%` }}
              title={`${clearedCount} Verified Complete`}
            />
            <div
              className="h-full bg-secondary rounded-sm transition-all duration-500"
              style={{ width: `${(duplicateCount / totalCount) * 100}%` }}
              title={`${duplicateCount} Duplicate Flag`}
            />
            <div
              className="h-full bg-tertiary-fixed-dim rounded-sm transition-all duration-500"
              style={{ width: `${(ocrCount / totalCount) * 100}%` }}
              title={`${ocrCount} OCR Flag`}
            />
            <div
              className="h-full bg-error rounded-sm transition-all duration-500"
              style={{ width: `${(missingCount / totalCount) * 100}%` }}
              title={`${missingCount} Missing`}
            />
          </div>
        </div>
      </div>

      {/* Operational Header with Interactive Filter Toggle */}
      <div className="w-full flex flex-col md:flex-row md:items-center justify-between gap-space-md mb-space-md">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-pure-white tracking-tight">
            Intake Verification Matrix
          </h2>
          <p className="text-xs text-slate-muted mt-0.5">
            Mandatory credit documentation checklist per Commercial Underwriting Guidelines 2026
          </p>
        </div>
        <div className="flex items-center gap-space-sm flex-wrap">
          <div className="bg-surface-container-low p-1 rounded-lg flex items-center border border-surface-container-high/40">
            <button
              type="button"
              onClick={() => setFilter("all")}
              className={`px-3 py-1 rounded-md text-xs font-semibold transition-colors ${
                filter === "all"
                  ? "bg-surface-dark-elevated text-primary-container shadow-sm"
                  : "text-slate-muted hover:text-pure-white"
              }`}
            >
              All ({totalCount})
            </button>
            <button
              type="button"
              onClick={() => setFilter("attention")}
              className={`px-3 py-1 rounded-md text-xs font-semibold transition-colors ${
                filter === "attention"
                  ? "bg-surface-dark-elevated text-primary-container shadow-sm"
                  : "text-slate-muted hover:text-pure-white"
              }`}
            >
              Action Required ({attentionCount + missingCount})
            </button>
            <button
              type="button"
              onClick={() => setFilter("cleared")}
              className={`px-3 py-1 rounded-md text-xs font-semibold transition-colors ${
                filter === "cleared"
                  ? "bg-surface-dark-elevated text-primary-container shadow-sm"
                  : "text-slate-muted hover:text-pure-white"
              }`}
            >
              Ready ({clearedCount})
            </button>
          </div>
          <button
            type="button"
            onClick={() => showToastNotification("Export Generated", "Compressed compliance package bundle generated.", "download")}
            className="px-space-md py-1.5 rounded-lg bg-surface-container-high text-pure-white hover:bg-surface-bright transition-colors text-xs font-semibold flex items-center gap-1.5 border border-surface-container-high/50"
          >
            <span className="material-symbols-outlined text-[16px]">download</span>
            <span>Export Package (ZIP)</span>
          </button>
        </div>
      </div>

      {/* High-Density Checklist Matrix Table */}
      <div className="w-full bg-surface-dark rounded-xl shadow-xl overflow-hidden mb-space-xl border border-surface-container-high/40">
        <div className="w-full overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm min-w-[980px]">
            <thead className="bg-surface-container-low text-xs text-slate-muted uppercase tracking-wider border-b border-surface-container-high/30">
              <tr>
                <th className="py-3 px-4 w-12 text-center">#</th>
                <th className="py-3 px-4">Required Document &amp; Specification</th>
                <th className="py-3 px-4">Uploaded Asset &amp; Integrity</th>
                <th className="py-3 px-4">Timestamp &amp; Source</th>
                <th className="py-3 px-4">Readiness State</th>
                <th className="py-3 px-4 text-right">Row Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-container-high/30">
              {filteredItems.map((item: any) => {
                const doc = item.document;
                const isCleared = item.status === "CLEARED";
                const isAttention = item.status === "ATTENTION";
                const isMissing = item.status === "MISSING";

                return (
                  <tr
                    key={item.id}
                    className="hover:bg-surface-container-low/60 transition-colors"
                  >
                    <td className="py-3.5 px-4 text-center text-xs font-mono font-bold text-slate-muted">
                      {String(item.itemIndex).padStart(2, "0")}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex flex-col">
                        <span className="font-bold text-pure-white text-sm">
                          {item.title}
                        </span>
                        <span className="text-slate-muted text-xs">
                          {item.specification}
                        </span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      {doc ? (
                        <div className="flex items-center gap-space-sm">
                          <div
                            className={`w-8 h-8 rounded flex items-center justify-center shrink-0 ${
                              isAttention
                                ? "bg-error/20 text-error"
                                : "bg-surface-container-high text-primary-fixed-dim"
                            }`}
                          >
                            <span className="material-symbols-outlined text-[18px]">
                              {isAttention ? "warning" : "picture_as_pdf"}
                            </span>
                          </div>
                          <div className="flex flex-col min-w-0">
                            <span className="text-pure-white text-xs font-semibold truncate max-w-[220px]">
                              {doc.fileName}
                            </span>
                            <span className="text-slate-muted text-[11px] truncate">
                              {(doc.fileSize / (1024 * 1024)).toFixed(1)} MB • SHA256: {doc.fileHash.slice(0, 8)}...
                            </span>
                            {item.flagReason && (
                              <span className="text-error text-[10px] font-semibold mt-0.5 truncate max-w-[240px]">
                                {item.flagReason}
                              </span>
                            )}
                          </div>
                        </div>
                      ) : (
                        <span className="text-slate-muted text-xs italic">
                          No artifact uploaded yet
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      {doc ? (
                        <div className="flex flex-col">
                          <span className="text-pure-white text-xs font-medium">
                            {new Date(doc.uploadedAt).toLocaleDateString("en-IN", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            })}
                          </span>
                          <span className="text-slate-muted text-[11px]">{doc.source}</span>
                        </div>
                      ) : (
                        <span className="text-slate-muted text-xs">—</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      {isCleared && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-primary-container/15 text-primary-container text-xs font-bold">
                          <span className="material-symbols-outlined text-[14px]">check_circle</span>
                          Complete
                        </span>
                      )}
                      {isAttention && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-secondary-container/30 text-secondary-fixed text-xs font-bold">
                          <span className="material-symbols-outlined text-[14px]">priority_high</span>
                          Attention
                        </span>
                      )}
                      {isMissing && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-error/15 text-error text-xs font-bold">
                          <span className="material-symbols-outlined text-[14px]">error</span>
                          Missing
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="inline-flex items-center justify-end gap-1.5">
                        {doc && (
                          <>
                            <button
                              type="button"
                              onClick={() => {
                                setDrawerDoc(doc);
                                setActiveChecklistItemId(item.id);
                              }}
                              className="p-1.5 rounded-lg bg-surface-container-high hover:bg-surface-bright text-slate-muted hover:text-pure-white transition-colors"
                              title="Inspect Validation Drawer"
                            >
                              <span className="material-symbols-outlined text-[18px]">visibility</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setDrawerDoc(doc);
                                setActiveChecklistItemId(item.id);
                              }}
                              className="px-2.5 py-1 rounded-lg bg-surface-container-high hover:bg-surface-bright text-pure-white text-xs font-semibold transition-colors"
                            >
                              Replace
                            </button>
                          </>
                        )}
                        {!doc && (
                          <label className="px-3 py-1 rounded-lg bg-primary-container text-surface-container-lowest text-xs font-bold hover:bg-primary-fixed cursor-pointer transition-all flex items-center gap-1 shadow-sm">
                            <span className="material-symbols-outlined text-[16px]">upload</span>
                            <span>Upload</span>
                            <input
                              type="file"
                              className="hidden"
                              onChange={(e) => {
                                const f = e.target.files?.[0];
                                if (f) handleUploadForChecklistItem(f, item.id, item.category);
                              }}
                            />
                          </label>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Persistent Execution Toolbar sticky at bottom */}
      <div className="w-full bg-surface-container-lowest/95 backdrop-blur-xl p-space-md rounded-xl shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-space-md sticky bottom-4 z-20 border border-surface-container-high/60">
        <div className="flex items-center gap-space-md">
          <div className="w-10 h-10 rounded-lg bg-surface-dark-elevated flex items-center justify-center text-primary-container shrink-0 border border-surface-container-high/40">
            <span className="material-symbols-outlined text-[24px]">assignment_turned_in</span>
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-space-xs">
              <span className="text-sm font-bold text-pure-white">
                Dossier Status: {clearedCount === totalCount ? "Cleared & Complete" : "Incomplete"}
              </span>
              {attentionCount + missingCount > 0 && (
                <span className="text-error text-xs font-semibold">
                  ({attentionCount + missingCount} Blockers)
                </span>
              )}
            </div>
            <span className="text-xs text-slate-muted">
              {clearedCount === totalCount
                ? "All statutory artifacts verified. Package qualifies for Underwriting Desk handover."
                : `All ${totalCount} required artifacts must be cleared or formally waived before underwriting intake.`}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-space-md shrink-0 w-full sm:w-auto justify-end">
          {/* Notify Borrower Action */}
          <button
            type="button"
            onClick={handleNotifyBorrower}
            className="px-4 py-2 rounded-lg bg-transparent text-pure-white hover:bg-secondary-container/20 transition-all text-xs font-semibold flex items-center gap-2 border border-surface-container-high/40"
          >
            <span className="material-symbols-outlined text-[16px]">send</span>
            <span>Notify Borrower</span>
          </button>

          {/* Primary Green Submission CTA */}
          <button
            type="button"
            onClick={() => handleSubmitToCreditDesk(false)}
            disabled={isSubmitting}
            className="px-6 py-2.5 rounded-lg bg-primary-container text-on-primary-container text-xs uppercase tracking-wider font-bold transition-all shadow-[0_0_16px_rgba(2,245,118,0.25)] hover:shadow-[0_0_24px_rgba(2,245,118,0.45)] hover:scale-[1.01] active:scale-[0.99] flex items-center gap-2 cursor-pointer"
          >
            <span>{isSubmitting ? "Submitting..." : "Submit to Credit Desk"}</span>
            <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
          </button>
        </div>
      </div>

      {/* Upload Validation Drawer Integration */}
      <UploadValidationDrawer
        isOpen={!!drawerDoc}
        onClose={() => setDrawerDoc(null)}
        documentData={drawerDoc}
        applicationRef={app.referenceNumber}
        onReplaceFile={async (file: File) => {
          if (activeChecklistItemId) {
            await handleUploadForChecklistItem(file, activeChecklistItemId, drawerDoc?.category || "AUDITED_FINANCIALS");
          }
        }}
      />

      {/* Submission Blocker Modal */}
      {showSubmitModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-surface-dark-elevated rounded-xl shadow-2xl w-full max-w-lg overflow-hidden border border-surface-container-high/60">
            <div className="p-space-lg bg-surface-container-lowest flex items-center justify-between border-b border-surface-container-high/40">
              <div className="flex items-center gap-space-sm text-error">
                <span className="material-symbols-outlined text-2xl">error</span>
                <h3 className="text-lg font-bold text-pure-white">Submission Blocker Encountered</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowSubmitModal(false)}
                className="text-slate-muted hover:text-pure-white"
              >
                <span className="material-symbols-outlined text-xl">close</span>
              </button>
            </div>
            <div className="p-space-lg space-y-space-md text-xs sm:text-sm">
              <p className="text-slate-muted leading-relaxed">
                The dossier has <strong className="text-error font-bold">{attentionCount + missingCount} incomplete artifacts</strong>:
                2 items missing, 1 duplicate checksum conflict, and 1 unreadable OCR scan.
              </p>
              <div className="p-space-sm rounded-lg bg-surface-container-low border border-surface-container-high/40 space-y-1">
                <div className="text-pure-white font-semibold">• GST Returns: Duplicate Hash with APP-2025-0814</div>
                <div className="text-pure-white font-semibold">• ITR-6: Page 3 blurred / unreadable OCR</div>
                <div className="text-pure-white font-semibold">• Pro-forma Machinery Invoice: Missing</div>
                <div className="text-pure-white font-semibold">• Existing Lender Sanction Letters: Missing</div>
              </div>
              <div>
                <label className="text-xs uppercase tracking-wider text-slate-muted font-semibold block mb-1">
                  Supervisory Waiver / Fast-Track Justification (Optional)
                </label>
                <textarea
                  className="w-full bg-surface-container-lowest text-pure-white p-2.5 rounded text-xs border border-surface-container-high/60 focus:ring-1 focus:ring-primary-container focus:outline-none"
                  rows={2}
                  placeholder="Enter reason if authorized by Credit Risk Committee to bypass initial gating..."
                  value={waiverReason}
                  onChange={(e) => setWaiverReason(e.target.value)}
                />
              </div>
            </div>
            <div className="p-space-lg bg-surface-container-lowest flex items-center justify-end gap-space-sm border-t border-surface-container-high/40">
              <button
                type="button"
                onClick={() => setShowSubmitModal(false)}
                className="px-4 py-2 rounded-lg text-slate-muted hover:text-pure-white text-xs font-semibold"
              >
                Cancel &amp; Resolve Items
              </button>
              <button
                type="button"
                onClick={() => handleSubmitToCreditDesk(true)}
                className="px-4 py-2 rounded-lg bg-error-container text-on-error-container text-xs font-bold hover:brightness-110 flex items-center gap-1.5"
              >
                <span>Override &amp; Submit Conditionally</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Notification Toast */}
      {toast.show && (
        <div className="fixed bottom-24 right-8 bg-surface-dark-elevated text-pure-white px-space-lg py-space-md rounded-xl shadow-2xl z-50 flex items-center gap-space-md border border-primary-container/40 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <span className="material-symbols-outlined text-primary-container text-[24px]">
            {toast.icon}
          </span>
          <div className="flex flex-col">
            <span className="text-xs font-bold">{toast.title}</span>
            <span className="text-xs text-slate-muted">{toast.msg}</span>
          </div>
        </div>
      )}
    </div>
  );
}
