"use client";

import { useState } from "react";
import { formatINR } from "@/lib/formatters";
import { OutreachChannel } from "@/types/domain";

interface OutstandingItemsViewProps {
  initialItems: any[];
  currentUser: any;
}

export function OutstandingItemsView({
  initialItems,
  currentUser,
}: OutstandingItemsViewProps) {
  const [items, setItems] = useState(initialItems);
  const [filter, setFilter] = useState<"all" | "critical" | "missing">("all");
  const [search, setSearch] = useState("");
  const [batchPinging, setBatchPinging] = useState(false);
  const [batchPingDone, setBatchPingDone] = useState(false);

  // Chase modal state
  const [chaseModalItem, setChaseModalItem] = useState<any | null>(null);
  const [selectedChannel, setSelectedChannel] = useState<OutreachChannel>("WHATSAPP");
  const [customNote, setCustomNote] = useState("");
  const [isDispatching, setIsDispatching] = useState(false);

  // Resolve modal state
  const [resolveItem, setResolveItem] = useState<any | null>(null);
  const [resolveNote, setResolveNote] = useState("");
  const [isResolving, setIsResolving] = useState(false);

  const refreshItems = async () => {
    const res = await fetch("/api/outstanding-items");
    const data = await res.json();
    if (data.success) {
      setItems(data.items);
    }
  };

  const handleBatchPing = async () => {
    setBatchPinging(true);
    try {
      await fetch("/api/outstanding-items/batch-ping", { method: "POST" });
      setBatchPingDone(true);
      await refreshItems();
      setTimeout(() => setBatchPingDone(false), 3000);
    } catch (e) {
      console.error(e);
    } finally {
      setBatchPinging(false);
    }
  };

  const handleConfirmChase = async () => {
    if (!chaseModalItem) return;
    setIsDispatching(true);
    try {
      await fetch(`/api/outstanding-items/${chaseModalItem.id}/chase`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          channel: selectedChannel,
          customNote,
        }),
      });
      await refreshItems();
      setChaseModalItem(null);
    } finally {
      setIsDispatching(false);
    }
  };

  const handleConfirmResolve = async () => {
    if (!resolveItem) return;
    setIsResolving(true);
    try {
      await fetch(`/api/outstanding-items/${resolveItem.id}/resolve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resolutionNote: resolveNote || "Document verified and uploaded",
        }),
      });
      await refreshItems();
      setResolveItem(null);
      setResolveNote("");
    } finally {
      setIsResolving(false);
    }
  };

  const filteredItems = items.filter((item) => {
    if (filter === "critical" && item.daysOutstanding <= 10 && item.severity !== "CRITICAL") {
      return false;
    }
    if (filter === "missing" && item.daysOutstanding > 10) {
      return false;
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      const entity = item.application.business.legalName.toLowerCase();
      const ref = item.application.referenceNumber.toLowerCase();
      const title = item.title.toLowerCase();
      return entity.includes(q) || ref.includes(q) || title.includes(q);
    }
    return true;
  });

  const criticalCount = items.filter((i) => i.daysOutstanding > 10 || i.severity === "CRITICAL").length;
  const missingCount = items.filter((i) => i.daysOutstanding <= 10).length;

  return (
    <div className="flex flex-col w-full pb-space-xl">
      {/* Header & HUD */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-space-md mb-space-lg relative z-10">
        <div className="flex flex-col">
          <div className="flex items-center gap-space-sm mb-space-xs">
            <span className="px-space-sm py-0.5 rounded-lg bg-secondary-container/30 text-secondary text-xs tracking-wider uppercase font-semibold">
              RM Intake Operations
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-primary-container animate-pulse" />
            <span className="text-xs text-slate-muted">Synchronized Just Now</span>
          </div>
          <div className="flex items-baseline gap-space-md flex-wrap">
            <h1 className="text-2xl sm:text-3xl font-bold text-pure-white tracking-tight">
              Outstanding Items Queue
            </h1>
            <span className="text-xs sm:text-sm text-slate-muted">
              Portfolio: Commercial Lending
            </span>
          </div>
        </div>

        <div className="flex items-center gap-space-sm">
          <button
            type="button"
            onClick={handleBatchPing}
            disabled={batchPinging}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-surface-dark-elevated hover:bg-surface-container-high text-pure-white text-xs font-semibold transition-all shadow-md border border-surface-container-high/50 cursor-pointer"
          >
            <span
              className={`material-symbols-outlined text-primary-container text-[18px] ${
                batchPinging ? "animate-spin" : ""
              }`}
            >
              {batchPingDone ? "done" : "bolt"}
            </span>
            <span>
              {batchPinging
                ? "Transmitting..."
                : batchPingDone
                ? "Pings Dispatched!"
                : "Batch Automated Ping"}
            </span>
          </button>
        </div>
      </div>

      {/* Top Summary Metrics Bar */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-space-lg">
        {/* Metric 1: Awaiting Docs */}
        <div className="p-space-md rounded-xl bg-surface-dark shadow-md flex items-center justify-between group hover:bg-surface-dark-elevated transition-colors border border-surface-container-high/40">
          <div className="flex flex-col">
            <span className="text-xs text-slate-muted uppercase tracking-wider font-semibold">
              Awaiting Docs
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-3xl font-bold text-pure-white tracking-tight">
                {String(items.length).padStart(2, "0")}
              </span>
              <span className="text-xs text-error bg-error-container/30 px-2 py-0.5 rounded-lg font-semibold">
                +{criticalCount} overdue
              </span>
            </div>
            <span className="text-xs text-slate-muted mt-1">{items.length} Items Pending RM Action</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-surface-container-high flex items-center justify-center text-primary-container group-hover:scale-110 transition-transform">
            <span className="material-symbols-outlined text-[26px]">pending_actions</span>
          </div>
        </div>

        {/* Metric 2: Avg Outstanding SLA */}
        <div className="p-space-md rounded-xl bg-surface-dark shadow-md flex items-center justify-between group hover:bg-surface-dark-elevated transition-colors border border-surface-container-high/40">
          <div className="flex flex-col">
            <span className="text-xs text-slate-muted uppercase tracking-wider font-semibold">
              Avg. Outstanding SLA
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-3xl font-bold text-pure-white tracking-tight font-mono">
                8.2<span className="text-sm font-normal text-slate-muted">d</span>
              </span>
              <span className="text-xs text-tertiary-fixed-dim bg-on-tertiary/40 px-2 py-0.5 rounded-lg font-semibold">
                Target ≤ 5d
              </span>
            </div>
            <span className="text-xs text-error mt-1 flex items-center gap-1 font-semibold">
              <span className="material-symbols-outlined text-[14px]">arrow_upward</span>
              +3.2d above target delta
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-surface-container-high flex items-center justify-center text-tertiary-fixed-dim group-hover:scale-110 transition-transform">
            <span className="material-symbols-outlined text-[26px]">timer_off</span>
          </div>
        </div>

        {/* Metric 3: Pipeline Exposure Sparkline */}
        <div className="p-space-md rounded-xl bg-surface-dark shadow-md flex flex-col justify-between group hover:bg-surface-dark-elevated transition-colors border border-surface-container-high/40">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-muted uppercase tracking-wider font-semibold">
              Pipeline Exposure
            </span>
            <span className="material-symbols-outlined text-secondary text-[20px]">currency_rupee</span>
          </div>
          <div className="flex items-end justify-between mt-1">
            <div>
              <span className="text-xl sm:text-2xl font-bold text-pure-white">₹ 42.50 Cr</span>
              <p className="text-[11px] text-slate-muted">Value locked in intake</p>
            </div>
            <svg className="w-24 h-10 overflow-visible text-primary-container" viewBox="0 0 100 40">
              <path
                d="M0,35 Q15,30 30,22 T60,25 T80,10 L100,5"
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeWidth="2.5"
              />
              <circle cx="100" cy="5" fill="currentColor" r="3.5" className="animate-ping" />
              <circle cx="100" cy="5" fill="currentColor" r="3.5" />
            </svg>
          </div>
        </div>

        {/* Metric 4: Contact Response Ratio */}
        <div className="p-space-md rounded-xl bg-surface-dark shadow-md flex items-center justify-between group hover:bg-surface-dark-elevated transition-colors border border-surface-container-high/40">
          <div className="flex flex-col">
            <span className="text-xs text-slate-muted uppercase tracking-wider font-semibold">
              Borrower Outreach
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-3xl font-bold text-primary-fixed-dim tracking-tight">75%</span>
              <span className="text-xs text-slate-muted">3 of 4 active</span>
            </div>
            <span className="text-xs text-slate-muted mt-1">Channels: WhatsApp, Email, SMS</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-surface-container-high flex items-center justify-center text-primary-fixed-dim">
            <span className="material-symbols-outlined text-[24px]">chat_bubble</span>
          </div>
        </div>
      </div>

      {/* Active Filters & Sorting Control Bar */}
      <div className="p-space-md rounded-xl bg-surface-dark shadow-md mb-space-md flex flex-wrap items-center justify-between gap-space-md border border-surface-container-high/40">
        <div className="flex flex-wrap items-center gap-space-sm">
          <button
            type="button"
            onClick={() => setFilter("all")}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all flex items-center gap-2 ${
              filter === "all"
                ? "bg-primary-container text-on-primary font-bold shadow-[0_0_12px_rgba(2,245,118,0.2)]"
                : "bg-surface-container-high text-slate-muted hover:text-pure-white"
            }`}
          >
            <span>All Items</span>
            <span className="w-4 h-4 rounded-full bg-on-primary text-primary text-[10px] inline-flex items-center justify-center font-bold">
              {items.length}
            </span>
          </button>
          <button
            type="button"
            onClick={() => setFilter("critical")}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all flex items-center gap-2 ${
              filter === "critical"
                ? "bg-primary-container text-on-primary font-bold shadow-[0_0_12px_rgba(2,245,118,0.2)]"
                : "bg-surface-container-high text-slate-muted hover:text-pure-white"
            }`}
          >
            <span>Critical (&gt;10 Days)</span>
            <span className="w-4 h-4 rounded-full bg-error-container text-error text-[10px] inline-flex items-center justify-center font-bold">
              {criticalCount}
            </span>
          </button>
          <button
            type="button"
            onClick={() => setFilter("missing")}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all flex items-center gap-2 ${
              filter === "missing"
                ? "bg-primary-container text-on-primary font-bold shadow-[0_0_12px_rgba(2,245,118,0.2)]"
                : "bg-surface-container-high text-slate-muted hover:text-pure-white"
            }`}
          >
            <span>Standard Items</span>
            <span className="w-4 h-4 rounded-full bg-surface-bright text-pure-white text-[10px] inline-flex items-center justify-center font-bold">
              {missingCount}
            </span>
          </button>
        </div>

        {/* Search */}
        <div className="flex items-center gap-space-md flex-1 sm:flex-initial justify-end">
          <div className="relative w-full sm:w-64">
            <span className="material-symbols-outlined absolute left-3 top-2.5 text-slate-muted text-[18px]">
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
      </div>

      {/* Data Table */}
      <div className="rounded-xl bg-surface-dark shadow-xl overflow-hidden mb-space-lg border border-surface-container-high/40">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs sm:text-sm min-w-[920px]">
            <thead>
              <tr className="bg-surface-container-lowest text-slate-muted text-xs uppercase tracking-wider border-b border-surface-container-high/30">
                <th className="py-3.5 px-4">Borrower / Entity Name</th>
                <th className="py-3.5 px-4">Application Ref ID</th>
                <th className="py-3.5 px-4">Facility Requested</th>
                <th className="py-3.5 px-4">Missing Document / Task</th>
                <th className="py-3.5 px-4">Days Outstanding</th>
                <th className="py-3.5 px-4">Last Channel</th>
                <th className="py-3.5 px-4 text-right">Quick Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-container-high/30">
              {filteredItems.map((item) => {
                const isOverdue = item.daysOutstanding > 10;
                return (
                  <tr
                    key={item.id}
                    className="hover:bg-surface-dark-elevated transition-colors"
                  >
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-surface-container-high flex items-center justify-center font-bold text-primary-container text-xs shrink-0 border border-surface-container-high/50">
                          {item.application.business.legalName.slice(0, 2).toUpperCase()}
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="font-bold text-pure-white truncate max-w-[200px]">
                            {item.application.business.legalName}
                          </span>
                          <span className="text-[11px] text-slate-muted truncate">
                            {item.application.business.contactName} • {item.application.business.city}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-mono text-primary font-semibold">
                        {item.application.referenceNumber}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-pure-white">
                      {formatINR(item.application.facilityAmount)}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex flex-col max-w-[260px]">
                        <span className="font-semibold text-pure-white truncate">
                          {item.title}
                        </span>
                        <span className="text-slate-muted text-xs truncate">
                          {item.description}
                        </span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center gap-1 font-mono font-bold text-xs px-2 py-0.5 rounded ${
                          isOverdue
                            ? "bg-error/20 text-error"
                            : "bg-surface-container-high text-pure-white"
                        }`}
                      >
                        {item.daysOutstanding} Days
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="text-xs uppercase tracking-wider text-slate-muted font-semibold">
                        {item.lastContactedChannel || "EMAIL"}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="inline-flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setChaseModalItem(item);
                            setSelectedChannel((item.lastContactedChannel as any) || "WHATSAPP");
                          }}
                          className="px-3 py-1 rounded-md bg-surface-container-high hover:bg-surface-bright text-pure-white text-xs font-semibold transition-colors"
                        >
                          Dispatch Chase
                        </button>
                        <button
                          type="button"
                          onClick={() => setResolveItem(item)}
                          className="px-3 py-1 rounded-md bg-primary-container text-surface-container-lowest text-xs font-bold hover:bg-primary-fixed transition-colors"
                        >
                          Resolve
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Scope Boundary Notice */}
      <div className="p-space-md rounded-xl bg-surface-container-low flex items-start sm:items-center justify-between gap-space-md text-slate-muted border border-surface-container-high/40">
        <div className="flex items-center gap-space-sm">
          <span className="material-symbols-outlined text-secondary text-[22px] shrink-0">
            info
          </span>
          <p className="text-xs leading-relaxed">
            <strong className="text-pure-white font-semibold">Boundary Note:</strong> Intake document chasing &amp; completeness tracking only. Risk rating calibration, CAM compilation, and exposure authorization decisions occur strictly in the human credit desk review module.
          </p>
        </div>
      </div>

      {/* Dispatch Chase Modal */}
      {chaseModalItem && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-surface-dark-elevated rounded-xl shadow-2xl w-full max-w-lg overflow-hidden border border-surface-container-high/60 animate-in fade-in duration-200">
            <div className="p-space-lg flex items-center justify-between bg-surface-container-lowest border-b border-surface-container-high/40">
              <div className="flex items-center gap-space-sm">
                <span className="material-symbols-outlined text-primary-container text-[24px]">
                  send
                </span>
                <h3 className="text-base sm:text-lg font-bold text-pure-white">
                  Dispatch Document Chase
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setChaseModalItem(null)}
                className="text-slate-muted hover:text-pure-white"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>
            <div className="p-space-lg space-y-space-md text-xs sm:text-sm">
              <div>
                <label className="text-[11px] uppercase tracking-wider text-slate-muted block mb-1">
                  Borrower
                </label>
                <div className="text-base font-bold text-pure-white">
                  {chaseModalItem.application.business.legalName}
                </div>
                <span className="text-xs text-primary-fixed-dim">
                  Ref: {chaseModalItem.application.referenceNumber} | Overdue by {chaseModalItem.daysOutstanding} Days
                </span>
              </div>
              <div>
                <label className="text-[11px] uppercase tracking-wider text-slate-muted block mb-2 font-semibold">
                  Select Primary Multi-Channel Route
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedChannel("WHATSAPP")}
                    className={`p-3 rounded-lg flex flex-col items-center gap-1 border transition-all ${
                      selectedChannel === "WHATSAPP"
                        ? "bg-surface-container border-primary-container text-pure-white"
                        : "bg-surface-container-low border-surface-container-high/40 text-slate-muted"
                    }`}
                  >
                    <span className="material-symbols-outlined text-primary-container text-[20px]">
                      chat
                    </span>
                    <span className="text-xs font-semibold">WhatsApp</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedChannel("EMAIL")}
                    className={`p-3 rounded-lg flex flex-col items-center gap-1 border transition-all ${
                      selectedChannel === "EMAIL"
                        ? "bg-surface-container border-secondary text-pure-white"
                        : "bg-surface-container-low border-surface-container-high/40 text-slate-muted"
                    }`}
                  >
                    <span className="material-symbols-outlined text-secondary text-[20px]">
                      mail
                    </span>
                    <span className="text-xs font-semibold">Official Mail</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedChannel("SMS")}
                    className={`p-3 rounded-lg flex flex-col items-center gap-1 border transition-all ${
                      selectedChannel === "SMS"
                        ? "bg-surface-container border-tertiary-fixed-dim text-pure-white"
                        : "bg-surface-container-low border-surface-container-high/40 text-slate-muted"
                    }`}
                  >
                    <span className="material-symbols-outlined text-tertiary-fixed-dim text-[20px]">
                      sms
                    </span>
                    <span className="text-xs font-semibold">SMS &amp; Portal</span>
                  </button>
                </div>
              </div>
              <div>
                <label className="text-[11px] uppercase tracking-wider text-slate-muted block mb-1 font-semibold">
                  Generated Pre-fill Template
                </label>
                <div className="p-3 rounded-lg bg-surface-container-lowest text-xs text-on-surface-variant font-mono border border-surface-container-high/40 leading-relaxed">
                  "Dear {chaseModalItem.application.business.contactName}, your lending file ({chaseModalItem.application.referenceNumber}) is pending: {chaseModalItem.title}. Kindly upload via your secure portal link: https://portal.kestrel.internal/intake/upload?ref={chaseModalItem.application.referenceNumber}"
                </div>
              </div>
            </div>
            <div className="p-space-lg bg-surface-container-lowest flex items-center justify-end gap-space-sm border-t border-surface-container-high/40">
              <button
                type="button"
                onClick={() => setChaseModalItem(null)}
                className="px-4 py-2 rounded-lg text-slate-muted hover:text-pure-white text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmChase}
                disabled={isDispatching}
                className="px-6 py-2 rounded-lg bg-primary-container text-on-primary text-xs font-bold shadow-[0_0_16px_rgba(2,245,118,0.35)] hover:bg-primary-fixed transition-all"
              >
                {isDispatching ? "Transmitting..." : "Send Dispatch & Log"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Resolve Modal */}
      {resolveItem && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-surface-dark-elevated rounded-xl shadow-2xl w-full max-w-lg overflow-hidden border border-surface-container-high/60">
            <div className="p-space-lg flex items-center justify-between bg-surface-container-lowest border-b border-surface-container-high/40">
              <h3 className="text-base sm:text-lg font-bold text-pure-white">
                Resolve Outstanding Item
              </h3>
              <button
                type="button"
                onClick={() => setResolveItem(null)}
                className="text-slate-muted hover:text-pure-white"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>
            <div className="p-space-lg space-y-space-md text-xs sm:text-sm">
              <div>
                <span className="text-xs text-slate-muted">Item:</span>
                <p className="font-bold text-pure-white">{resolveItem.title}</p>
              </div>
              <div>
                <label className="text-[11px] uppercase tracking-wider text-slate-muted font-semibold block mb-1">
                  Resolution Note / Verified Source
                </label>
                <textarea
                  className="w-full bg-surface-container-lowest text-pure-white p-2.5 rounded text-xs border border-surface-container-high/60 focus:ring-1 focus:ring-primary-container focus:outline-none"
                  rows={3}
                  placeholder="e.g. Received revised 300 DPI GST return via official CA email; verified checksum clear."
                  value={resolveNote}
                  onChange={(e) => setResolveNote(e.target.value)}
                />
              </div>
            </div>
            <div className="p-space-lg bg-surface-container-lowest flex items-center justify-end gap-space-sm border-t border-surface-container-high/40">
              <button
                type="button"
                onClick={() => setResolveItem(null)}
                className="px-4 py-2 rounded-lg text-slate-muted hover:text-pure-white text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmResolve}
                disabled={isResolving}
                className="px-6 py-2 rounded-lg bg-primary-container text-surface-container-lowest text-xs font-bold hover:bg-primary-fixed transition-all"
              >
                {isResolving ? "Resolving..." : "Mark as Resolved"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
