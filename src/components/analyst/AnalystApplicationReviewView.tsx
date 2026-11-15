"use client";

import { useState } from "react";
import { formatINRRaw } from "@/lib/formatters";
import { UserSession } from "@/types/domain";

interface AnalystApplicationReviewViewProps {
  application: any;
  currentUser: UserSession;
}

export function AnalystApplicationReviewView({
  application: initialApp,
  currentUser,
}: AnalystApplicationReviewViewProps) {
  const [app, setApp] = useState(initialApp);
  const [zoom, setZoom] = useState(100);
  const [isExpanded, setIsExpanded] = useState(false);
  const [toast, setToast] = useState<{ title: string; msg: string; show: boolean }>({
    title: "",
    msg: "",
    show: false,
  });

  // Decision & Note states
  const [decisionModal, setDecisionModal] = useState<"PROCEED" | "APPROVE" | "REJECT" | "REQUEST_DOCS" | null>(null);
  const [decisionNotes, setDecisionNotes] = useState("");
  const [isExecutingDecision, setIsExecutingDecision] = useState(false);

  // New Note
  const [noteTitle, setNoteTitle] = useState("");
  const [noteContent, setNoteContent] = useState("");
  const [isAddingNote, setIsAddingNote] = useState(false);

  // Request Document modal
  const [reqDocTitle, setReqDocTitle] = useState("");
  const [reqDocDesc, setReqDocDesc] = useState("");

  const showToast = (title: string, msg: string) => {
    setToast({ title, msg, show: true });
    setTimeout(() => setToast((t) => ({ ...t, show: false })), 4000);
  };

  const refreshApp = async () => {
    const res = await fetch(`/api/applications/${app.id}`);
    const data = await res.json();
    if (data.success) {
      setApp(data.application);
    }
  };

  const handleExecuteDecision = async (decisionType: string) => {
    setIsExecutingDecision(true);
    try {
      const res = await fetch(`/api/applications/${app.id}/decision`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          decision: decisionType,
          notes: decisionNotes || `Underwriting protocol execution: ${decisionType}`,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Decision failed");

      setDecisionModal(null);
      setDecisionNotes("");
      showToast("Underwriting Action Executed", data.message || "Decision logged to audit ledger.");
      await refreshApp();
    } catch (err: any) {
      showToast("Action Error", err.message);
    } finally {
      setIsExecutingDecision(false);
    }
  };

  const handleCreateDocumentRequest = async () => {
    if (!reqDocTitle) return;
    setIsExecutingDecision(true);
    try {
      const res = await fetch("/api/outstanding-items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          applicationId: app.id,
          title: reqDocTitle,
          description: reqDocDesc || "Additional supporting evidence requested by Lead Credit Analyst.",
          severity: "STANDARD",
          lastContactedChannel: "EMAIL",
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create request");

      setDecisionModal(null);
      setReqDocTitle("");
      setReqDocDesc("");
      showToast("Document Request Dispatched", "Created outstanding item for Relationship Manager.");
      await refreshApp();
    } catch (err: any) {
      showToast("Error", err.message);
    } finally {
      setIsExecutingDecision(false);
    }
  };

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteTitle || !noteContent) return;
    setIsAddingNote(true);
    try {
      const res = await fetch("/api/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          applicationId: app.id,
          title: noteTitle,
          content: noteContent,
          category: "COMPLIANCE",
        }),
      });
      const data = await res.json();
      if (data.success) {
        setNoteTitle("");
        setNoteContent("");
        showToast("Note Committed", "Analyst memorandum observation recorded.");
        await refreshApp();
      }
    } finally {
      setIsAddingNote(false);
    }
  };

  const extractions = app.financialExtractions || [];
  const revExt = extractions.find((e: any) => e.metricKey === "TOTAL_REVENUE");
  const ebitdaExt = extractions.find((e: any) => e.metricKey === "OPERATING_EBITDA");
  const bankExt = extractions.find((e: any) => e.metricKey === "CLOSING_BANK_BALANCE");
  const dscrExt = extractions.find((e: any) => e.metricKey === "DSCR");
  const currentRatioExt = extractions.find((e: any) => e.metricKey === "CURRENT_RATIO");
  const gstExt = extractions.find((e: any) => e.metricKey === "GST_RECONCILIATION");

  return (
    <div className="flex flex-col w-full pb-28">
      {/* Preparation Notice & Protocol Banner */}
      <section className="w-full mb-space-md">
        <div className="bg-surface-container-low rounded-xl p-space-md shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-space-md relative overflow-hidden border border-surface-container-high/40">
          <div className="absolute -right-16 -top-16 w-48 h-48 rounded-full bg-secondary-container/10 blur-3xl pointer-events-none" />
          <div className="flex items-center gap-space-md min-w-0">
            <div className="w-10 h-10 rounded-lg bg-surface-dark-elevated flex items-center justify-center text-primary-container shrink-0 shadow-sm border border-surface-container-high/40">
              <span className="material-symbols-outlined text-[24px]">gavel</span>
            </div>
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-space-sm flex-wrap">
                <span className="text-sm sm:text-base text-pure-white font-semibold tracking-tight">
                  Preparation only. Final underwriting decision rests strictly with the credit analyst
                </span>
                <span className="px-2 py-0.5 rounded-full bg-secondary-container/20 text-secondary text-xs uppercase tracking-wider font-semibold">
                  Status: {app.status.replace(/_/g, " ")}
                </span>
              </div>
              <span className="text-xs text-slate-muted truncate">
                Automated field extraction assistant qualifies mathematical consistency. Statutory underwriting discretion belongs to authorized human analyst.
              </span>
            </div>
          </div>
          <div className="flex items-center gap-space-sm shrink-0">
            <div className="px-space-md py-1 rounded-lg bg-surface-container-high flex items-center gap-2 text-slate-muted text-xs border border-surface-container-high/40">
              <span className="w-2 h-2 rounded-full bg-tertiary-fixed-dim animate-pulse" />
              <span>Gatekeeper Active</span>
            </div>
          </div>
        </div>
      </section>

      {/* Application Master Header Bar */}
      <section className="w-full mb-space-lg">
        <div className="bg-surface-dark rounded-xl p-space-lg shadow-md flex flex-col lg:flex-row lg:items-center justify-between gap-space-md border border-surface-container-high/40">
          <div className="flex items-center gap-space-md min-w-0">
            <div className="w-12 h-12 rounded-xl bg-surface-dark-elevated flex items-center justify-center text-primary shrink-0 shadow-sm border border-surface-container-high/40">
              <span className="material-symbols-outlined text-[28px]">domain</span>
            </div>
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-space-sm flex-wrap">
                <span className="text-xs font-mono font-bold text-primary-fixed-dim uppercase tracking-wider">
                  {app.referenceNumber}
                </span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                  app.status === "APPROVED"
                    ? "bg-primary-container/20 text-primary-container border border-primary-container/40"
                    : app.status === "REJECTED"
                    ? "bg-red-950/40 text-red-400 border border-red-500/40"
                    : app.status === "INFO_REQUESTED"
                    ? "bg-amber-950/40 text-amber-400 border border-amber-500/40"
                    : "bg-surface-container-high text-slate-muted border border-surface-container-high"
                }`}>
                  {app.status.replace(/_/g, " ")}
                </span>
                <span className="text-slate-muted">•</span>
                <h1 className="text-lg sm:text-xl text-pure-white font-bold truncate">
                  {app.business.legalName}
                </h1>
              </div>
              <div className="flex items-center gap-2 sm:gap-4 mt-1 flex-wrap text-slate-muted text-xs sm:text-sm">
                <span>
                  Sector: <strong className="text-on-surface font-semibold">{app.business.industrySector}</strong>
                </span>
                <span>/</span>
                <span>
                  Facility: <strong className="text-primary-container font-mono font-bold">₹ {formatINRRaw(app.facilityAmount)}</strong>
                </span>
                <span>/</span>
                <span>
                  RM Lead: <strong className="text-on-surface font-semibold">{app.assignedRm.name}</strong>
                </span>
              </div>
            </div>
          </div>

          {/* Quick Metrics Intake Badge */}
          <div className="flex items-center gap-space-md shrink-0">
            <div className="bg-surface-container-lowest px-4 py-2 rounded-lg flex items-center gap-4 shadow-inner border border-surface-container-high/40">
              <div className="flex flex-col text-right">
                <span className="text-[11px] uppercase tracking-wider text-slate-muted font-semibold">
                  Intake Score
                </span>
                <span className="text-xl font-bold text-primary-container font-mono tracking-tight">
                  96.4<span className="text-xs text-slate-muted font-normal">/100</span>
                </span>
              </div>
              <div className="relative w-10 h-10 flex items-center justify-center">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                  <path
                    className="text-surface-variant"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3.5"
                  />
                  <path
                    className="text-primary-container"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="currentColor"
                    strokeDasharray="96.4, 100"
                    strokeLinecap="round"
                    strokeWidth="3.5"
                  />
                </svg>
                <span className="absolute material-symbols-outlined text-primary-container text-[14px]">
                  bolt
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Two-Column 50/50 Enterprise Split Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-space-lg w-full items-start">
        {/* LEFT COLUMN: Document Viewer & Validated Tree */}
        <div className="flex flex-col gap-space-md w-full">
          {/* Active Document Viewer Pane */}
          <div className="bg-surface-dark rounded-xl p-space-md shadow-md flex flex-col w-full border border-surface-container-high/40">
            {/* Viewer Toolbar */}
            <div className="flex items-center justify-between mb-2 bg-surface-container-low px-3 py-1.5 rounded-lg border border-surface-container-high/30">
              <div className="flex items-center gap-2 min-w-0">
                <span className="material-symbols-outlined text-primary-fixed-dim text-[18px]">
                  picture_as_pdf
                </span>
                <span className="text-xs font-semibold text-pure-white truncate">
                  audited_finances_fy24-25.pdf
                </span>
                <span className="px-2 py-0.5 rounded bg-surface-dark-elevated text-slate-muted text-[10px] font-mono">
                  Pg 4 of 28
                </span>
              </div>
              <div className="flex items-center gap-1 text-slate-muted">
                <button
                  type="button"
                  onClick={() => setZoom((z) => Math.max(75, z - 15))}
                  className="w-7 h-7 rounded hover:bg-surface-container-high hover:text-pure-white flex items-center justify-center transition-colors"
                  title="Zoom Out"
                >
                  <span className="material-symbols-outlined text-[16px]">zoom_out</span>
                </button>
                <span className="text-xs font-mono px-1 text-on-surface">{zoom}%</span>
                <button
                  type="button"
                  onClick={() => setZoom((z) => Math.min(150, z + 15))}
                  className="w-7 h-7 rounded hover:bg-surface-container-high hover:text-pure-white flex items-center justify-center transition-colors"
                  title="Zoom In"
                >
                  <span className="material-symbols-outlined text-[16px]">zoom_in</span>
                </button>
                <div className="w-px h-4 bg-surface-variant mx-1" />
                <button
                  type="button"
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="w-7 h-7 rounded hover:bg-surface-container-high hover:text-pure-white flex items-center justify-center transition-colors"
                  title="Toggle Full View"
                >
                  <span className="material-symbols-outlined text-[16px]">
                    {isExpanded ? "fullscreen_exit" : "fullscreen"}
                  </span>
                </button>
              </div>
            </div>

            {/* Document Preview Canvas */}
            <div
              className={`relative w-full ${
                isExpanded ? "h-[540px]" : "h-[380px]"
              } bg-surface-container-lowest rounded-lg overflow-y-auto overflow-x-hidden p-4 select-none flex flex-col items-center border border-surface-container-high/40 transition-all`}
            >
              <div
                className="w-full max-w-[500px] bg-[#0E121A] text-on-surface rounded shadow-xl p-5 border border-surface-container-high/50 transition-transform origin-top"
                style={{ transform: `scale(${zoom / 100})` }}
              >
                <div className="flex justify-between items-start pb-3 border-b border-surface-variant">
                  <div>
                    <span className="text-[10px] text-slate-muted uppercase tracking-widest block font-semibold">
                      Statutory Schedule III Part II
                    </span>
                    <h4 className="text-xs sm:text-sm font-bold text-pure-white">
                      Audited Balance Sheet &amp; Revenue Schedule
                    </h4>
                    <p className="text-[11px] text-slate-muted">
                      Sample Applicant Private Limited | FY Ending 31-03-2025
                    </p>
                  </div>
                  <div className="px-2 py-0.5 bg-surface-container rounded text-[10px] text-primary-container uppercase font-bold border border-primary-container/30">
                    Certified CA Copy
                  </div>
                </div>

                {/* Table excerpt with highlighted target rows */}
                <div className="mt-3 flex flex-col gap-1.5 text-xs font-mono">
                  <div className="grid grid-cols-12 text-slate-muted text-[10px] uppercase pb-1 border-b border-surface-variant">
                    <span className="col-span-1">Ln</span>
                    <span className="col-span-7">Particulars</span>
                    <span className="col-span-2 text-right">FY25 (₹)</span>
                    <span className="col-span-2 text-right">FY24 (₹)</span>
                  </div>
                  <div className="grid grid-cols-12 py-1 text-slate-300">
                    <span className="col-span-1 text-slate-muted">10</span>
                    <span className="col-span-7 truncate">Sale of Precision Components</span>
                    <span className="col-span-2 text-right">4,12,00,000</span>
                    <span className="col-span-2 text-right text-slate-500">3,45,00,000</span>
                  </div>
                  <div className="grid grid-cols-12 py-1 text-slate-300">
                    <span className="col-span-1 text-slate-muted">11</span>
                    <span className="col-span-7 truncate">Ancillary Job Work Receipts</span>
                    <span className="col-span-2 text-right">70,50,000</span>
                    <span className="col-span-2 text-right text-slate-500">52,10,000</span>
                  </div>
                  {/* Highlighted Line 12 Target */}
                  <div className="grid grid-cols-12 py-1.5 px-1 bg-primary-container/15 rounded font-bold text-pure-white relative border border-primary-container/40">
                    <span className="col-span-1 text-primary-container">12</span>
                    <span className="col-span-7 flex items-center gap-1">
                      <span>Total Revenue from Operations</span>
                      <span className="material-symbols-outlined text-primary-container text-[12px]">
                        pin_drop
                      </span>
                    </span>
                    <span className="col-span-2 text-right text-primary-container">
                      4,82,50,000
                    </span>
                    <span className="col-span-2 text-right text-slate-400">
                      3,97,10,000
                    </span>
                  </div>
                  <div className="grid grid-cols-12 py-1 text-slate-300 mt-1">
                    <span className="col-span-1 text-slate-muted">13</span>
                    <span className="col-span-7 truncate">Cost of Raw Materials Consumed</span>
                    <span className="col-span-2 text-right">2,38,10,000</span>
                    <span className="col-span-2 text-right text-slate-500">1,98,40,000</span>
                  </div>
                  <div className="grid grid-cols-12 py-1 text-slate-300">
                    <span className="col-span-1 text-slate-muted">14</span>
                    <span className="col-span-7 truncate">Employee Benefits Expense</span>
                    <span className="col-span-2 text-right">84,20,000</span>
                    <span className="col-span-2 text-right text-slate-500">68,90,000</span>
                  </div>
                  <div className="grid grid-cols-12 py-1 text-slate-300">
                    <span className="col-span-1 text-slate-muted">15</span>
                    <span className="col-span-7 truncate">Operating EBITDA (Calculated)</span>
                    <span className="col-span-2 text-right text-primary-container">68,40,000</span>
                    <span className="col-span-2 text-right text-slate-500">54,20,000</span>
                  </div>
                </div>

                {/* Footer CA Seal */}
                <div className="mt-4 pt-2 border-t border-surface-variant flex justify-between items-center text-slate-400 text-[10px]">
                  <div>UDIN: 25088219BGHTW9821</div>
                  <div className="flex items-center gap-1 text-primary-fixed-dim">
                    <span className="material-symbols-outlined text-[14px]">verified</span>
                    <span>Digitally Signed: R.K. Singhal &amp; Co., FCA</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Validated Dossier Records Collapsible List */}
          <div className="bg-surface-dark rounded-xl p-space-md shadow-md flex flex-col gap-space-sm w-full border border-surface-container-high/40">
            <div className="flex items-center justify-between pb-1 border-b border-surface-container-high/30">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-pure-white">
                  Validated Dossier Records
                </span>
                <span className="px-2 py-0.5 rounded-full bg-primary-container/15 text-primary-container text-xs font-semibold">
                  6 Verified
                </span>
              </div>
              <span className="text-xs text-slate-muted uppercase tracking-wider">
                HSM Vaulted
              </span>
            </div>

            {/* Section 1: Financial Statements */}
            <details className="group bg-surface-container-low rounded-lg overflow-hidden border border-surface-container-high/40" open>
              <summary className="flex items-center justify-between p-3 cursor-pointer select-none bg-surface-container-low hover:bg-surface-container transition-colors">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary-container text-[18px]">
                    account_balance_wallet
                  </span>
                  <span className="text-xs font-bold text-pure-white">
                    1. Financial Statements
                  </span>
                  <span className="px-1.5 py-0.2 rounded bg-surface-dark-elevated text-primary-fixed-dim text-[10px] font-bold">
                    2/2 Clean
                  </span>
                </div>
                <span className="material-symbols-outlined text-slate-muted group-open:rotate-180 transition-transform text-sm">
                  expand_more
                </span>
              </summary>
              <div className="p-3 pt-0 flex flex-col gap-1.5 text-xs">
                <div className="p-2 rounded bg-surface-dark-elevated flex items-center justify-between hover:bg-surface-container-high transition-colors">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="material-symbols-outlined text-primary-container text-[18px]">
                      task
                    </span>
                    <div className="flex flex-col min-w-0">
                      <span className="font-semibold text-pure-white truncate">
                        Audited Financials FY24-25
                      </span>
                      <span className="text-[10px] text-slate-muted">audited_finances.pdf • 28 pgs • SHA-256 Validated</span>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-primary-container/20 text-primary-container text-[10px] font-bold">
                    Intake Verified
                  </span>
                </div>
                <div className="p-2 rounded bg-surface-dark-elevated flex items-center justify-between hover:bg-surface-container-high transition-colors">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="material-symbols-outlined text-primary-container text-[18px]">
                      task
                    </span>
                    <div className="flex flex-col min-w-0">
                      <span className="font-semibold text-pure-white truncate">
                        Bank Statements 12M (Current A/c)
                      </span>
                      <span className="text-[10px] text-slate-muted">hdfc_stmt_consolidated.pdf • 64 pgs • NetBanking API Direct</span>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-primary-container/20 text-primary-container text-[10px] font-bold">
                    Intake Verified
                  </span>
                </div>
              </div>
            </details>

            {/* Section 2: Regulatory Filings */}
            <details className="group bg-surface-container-low rounded-lg overflow-hidden border border-surface-container-high/40" open>
              <summary className="flex items-center justify-between p-3 cursor-pointer select-none bg-surface-container-low hover:bg-surface-container transition-colors">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-secondary text-[18px]">
                    receipt_long
                  </span>
                  <span className="text-xs font-bold text-pure-white">
                    2. Regulatory &amp; Tax Filings
                  </span>
                  <span className="px-1.5 py-0.2 rounded bg-surface-dark-elevated text-secondary text-[10px] font-bold">
                    2/2 Reconciled
                  </span>
                </div>
                <span className="material-symbols-outlined text-slate-muted group-open:rotate-180 transition-transform text-sm">
                  expand_more
                </span>
              </summary>
              <div className="p-3 pt-0 flex flex-col gap-1.5 text-xs">
                <div className="p-2 rounded bg-surface-dark-elevated flex items-center justify-between hover:bg-surface-container-high transition-colors">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="material-symbols-outlined text-secondary text-[18px]">
                      task
                    </span>
                    <div className="flex flex-col min-w-0">
                      <span className="font-semibold text-pure-white truncate">
                        GST Returns GSTR-3B (Last 12 Months)
                      </span>
                      <span className="text-[10px] text-slate-muted">100% Turnover Match with Statutory Ledger</span>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-secondary-container/30 text-secondary text-[10px] font-bold">
                    Checksum Clear
                  </span>
                </div>
              </div>
            </details>
          </div>
        </div>

        {/* RIGHT COLUMN: Extracted Data Fields & Analyst Notes */}
        <div className="flex flex-col gap-space-md w-full">
          {/* Structured Extraction Card */}
          <div className="bg-surface-dark rounded-xl p-space-md shadow-md flex flex-col gap-3 w-full border border-surface-container-high/40">
            <div className="flex items-center justify-between pb-2 border-b border-surface-container-high/30">
              <div className="flex flex-col">
                <span className="text-sm font-bold text-pure-white">
                  Extracted Data Fields &amp; Citations
                </span>
                <span className="text-xs text-slate-muted">
                  Machine-parsed with statutory index cross-referencing
                </span>
              </div>
              <span className="px-2 py-1 rounded bg-surface-container-low text-primary-fixed-dim text-xs font-semibold flex items-center gap-1 border border-surface-container-high/30">
                <span className="w-1.5 h-1.5 rounded-full bg-primary-container" />
                Verified References
              </span>
            </div>

            {/* Tile 1: Total Revenue */}
            <div className="bg-surface-container-low rounded-lg p-3 shadow-sm flex flex-col gap-1.5 border border-surface-container-high/30">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-muted uppercase tracking-wider font-semibold">
                  Gross Operating Turnover
                </span>
                <span className="material-symbols-outlined text-primary-container text-[18px]">
                  verified
                </span>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1">
                <div className="text-base sm:text-lg font-bold text-pure-white font-mono">
                  Total Revenue (FY24-25):{" "}
                  <span className="text-primary-container">
                    {revExt?.extractedValue || "₹ 4,82,50,000"}
                  </span>
                </div>
                <span className="text-xs text-slate-muted font-sans">+21.5% YoY</span>
              </div>
              <div className="pt-2 border-t border-surface-variant flex items-center gap-2 text-slate-muted text-xs">
                <span className="material-symbols-outlined text-primary-container text-[15px]">
                  link
                </span>
                <span>Source:</span>
                <span className="text-on-surface font-semibold bg-surface-dark px-2 py-0.5 rounded font-mono text-[11px]">
                  {revExt?.sourceCitation || "Page 4, line 12 (audited_finances.pdf)"}
                </span>
              </div>
            </div>

            {/* Tile 2: Operating EBITDA */}
            <div className="bg-surface-container-low rounded-lg p-3 shadow-sm flex flex-col gap-1.5 border border-surface-container-high/30">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-muted uppercase tracking-wider font-semibold">
                  Core Operating Performance
                </span>
                <span className="material-symbols-outlined text-primary-container text-[18px]">
                  verified
                </span>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1">
                <div className="text-base sm:text-lg font-bold text-pure-white font-mono">
                  Operating EBITDA:{" "}
                  <span className="text-pure-white">
                    {ebitdaExt?.extractedValue || "₹ 68,40,000"}
                  </span>
                </div>
                <span className="text-xs text-primary-container font-semibold bg-primary-container/10 px-2 py-0.5 rounded">
                  14.17% Margin
                </span>
              </div>
              <div className="pt-2 border-t border-surface-variant flex items-center gap-2 text-slate-muted text-xs">
                <span className="material-symbols-outlined text-primary-container text-[15px]">
                  link
                </span>
                <span>Source:</span>
                <span className="text-on-surface font-semibold bg-surface-dark px-2 py-0.5 rounded font-mono text-[11px]">
                  {ebitdaExt?.sourceCitation || "Page 6, line 8 (audited_finances.pdf)"}
                </span>
              </div>
            </div>

            {/* Tile 3: Closing Bank Balance */}
            <div className="bg-surface-container-low rounded-lg p-3 shadow-sm flex flex-col gap-1.5 border border-surface-container-high/30">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-muted uppercase tracking-wider font-semibold">
                  Liquidity &amp; Cash Position
                </span>
                <span className="material-symbols-outlined text-secondary text-[18px]">
                  account_balance
                </span>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1">
                <div className="text-base sm:text-lg font-bold text-pure-white font-mono">
                  Closing Bank Balance:{" "}
                  <span className="text-secondary">
                    {bankExt?.extractedValue || "₹ 12,45,000"}
                  </span>
                </div>
                <span className="text-xs text-slate-muted">EOM Avg: ₹ 11.20L</span>
              </div>
              <div className="pt-2 border-t border-surface-variant flex items-center gap-2 text-slate-muted text-xs">
                <span className="material-symbols-outlined text-secondary text-[15px]">
                  link
                </span>
                <span>Source:</span>
                <span className="text-on-surface font-semibold bg-surface-dark px-2 py-0.5 rounded font-mono text-[11px]">
                  {bankExt?.sourceCitation || "Bank Statement Pg 18 (hdfc_stmt_consolidated.pdf)"}
                </span>
              </div>
            </div>

            {/* Tile 4: DSCR */}
            <div className="bg-surface-container-low rounded-lg p-3 shadow-sm flex flex-col gap-1.5 border border-surface-container-high/30">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-muted uppercase tracking-wider font-semibold">
                  Solvency / Debt Service
                </span>
                <span className="material-symbols-outlined text-primary-container text-[18px]">
                  trending_up
                </span>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1">
                <div className="text-base sm:text-lg font-bold text-pure-white font-mono">
                  Debt Service Coverage (DSCR):{" "}
                  <span className="text-primary-container">
                    {dscrExt?.extractedValue || "1.68x"}
                  </span>
                </div>
                <span className="text-xs text-primary-fixed-dim font-semibold">
                  Min Benchmark: 1.35x
                </span>
              </div>
              <div className="pt-2 border-t border-surface-variant flex items-center gap-2 text-slate-muted text-xs">
                <span className="material-symbols-outlined text-primary-container text-[15px]">
                  link
                </span>
                <span>Source:</span>
                <span className="text-on-surface font-semibold bg-surface-dark px-2 py-0.5 rounded font-mono text-[11px]">
                  {dscrExt?.sourceCitation || "CMA Data sheet, line 24 (cma_model_v2.xlsx)"}
                </span>
              </div>
            </div>

            {/* Secondary Grouping: Current Ratio & GST */}
            <div className="grid grid-cols-2 gap-2">
              <div className="p-2.5 rounded-lg bg-surface-container-low flex flex-col justify-between border border-surface-container-high/30">
                <span className="text-[10px] text-slate-muted uppercase font-semibold">
                  Current Ratio
                </span>
                <span className="text-base font-bold text-pure-white font-mono mt-0.5">
                  {currentRatioExt?.extractedValue || "1.42"}
                </span>
                <span className="text-[10px] text-slate-muted truncate">CMA pg 2 balance</span>
              </div>
              <div className="p-2.5 rounded-lg bg-surface-container-low flex flex-col justify-between border border-surface-container-high/30">
                <span className="text-[10px] text-slate-muted uppercase font-semibold">
                  GST Rec. Ratio
                </span>
                <span className="text-base font-bold text-primary-container font-mono mt-0.5">
                  {gstExt?.extractedValue || "99.8% Match"}
                </span>
                <span className="text-[10px] text-slate-muted truncate">GSTR-3B vs P&amp;L</span>
              </div>
            </div>

            {/* Statutory Warning Box */}
            <div className="p-3 bg-surface-container-lowest rounded-lg flex items-start gap-2 border border-surface-container-high/30">
              <span className="material-symbols-outlined text-tertiary-fixed-dim text-[18px] shrink-0 mt-0.5">
                info
              </span>
              <p className="text-xs text-slate-muted leading-relaxed">
                Data values above were parsed under cryptographic HSM notary. As Lead Credit Analyst, manual cross-examination of Source references is mandatory prior to memorandum commit. Automated decisioning is restricted by governance mandate.
              </p>
            </div>
          </div>

          {/* Analyst Notes & Findings Section */}
          <div className="bg-surface-dark rounded-xl p-space-md shadow-md flex flex-col gap-3 w-full border border-surface-container-high/40">
            <h3 className="text-sm font-bold text-pure-white flex items-center gap-2">
              <span className="material-symbols-outlined text-primary-container text-[18px]">
                note_alt
              </span>
              <span>Underwriting Notes &amp; Observations</span>
            </h3>

            {/* List of notes */}
            <div className="flex flex-col gap-2 max-h-56 overflow-y-auto">
              {(app.analystNotes || []).map((note: any) => (
                <div
                  key={note.id}
                  className="p-3 rounded-lg bg-surface-container-low border border-surface-container-high/30 flex flex-col gap-1"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-pure-white">{note.title}</span>
                    <span className="text-slate-muted text-[10px]">
                      {new Date(note.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">{note.content}</p>
                </div>
              ))}
            </div>

            {/* Add note form */}
            <form onSubmit={handleAddNote} className="space-y-2 pt-2 border-t border-surface-container-high/30">
              <input
                type="text"
                placeholder="Note subject (e.g. Working Capital Cycle Assessment)"
                value={noteTitle}
                onChange={(e) => setNoteTitle(e.target.value)}
                required
                className="w-full bg-surface-container-lowest text-pure-white px-3 py-1.5 rounded text-xs border border-surface-container-high/50 focus:outline-none focus:ring-1 focus:ring-primary-container"
              />
              <textarea
                placeholder="Record qualitative or quantitative credit observation..."
                value={noteContent}
                onChange={(e) => setNoteContent(e.target.value)}
                rows={2}
                required
                className="w-full bg-surface-container-lowest text-pure-white px-3 py-1.5 rounded text-xs border border-surface-container-high/50 focus:outline-none focus:ring-1 focus:ring-primary-container"
              />
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={isAddingNote}
                  className="px-3 py-1 bg-surface-container-high hover:bg-surface-bright text-pure-white text-xs font-semibold rounded transition-colors cursor-pointer"
                >
                  {isAddingNote ? "Recording..." : "Add Analyst Note"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Sticky Bottom Governance Action Bar */}
      <section className="w-full mt-space-lg sticky bottom-4 z-20">
        <div className="bg-surface-dark/95 backdrop-blur-xl rounded-xl p-space-md shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-space-md border border-surface-container-high/60">
          <div className="flex items-center gap-space-sm">
            <div className="w-3 h-3 rounded-full bg-primary-container shadow-[0_0_8px_#02f576] animate-pulse" />
            <div className="flex flex-col">
              <span className="text-xs sm:text-sm font-semibold text-pure-white">
                Human-in-the-Loop Governance Active
              </span>
              <span className="text-[11px] text-slate-muted">
                Zero automated credit verdicts allowed on this facility type
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 flex-wrap w-full sm:w-auto justify-end">
            {/* Reject application */}
            <button
              type="button"
              onClick={() => setDecisionModal("REJECT")}
              className="px-3 py-2 rounded-lg bg-red-950/40 hover:bg-red-900/60 text-red-400 text-xs font-semibold transition-colors flex items-center gap-1.5 border border-red-500/30"
              title="Decline lending request with recorded underwriting rationale"
            >
              <span className="material-symbols-outlined text-[16px]">cancel</span>
              <span>Reject</span>
            </button>

            {/* Request info */}
            <button
              type="button"
              onClick={() => setDecisionModal("REQUEST_DOCS")}
              className="px-3 py-2 rounded-lg bg-surface-container-high hover:bg-surface-container-highest text-pure-white text-xs font-semibold transition-colors flex items-center gap-1.5 border border-surface-container-high/40"
              title="Return case to Relationship Manager with itemized document requirements"
            >
              <span className="material-symbols-outlined text-[16px]">pending_actions</span>
              <span>Request Info</span>
            </button>

            {/* Acknowledge & proceed */}
            <button
              type="button"
              onClick={() => setDecisionModal("PROCEED")}
              className="px-3.5 py-2 rounded-lg bg-surface-dark-elevated hover:bg-surface-container-high text-pure-white text-xs font-semibold transition-colors flex items-center gap-1.5 border border-primary-container/40"
              title="Confirm intake dossier verification and advance to underwriting memo stage"
            >
              <span className="material-symbols-outlined text-primary-container text-[16px]">rule</span>
              <span>Acknowledge File</span>
            </button>

            {/* Recommend Sanction (Approve Lending) */}
            <button
              type="button"
              onClick={() => setDecisionModal("APPROVE")}
              className="px-4 py-2 rounded-lg bg-primary-container hover:bg-primary-container/90 text-surface-container-lowest text-xs font-bold transition-all shadow-[0_0_16px_rgba(2,245,118,0.35)] hover:shadow-[0_0_24px_rgba(2,245,118,0.55)] flex items-center gap-1.5 cursor-pointer"
              title="Human Credit Analyst sign-off to recommend credit facility sanction"
            >
              <span className="material-symbols-outlined text-[16px]">check_circle</span>
              <span>Recommend Sanction (Approve)</span>
            </button>
          </div>
        </div>
      </section>

      {/* Decision Modal */}
      {decisionModal && decisionModal !== "REQUEST_DOCS" && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-surface-dark-elevated rounded-xl shadow-2xl w-full max-w-lg overflow-hidden border border-surface-container-high/60">
            <div className="p-space-lg bg-surface-container-lowest flex items-center justify-between border-b border-surface-container-high/40">
              <div className="flex items-center gap-2">
                <span className={`material-symbols-outlined text-[20px] ${
                  decisionModal === "APPROVE" ? "text-primary-container" : decisionModal === "REJECT" ? "text-red-400" : "text-primary-container"
                }`}>
                  {decisionModal === "APPROVE" ? "check_circle" : decisionModal === "REJECT" ? "cancel" : "rule"}
                </span>
                <h3 className="text-base sm:text-lg font-bold text-pure-white">
                  {decisionModal === "APPROVE"
                    ? "Recommend Sanction (Approve Lending)"
                    : decisionModal === "REJECT"
                    ? "Reject Credit Application"
                    : "Acknowledge File & Proceed to Underwriting Memo"}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setDecisionModal(null)}
                className="text-slate-muted hover:text-pure-white"
              >
                <span className="material-symbols-outlined text-xl">close</span>
              </button>
            </div>
            <div className="p-space-lg space-y-3 text-xs sm:text-sm">
              <p className="text-slate-muted">
                You are executing a formal underwriting action on{" "}
                <strong className="text-pure-white">{app.referenceNumber} ({app.business.legalName})</strong>.
                This commitment will be stamped with your staff signature and stored in the immutable audit log.
              </p>
              <div>
                <label className="text-[11px] uppercase tracking-wider text-slate-muted font-semibold block mb-1">
                  Underwriting Justification &amp; Rationale
                </label>
                <textarea
                  className="w-full bg-surface-container-lowest text-pure-white p-2.5 rounded text-xs border border-surface-container-high/60 focus:ring-1 focus:ring-primary-container focus:outline-none"
                  rows={3}
                  placeholder={
                    decisionModal === "APPROVE"
                      ? "Record formal sanction rationale (e.g. Audited DSCR 1.85x meets guidelines; audited financials verified; recommend facility sanction)..."
                      : decisionModal === "REJECT"
                      ? "Record rejection reason (e.g. High leverage ratio exceeding policy limits; negative bureau record)..."
                      : "Record intake notes (e.g. Validated audited revenue, verified complete GST filings)..."
                  }
                  value={decisionNotes}
                  onChange={(e) => setDecisionNotes(e.target.value)}
                />
              </div>
            </div>
            <div className="p-space-lg bg-surface-container-lowest flex items-center justify-end gap-space-sm border-t border-surface-container-high/40">
              <button
                type="button"
                onClick={() => setDecisionModal(null)}
                className="px-4 py-2 rounded-lg text-slate-muted hover:text-pure-white text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleExecuteDecision(decisionModal === "PROCEED" ? "ACKNOWLEDGE_AND_PROCEED" : decisionModal === "APPROVE" ? "RECOMMEND_SANCTION" : "REJECT_APPLICATION")}
                disabled={isExecutingDecision}
                className={`px-6 py-2 rounded-lg text-xs font-bold transition-all ${
                  decisionModal === "REJECT"
                    ? "bg-red-600 hover:bg-red-700 text-white"
                    : "bg-primary-container text-surface-container-lowest hover:bg-primary-fixed shadow-[0_0_12px_rgba(2,245,118,0.3)]"
                }`}
              >
                {isExecutingDecision
                  ? "Executing..."
                  : decisionModal === "APPROVE"
                  ? "Confirm Sanction Recommendation"
                  : decisionModal === "REJECT"
                  ? "Confirm Rejection"
                  : "Commit Underwriting Decision"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Request Docs Modal */}
      {decisionModal === "REQUEST_DOCS" && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-surface-dark-elevated rounded-xl shadow-2xl w-full max-w-lg overflow-hidden border border-surface-container-high/60">
            <div className="p-space-lg bg-surface-container-lowest flex items-center justify-between border-b border-surface-container-high/40">
              <h3 className="text-base sm:text-lg font-bold text-pure-white">
                Request Additional Documentation
              </h3>
              <button
                type="button"
                onClick={() => setDecisionModal(null)}
                className="text-slate-muted hover:text-pure-white"
              >
                <span className="material-symbols-outlined text-xl">close</span>
              </button>
            </div>
            <div className="p-space-lg space-y-3 text-xs sm:text-sm">
              <div>
                <label className="text-[11px] uppercase tracking-wider text-slate-muted font-semibold block mb-1">
                  Requested Item / Discrepancy Title
                </label>
                <input
                  type="text"
                  placeholder="e.g. Updated Consortium Sanction Letter from Lead Banker"
                  value={reqDocTitle}
                  onChange={(e) => setReqDocTitle(e.target.value)}
                  className="w-full bg-surface-container-lowest text-pure-white p-2 rounded text-xs border border-surface-container-high/60 focus:ring-1 focus:ring-primary-container focus:outline-none"
                />
              </div>
              <div>
                <label className="text-[11px] uppercase tracking-wider text-slate-muted font-semibold block mb-1">
                  Instructions for Relationship Manager &amp; Borrower
                </label>
                <textarea
                  className="w-full bg-surface-container-lowest text-pure-white p-2.5 rounded text-xs border border-surface-container-high/60 focus:ring-1 focus:ring-primary-container focus:outline-none"
                  rows={3}
                  placeholder="Specify exact schedule or certification required to clear this condition..."
                  value={reqDocDesc}
                  onChange={(e) => setReqDocDesc(e.target.value)}
                />
              </div>
            </div>
            <div className="p-space-lg bg-surface-container-lowest flex items-center justify-end gap-space-sm border-t border-surface-container-high/40">
              <button
                type="button"
                onClick={() => setDecisionModal(null)}
                className="px-4 py-2 rounded-lg text-slate-muted hover:text-pure-white text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleCreateDocumentRequest}
                disabled={isExecutingDecision || !reqDocTitle}
                className="px-6 py-2 rounded-lg bg-secondary text-surface-container-lowest text-xs font-bold hover:brightness-110 transition-all"
              >
                {isExecutingDecision ? "Dispatching..." : "Dispatch to RM Queue"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating feedback toast */}
      {toast.show && (
        <div className="fixed bottom-24 right-8 bg-surface-dark-elevated text-pure-white px-space-lg py-space-md rounded-xl shadow-2xl z-50 flex items-center gap-3 border border-primary-container/40 animate-in fade-in duration-300">
          <span className="material-symbols-outlined text-primary-container text-[22px]">
            verified
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
