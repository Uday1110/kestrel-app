"use client";

import { useState } from "react";
import Link from "next/link";
import { formatINR } from "@/lib/formatters";
import { NewApplicationModal } from "./NewApplicationModal";

interface ApplicationListViewProps {
  applications: any[];
  currentUser: any;
}

export function ApplicationListView({
  applications: initialApps,
  currentUser,
}: ApplicationListViewProps) {
  const [apps, setApps] = useState(initialApps);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const refreshList = async () => {
    const res = await fetch("/api/applications");
    const data = await res.json();
    if (data.success) {
      setApps(data.applications);
    }
  };

  const filtered = apps.filter((app) => {
    if (statusFilter !== "ALL" && app.status !== statusFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      const name = app.business.legalName.toLowerCase();
      const ref = app.referenceNumber.toLowerCase();
      return name.includes(q) || ref.includes(q);
    }
    return true;
  });

  return (
    <div className="flex flex-col w-full pb-space-xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-md mb-space-lg">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-pure-white tracking-tight">
            Corporate Lending Applications
          </h1>
          <p className="text-xs sm:text-sm text-slate-muted mt-1">
            Origination dossier intake, mandatory checklist verification, and package submission
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 rounded-lg bg-primary-container text-surface-container-lowest text-xs uppercase tracking-wider font-bold shadow-[0_0_16px_rgba(2,245,118,0.25)] hover:shadow-[0_0_24px_rgba(2,245,118,0.45)] hover:bg-primary-fixed transition-all flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
        >
          <span className="material-symbols-outlined text-[18px]">add_circle</span>
          <span>New Application</span>
        </button>
      </div>

      {/* Filter and search bar */}
      <div className="p-3 bg-surface-dark rounded-xl shadow-md mb-space-md flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-space-md border border-surface-container-high/40">
        <div className="flex items-center gap-1 overflow-x-auto">
          {["ALL", "DOCS_IN_PROGRESS", "SUBMITTED", "UNDER_REVIEW", "INFO_REQUESTED", "APPROVED"].map(
            (st) => (
              <button
                key={st}
                type="button"
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1 rounded-md text-xs font-semibold whitespace-nowrap transition-colors ${
                  statusFilter === st
                    ? "bg-surface-container-high text-pure-white shadow-sm font-bold"
                    : "text-slate-muted hover:text-pure-white"
                }`}
              >
                {st === "ALL" ? "All Applications" : st.replace(/_/g, " ")}
              </button>
            )
          )}
        </div>

        <div className="relative sm:w-64">
          <span className="material-symbols-outlined absolute left-3 top-2 text-slate-muted text-[18px]">
            search
          </span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search entity, ref ID..."
            className="w-full bg-surface-container-lowest text-pure-white pl-9 pr-3 py-1.5 rounded-lg text-xs placeholder-slate-muted border border-surface-container-high/60 focus:outline-none focus:ring-1 focus:ring-primary-container"
          />
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl bg-surface-dark shadow-xl overflow-hidden mb-space-lg border border-surface-container-high/40">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs sm:text-sm min-w-[900px]">
            <thead>
              <tr className="bg-surface-container-lowest text-slate-muted text-xs uppercase tracking-wider border-b border-surface-container-high/30">
                <th className="py-3.5 px-4">Ref ID</th>
                <th className="py-3.5 px-4">Borrower Entity Name</th>
                <th className="py-3.5 px-4">Facility Requested</th>
                <th className="py-3.5 px-4">Assigned RM</th>
                <th className="py-3.5 px-4">Readiness Pipeline</th>
                <th className="py-3.5 px-4 text-center">Status</th>
                <th className="py-3.5 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-container-high/30">
              {filtered.map((app) => (
                <tr
                  key={app.id}
                  className="hover:bg-surface-container-low/60 transition-colors"
                >
                  <td className="py-3.5 px-4 font-mono font-bold text-primary">
                    {app.referenceNumber}
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="flex flex-col">
                      <span className="font-semibold text-pure-white text-sm">
                        {app.business.legalName}
                      </span>
                      <span className="text-slate-muted text-xs">
                        Sector: {app.business.industrySector} • {app.business.city}
                      </span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-pure-white font-mono">
                      {formatINR(app.facilityAmount)}
                    </div>
                    <span className="text-[11px] text-slate-muted">
                      {app.facilityType.replace(/_/g, " ")} ({app.tenorMonths}m)
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-300">
                    {app.assignedRm.name}
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-primary-container font-semibold">
                          {app.intakeReadinessPercent}% Complete
                        </span>
                      </div>
                      <div className="w-28 h-1.5 bg-surface-dark-elevated rounded-full overflow-hidden border border-surface-container-high/40">
                        <div
                          className="h-full bg-primary-container rounded-full"
                          style={{ width: `${app.intakeReadinessPercent}%` }}
                        />
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-surface-container text-primary-container border border-surface-container-high/40">
                      {app.status.replace(/_/g, " ")}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <Link
                      href={`/applications/${app.id}`}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-surface-container-high hover:bg-surface-bright text-pure-white text-xs font-semibold transition-colors"
                    >
                      <span>Checklist &amp; Docs</span>
                      <span className="material-symbols-outlined text-[15px]">arrow_forward</span>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <NewApplicationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCreated={refreshList}
      />
    </div>
  );
}
