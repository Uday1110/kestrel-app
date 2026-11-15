"use client";

import { useState } from "react";
import { UploadValidationDrawer } from "./UploadValidationDrawer";

interface DocumentsListViewProps {
  documents: any[];
  currentUser: any;
}

export function DocumentsListView({ documents: initialDocs }: DocumentsListViewProps) {
  const [docs, setDocs] = useState(initialDocs);
  const [selectedDoc, setSelectedDoc] = useState<any | null>(null);
  const [search, setSearch] = useState("");

  const filtered = docs.filter((d) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      d.fileName.toLowerCase().includes(q) ||
      d.application.referenceNumber.toLowerCase().includes(q) ||
      d.application.business.legalName.toLowerCase().includes(q)
    );
  });

  return (
    <div className="flex flex-col w-full pb-space-xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-md mb-space-lg">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-pure-white tracking-tight">
            Compliance Document Repository
          </h1>
          <p className="text-xs sm:text-sm text-slate-muted mt-1">
            HSM-notarized statutory filings, audited financials, and cryptographic audit proofs
          </p>
        </div>

        <div className="relative sm:w-72">
          <span className="material-symbols-outlined absolute left-3 top-2 text-slate-muted text-[18px]">
            search
          </span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search document name, ref ID..."
            className="w-full bg-surface-container-lowest text-pure-white pl-9 pr-3 py-1.5 rounded-lg text-xs placeholder-slate-muted border border-surface-container-high/60 focus:outline-none focus:ring-1 focus:ring-primary-container"
          />
        </div>
      </div>

      <div className="rounded-xl bg-surface-dark shadow-xl overflow-hidden mb-space-lg border border-surface-container-high/40">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs sm:text-sm min-w-[900px]">
            <thead>
              <tr className="bg-surface-container-lowest text-slate-muted text-xs uppercase tracking-wider border-b border-surface-container-high/30">
                <th className="py-3.5 px-4">Document Asset</th>
                <th className="py-3.5 px-4">Application Reference</th>
                <th className="py-3.5 px-4">Borrower Entity</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">Validation State</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-container-high/30">
              {filtered.map((doc) => {
                const isFlagged = doc.validationStatus === "FLAGGED" || doc.validationStatus === "FAILED";
                return (
                  <tr key={doc.id} className="hover:bg-surface-container-low/60 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-8 h-8 rounded flex items-center justify-center shrink-0 ${
                            isFlagged
                              ? "bg-error/20 text-error"
                              : "bg-surface-container-high text-primary-container"
                          }`}
                        >
                          <span className="material-symbols-outlined text-[18px]">
                            {isFlagged ? "warning" : "picture_as_pdf"}
                          </span>
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="font-semibold text-pure-white truncate max-w-[240px]">
                            {doc.fileName}
                          </span>
                          <span className="text-[11px] text-slate-muted font-mono truncate">
                            SHA256: {doc.fileHash.slice(0, 16)}...
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-semibold text-primary">
                      {doc.application.referenceNumber}
                    </td>
                    <td className="py-3.5 px-4 text-slate-300">
                      {doc.application.business.legalName}
                    </td>
                    <td className="py-3.5 px-4 text-slate-400 text-xs">
                      {doc.category.replace(/_/g, " ")}
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[11px] font-bold ${
                          isFlagged
                            ? "bg-error/20 text-error"
                            : "bg-primary-container/20 text-primary-container"
                        }`}
                      >
                        <span className="material-symbols-outlined text-[13px]">
                          {isFlagged ? "error" : "check_circle"}
                        </span>
                        <span>{doc.validationStatus}</span>
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="inline-flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setSelectedDoc(doc)}
                          className="px-2.5 py-1 rounded bg-surface-container-high hover:bg-surface-bright text-pure-white text-xs font-semibold"
                        >
                          Validation Drawer
                        </button>
                        <a
                          href={`/api/documents/${doc.id}/download`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1 rounded bg-surface-container-high hover:bg-surface-bright text-slate-muted hover:text-pure-white"
                          title="Download Document"
                        >
                          <span className="material-symbols-outlined text-[16px]">download</span>
                        </a>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <UploadValidationDrawer
        isOpen={!!selectedDoc}
        onClose={() => setSelectedDoc(null)}
        documentData={selectedDoc}
        applicationRef={selectedDoc?.application.referenceNumber}
      />
    </div>
  );
}
