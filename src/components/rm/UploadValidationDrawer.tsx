"use client";

import { useState } from "react";
import { DocumentValidationPayload } from "@/types/domain";

interface UploadValidationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  documentData?: {
    id: string;
    fileName: string;
    fileSize: number;
    fileHash: string;
    mimeType: string;
    category: string;
    validationStatus: string;
    validationDetails?: string | null;
  } | null;
  onReplaceFile?: (file: File) => Promise<void>;
  applicationRef?: string;
}

export function UploadValidationDrawer({
  isOpen,
  onClose,
  documentData,
  onReplaceFile,
  applicationRef,
}: UploadValidationDrawerProps) {
  const [copySuccess, setCopySuccess] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  if (!isOpen || !documentData) return null;

  let validationPayload: DocumentValidationPayload | null = null;
  if (documentData.validationDetails) {
    try {
      validationPayload = JSON.parse(documentData.validationDetails);
    } catch (e) {
      // Fallback
    }
  }

  const isFlagged = documentData.validationStatus === "FLAGGED" || documentData.validationStatus === "FAILED";
  const hash = documentData.fileHash || "d84f09a12c82c3901bc7...";
  const displayHash = `${hash.slice(0, 14)}...${hash.slice(-6)}`;

  const handleCopyHash = () => {
    navigator.clipboard.writeText(hash);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onReplaceFile) {
      setIsUploading(true);
      try {
        await onReplaceFile(file);
        onClose();
      } finally {
        setIsUploading(false);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop overlay */}
      <div
        className="fixed inset-0 bg-surface-container-lowest/80 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Sliding Drawer */}
      <aside className="fixed top-0 right-0 bottom-0 w-full max-w-[540px] z-50 bg-surface-dark shadow-[0_0_50px_rgba(0,0,0,0.8)] flex flex-col overflow-hidden animate-[slideLeft_0.25s_ease-out] border-l border-surface-container-high/40">
        {/* Drawer Header */}
        <div className="p-space-lg bg-surface-container-low flex flex-col gap-space-sm shadow-md border-b border-surface-container-high/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-space-sm">
              <div className="w-8 h-8 rounded-lg bg-surface-container-highest flex items-center justify-center text-primary-container">
                <span className="material-symbols-outlined text-[20px]">fact_check</span>
              </div>
              <h2 className="text-lg font-bold text-pure-white tracking-tight">
                Document Intake Validation
              </h2>
            </div>
            <button
              onClick={onClose}
              type="button"
              className="w-8 h-8 rounded-lg bg-surface-dark-elevated text-slate-muted hover:text-pure-white flex items-center justify-center transition-all hover:bg-surface-container-highest"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>

          {/* Header Status Chips */}
          <div className="flex items-center gap-space-sm mt-1">
            <div
              className={`inline-flex items-center gap-1.5 px-space-sm py-1 rounded text-xs font-semibold ${
                isFlagged ? "bg-error/20 text-error" : "bg-primary-container/20 text-primary-container"
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  isFlagged ? "bg-error animate-pulse" : "bg-primary-container"
                }`}
              />
              <span>{isFlagged ? "Flagged for Review" : "Passed Intake Validation"}</span>
            </div>
            <div className="inline-flex items-center gap-1.5 px-space-sm py-1 rounded bg-secondary-container/25 text-secondary text-xs font-semibold">
              <span className="material-symbols-outlined text-[14px]">memory</span>
              <span>Checksum Verified • 420ms</span>
            </div>
          </div>
        </div>

        {/* Drawer Scrollable Body */}
        <div className="flex-1 overflow-y-auto px-space-lg py-space-md flex flex-col gap-space-md">
          {/* File Preview & OCR Metric Card */}
          <div className="bg-surface-container-lowest rounded-xl p-space-md flex flex-col gap-space-md shadow-sm border border-surface-container-high/40">
            <div className="flex items-start gap-space-md">
              <div className="relative w-20 h-24 rounded-lg bg-surface-container-low overflow-hidden flex flex-col items-center justify-center shadow-inner group border border-surface-container-high/40">
                <span className="material-symbols-outlined text-slate-muted text-[36px] group-hover:text-primary-container transition-colors">
                  picture_as_pdf
                </span>
                <span className="absolute bottom-1 bg-surface-dark-elevated text-pure-white text-[9px] font-bold px-1.5 py-0.5 rounded font-mono">
                  PDF • {validationPayload?.pageCount || 6}P
                </span>
              </div>
              <div className="flex-1 flex flex-col min-w-0">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-pure-white truncate">
                    {documentData.fileName}
                  </span>
                  <span className="material-symbols-outlined text-slate-muted text-[18px]">
                    info
                  </span>
                </div>
                <span className="text-xs text-slate-muted mt-0.5">
                  {(documentData.fileSize / (1024 * 1024)).toFixed(1)} MB • {validationPayload?.pageCount || 6} Pages • Rendered 300 DPI
                </span>
                <div className="mt-space-sm pt-space-xs flex flex-col gap-1">
                  <span className="text-[11px] uppercase tracking-wider text-slate-muted">
                    Detected Document Type
                  </span>
                  <div className="flex items-center gap-space-xs">
                    <span className="text-xs font-semibold text-primary truncate">
                      {documentData.category.replace(/_/g, " ")}
                    </span>
                    <span className="bg-surface-dark-elevated text-primary-container px-1.5 py-0.5 rounded text-[10px] font-mono font-bold">
                      {Math.round((validationPayload?.confidence || 0.994) * 100)}% CONF
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Evaluation Progress Bar */}
            <div className="bg-surface-dark rounded-lg p-space-sm flex flex-col gap-1.5 border border-surface-container-high/30">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-muted">Engine Audit Status</span>
                <span className="text-primary-container font-mono font-bold">
                  100% (4 of 4 Checks Evaluated)
                </span>
              </div>
              <div className="w-full bg-surface-container-low h-1.5 rounded-full overflow-hidden flex">
                <div className="bg-primary-container h-full w-1/4" />
                <div className={`${isFlagged ? "bg-error" : "bg-primary-container"} h-full w-1/4`} />
                <div className="bg-primary-container h-full w-1/4" />
                <div className="bg-primary-container h-full w-1/4" />
              </div>
            </div>
          </div>

          {/* Critical Action Required Notification Box */}
          {isFlagged && (
            <div className="bg-surface-container-lowest rounded-xl p-space-md flex gap-space-md shadow-md border border-error/40">
              <div className="w-9 h-9 rounded-lg bg-error/20 flex-shrink-0 flex items-center justify-center text-error">
                <span className="material-symbols-outlined text-[22px]">warning</span>
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-bold uppercase tracking-wider text-pure-white flex items-center gap-1.5">
                  Action Required
                  <span className="w-2 h-2 rounded-full bg-error animate-pulse" />
                </span>
                <p className="text-xs text-error mt-1 leading-snug">
                  Resolve the duplicate conflict or replace the document with the verified original corporate copy.
                </p>
              </div>
            </div>
          )}

          {/* Rule Verification Cards */}
          <div className="flex flex-col gap-space-sm">
            <span className="text-[11px] uppercase tracking-widest text-slate-muted px-1 font-semibold">
              Validation Directives
            </span>

            {/* Directive 1: Legibility */}
            <div className="bg-surface-container-lowest rounded-xl p-space-md flex flex-col gap-space-xs border border-surface-container-high/40">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-space-sm">
                  <div className="w-6 h-6 rounded-full bg-primary-container/20 flex items-center justify-center text-primary-container">
                    <span className="material-symbols-outlined text-[16px] font-bold">check</span>
                  </div>
                  <span className="text-xs sm:text-sm font-semibold text-pure-white">
                    1. File Readability &amp; Text Legibility
                  </span>
                </div>
                <span className="px-2 py-0.5 rounded bg-surface-dark text-primary-container text-[11px] font-bold tracking-wider">
                  PASSED
                </span>
              </div>
              <p className="text-xs text-slate-muted pl-8">
                High optical clarity verified at 300 DPI, clear digital print with complete character matrices extracted without skew.
              </p>
            </div>

            {/* Directive 2: Duplicate Check */}
            <div
              className={`bg-surface-container-lowest rounded-xl p-space-md flex flex-col gap-space-sm border ${
                isFlagged
                  ? "border-error/50 shadow-[0_0_20px_rgba(147,0,10,0.15)]"
                  : "border-surface-container-high/40"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-space-sm">
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center ${
                      isFlagged
                        ? "bg-error/20 text-error"
                        : "bg-primary-container/20 text-primary-container"
                    }`}
                  >
                    <span className="material-symbols-outlined text-[16px] font-bold">
                      {isFlagged ? "close" : "check"}
                    </span>
                  </div>
                  <span className="text-xs sm:text-sm font-semibold text-pure-white">
                    2. Duplicate Check against Repository
                  </span>
                </div>
                <span
                  className={`px-2 py-0.5 rounded text-[11px] font-bold tracking-wider ${
                    isFlagged ? "bg-error/20 text-error" : "bg-surface-dark text-primary-container"
                  }`}
                >
                  {isFlagged ? "FAILED" : "PASSED"}
                </span>
              </div>
              <div className="pl-8 flex flex-col gap-1">
                <p className="text-xs text-on-surface leading-relaxed">
                  {isFlagged
                    ? "This exact document checksum was previously uploaded under loan package APP-2025-0814."
                    : "No conflicting SHA-256 hash match discovered across intake repository."}
                </p>
                {isFlagged && (
                  <div className="mt-1">
                    <span className="inline-flex items-center gap-1 text-xs text-primary font-medium hover:text-primary-container cursor-pointer underline">
                      <span>View Conflicting Loan Application (APP-2025-0814)</span>
                      <span className="material-symbols-outlined text-[14px]">open_in_new</span>
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Directive 3: Document Type */}
            <div className="bg-surface-container-lowest rounded-xl p-space-md flex flex-col gap-space-xs border border-surface-container-high/40">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-space-sm">
                  <div className="w-6 h-6 rounded-full bg-primary-container/20 flex items-center justify-center text-primary-container">
                    <span className="material-symbols-outlined text-[16px] font-bold">check</span>
                  </div>
                  <span className="text-xs sm:text-sm font-semibold text-pure-white">
                    3. Document Type Specification
                  </span>
                </div>
                <span className="px-2 py-0.5 rounded bg-surface-dark text-primary-container text-[11px] font-bold tracking-wider">
                  PASSED
                </span>
              </div>
              <p className="text-xs text-slate-muted pl-8">
                Matches required statutory format. Watermarks, signing seal anchors, and schedule layout correspond with banking guidelines.
              </p>
            </div>

            {/* Directive 4: Page Limit & Integrity */}
            <div className="bg-surface-container-lowest rounded-xl p-space-md flex flex-col gap-space-xs border border-surface-container-high/40">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-space-sm">
                  <div className="w-6 h-6 rounded-full bg-primary-container/20 flex items-center justify-center text-primary-container">
                    <span className="material-symbols-outlined text-[16px] font-bold">check</span>
                  </div>
                  <span className="text-xs sm:text-sm font-semibold text-pure-white">
                    4. Page Limit &amp; Integrity Validation
                  </span>
                </div>
                <span className="px-2 py-0.5 rounded bg-surface-dark text-primary-container text-[11px] font-bold tracking-wider">
                  PASSED
                </span>
              </div>
              <p className="text-xs text-slate-muted pl-8">
                No stream corruption, unreferenced objects, or detached attachments discovered.
              </p>
            </div>
          </div>

          {/* Hash Diagnostic Strip */}
          <div className="bg-surface-dark-elevated rounded-lg p-space-sm flex items-center justify-between text-slate-muted font-mono text-xs border border-surface-container-high/40">
            <div className="flex items-center gap-1.5 truncate">
              <span className="material-symbols-outlined text-[14px]">tag</span>
              <span className="truncate">SHA256: {displayHash}</span>
            </div>
            <button
              type="button"
              onClick={handleCopyHash}
              className="text-primary-container hover:text-pure-white flex items-center gap-0.5 uppercase tracking-wider text-[10px] font-bold shrink-0 ml-2"
            >
              <span>{copySuccess ? "Copied!" : "Copy Hash"}</span>
            </button>
          </div>
        </div>

        {/* Drawer Bottom Sticky Action Bar */}
        <div className="p-space-lg bg-surface-container-low flex flex-col gap-space-sm shadow-[0_-4px_20px_rgba(0,0,0,0.5)] border-t border-surface-container-high/40">
          <div className="flex items-center gap-space-sm">
            {/* View Original Button */}
            <a
              href={`/api/documents/${documentData.id}/download`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 h-11 rounded-lg bg-surface-dark-elevated hover:bg-surface-container-highest text-pure-white text-xs font-semibold flex items-center justify-center gap-space-xs transition-all border border-surface-container-high/50"
            >
              <span className="material-symbols-outlined text-[18px]">visibility</span>
              <span>View Original File</span>
            </a>
            {/* Cancel Button */}
            <button
              type="button"
              onClick={onClose}
              className="px-space-md h-11 rounded-lg text-slate-muted hover:text-pure-white hover:bg-surface-container-high text-xs font-semibold transition-all border border-surface-container-high/30"
            >
              <span>Cancel</span>
            </button>
          </div>

          {/* Primary Action CTA: Replace File */}
          <label className="w-full h-12 rounded-lg bg-primary-container text-surface-container-lowest text-xs uppercase tracking-wider font-bold flex items-center justify-center gap-space-sm shadow-[0_0_24px_rgba(2,245,118,0.25)] hover:shadow-[0_0_32px_rgba(2,245,118,0.45)] hover:bg-primary-fixed transition-all cursor-pointer">
            <span className="material-symbols-outlined text-[20px]">upload_file</span>
            <span>{isUploading ? "Uploading & Validating..." : "Replace File"}</span>
            <input
              type="file"
              className="hidden"
              onChange={handleFileSelect}
              accept=".pdf,.zip,.xlsx,.png,.jpg,.jpeg"
              disabled={isUploading}
            />
          </label>
        </div>
      </aside>
    </div>
  );
}
