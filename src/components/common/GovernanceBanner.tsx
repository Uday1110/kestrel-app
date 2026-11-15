interface GovernanceBannerProps {
  phaseText?: string;
  subText?: string;
  directiveCode?: string;
}

export function GovernanceBanner({
  phaseText = "Statutory Governance & Protocol Notice",
  subText = "Completeness check & preparation only. System does not approve or reject loan applications. Verification strictly qualifies procedural readiness under Institutional Lending Charter Section 4.2.",
  directiveCode = "KST-GOV-2026",
}: GovernanceBannerProps) {
  return (
    <div className="w-full bg-surface-container-low rounded-xl p-space-md mb-space-lg flex items-start sm:items-center justify-between shadow-sm relative overflow-hidden border border-surface-container-high/50">
      <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary-container shadow-[0_0_8px_#02f576]"></div>
      <div className="flex items-start sm:items-center gap-space-md pl-space-xs">
        <div className="w-9 h-9 rounded-lg bg-surface-dark-elevated flex items-center justify-center text-primary-container shrink-0 shadow-sm">
          <span className="material-symbols-outlined text-[20px]">policy</span>
        </div>
        <div className="flex flex-col">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-xs tracking-wider uppercase text-primary-container">
              {phaseText}
            </span>
            <span className="hidden sm:inline text-slate-muted">•</span>
            <span className="hidden sm:inline text-xs text-slate-muted">Zero-Auto-Decisioning Mandate</span>
          </div>
          <p className="text-xs sm:text-sm text-on-surface-variant mt-0.5 leading-snug">
            {subText}
          </p>
        </div>
      </div>
      <div className="hidden lg:flex items-center gap-space-sm shrink-0">
        <span className="px-space-sm py-1 rounded-lg bg-surface-dark text-slate-muted text-xs uppercase tracking-wider flex items-center gap-1.5 border border-surface-container-high/40">
          <span className="w-1.5 h-1.5 rounded-full bg-primary-container animate-pulse"></span>
          <span>Ledger ID: {directiveCode}</span>
        </span>
      </div>
    </div>
  );
}
