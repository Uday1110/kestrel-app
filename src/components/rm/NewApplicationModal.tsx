"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface NewApplicationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated?: () => void;
}

export function NewApplicationModal({
  isOpen,
  onClose,
  onCreated,
}: NewApplicationModalProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    legalName: "",
    cin: "U28112PN2020PTC189211",
    pan: "AAACD8812K",
    gstin: "27AAACD8812K1Z4",
    incorporationDate: "2020-04-10",
    industrySector: "Light Engineering",
    registeredAddress: "Plot 88, Electronic Zone, Hinjawadi Phase 1",
    city: "Pune",
    state: "Maharashtra",
    pincode: "411057",
    contactName: "Rakesh Verma",
    contactEmail: "rakesh.verma@samplecorp.in",
    contactPhone: "+91 98200 11223",
    facilityType: "WORKING_CAPITAL",
    facilityAmount: 25000000, // ₹ 2.50 Cr
    tenorMonths: 36,
    purpose: "Working Capital Term Loan for export order execution and inventory ramp-up",
  });

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    try {
      const res = await fetch("/api/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          facilityAmount: Number(formData.facilityAmount),
          tenorMonths: Number(formData.tenorMonths),
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to create application");
      }

      onClose();
      if (onCreated) onCreated();
      router.push(`/applications/${data.application.id}`);
      router.refresh();
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to submit application");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-surface-dark-elevated rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden border border-surface-container-high/60 my-8">
        <div className="p-space-lg bg-surface-container-lowest flex items-center justify-between border-b border-surface-container-high/40">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary-container text-2xl">
              add_circle
            </span>
            <h3 className="text-lg font-bold text-pure-white">
              Create Corporate Lending Application
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-muted hover:text-pure-white"
          >
            <span className="material-symbols-outlined text-xl">close</span>
          </button>
        </div>

        {errorMsg && (
          <div className="m-4 p-3 rounded-lg bg-error-container/30 border border-error/40 text-error text-xs">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-space-lg space-y-4 text-xs sm:text-sm">
          {/* Section 1: Business details */}
          <div>
            <h4 className="text-xs uppercase tracking-wider text-primary-container font-semibold mb-2">
              1. Applicant Business Identity
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-400 text-xs mb-1">Company Legal Name *</label>
                <input
                  type="text"
                  required
                  value={formData.legalName}
                  onChange={(e) => setFormData({ ...formData, legalName: e.target.value })}
                  placeholder="e.g. Sahyadri Auto Forgings Pvt Ltd"
                  className="w-full bg-surface-container-lowest text-pure-white p-2 rounded border border-surface-container-high/60 focus:outline-none focus:ring-1 focus:ring-primary-container text-xs"
                />
              </div>
              <div>
                <label className="block text-slate-400 text-xs mb-1">Corporate Identity (CIN) *</label>
                <input
                  type="text"
                  required
                  value={formData.cin}
                  onChange={(e) => setFormData({ ...formData, cin: e.target.value })}
                  placeholder="U28112PN2020PTC189211"
                  className="w-full bg-surface-container-lowest text-pure-white p-2 rounded border border-surface-container-high/60 focus:outline-none focus:ring-1 focus:ring-primary-container text-xs font-mono"
                />
              </div>
              <div>
                <label className="block text-slate-400 text-xs mb-1">Permanent Account (PAN) *</label>
                <input
                  type="text"
                  required
                  value={formData.pan}
                  onChange={(e) => setFormData({ ...formData, pan: e.target.value })}
                  className="w-full bg-surface-container-lowest text-pure-white p-2 rounded border border-surface-container-high/60 focus:outline-none focus:ring-1 focus:ring-primary-container text-xs font-mono"
                />
              </div>
              <div>
                <label className="block text-slate-400 text-xs mb-1">GSTIN *</label>
                <input
                  type="text"
                  required
                  value={formData.gstin}
                  onChange={(e) => setFormData({ ...formData, gstin: e.target.value })}
                  className="w-full bg-surface-container-lowest text-pure-white p-2 rounded border border-surface-container-high/60 focus:outline-none focus:ring-1 focus:ring-primary-container text-xs font-mono"
                />
              </div>
              <div>
                <label className="block text-slate-400 text-xs mb-1">Industry Sector *</label>
                <input
                  type="text"
                  required
                  value={formData.industrySector}
                  onChange={(e) => setFormData({ ...formData, industrySector: e.target.value })}
                  className="w-full bg-surface-container-lowest text-pure-white p-2 rounded border border-surface-container-high/60 focus:outline-none focus:ring-1 focus:ring-primary-container text-xs"
                />
              </div>
              <div>
                <label className="block text-slate-400 text-xs mb-1">City &amp; State *</label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    required
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    placeholder="City"
                    className="w-full bg-surface-container-lowest text-pure-white p-2 rounded border border-surface-container-high/60 text-xs"
                  />
                  <input
                    type="text"
                    required
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    placeholder="State"
                    className="w-full bg-surface-container-lowest text-pure-white p-2 rounded border border-surface-container-high/60 text-xs"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Facility requested */}
          <div className="pt-2 border-t border-surface-container-high/30">
            <h4 className="text-xs uppercase tracking-wider text-primary-container font-semibold mb-2">
              2. Facility Request Specifications
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-slate-400 text-xs mb-1">Facility Type *</label>
                <select
                  value={formData.facilityType}
                  onChange={(e) => setFormData({ ...formData, facilityType: e.target.value })}
                  className="w-full bg-surface-container-lowest text-pure-white p-2 rounded border border-surface-container-high/60 focus:outline-none focus:ring-1 focus:ring-primary-container text-xs"
                >
                  <option value="WORKING_CAPITAL">Working Capital</option>
                  <option value="TERM_LOAN">Term Loan</option>
                  <option value="MACHINERY_LOAN">Machinery Loan</option>
                  <option value="CONSORTIUM_FACILITY">Consortium Line</option>
                </select>
              </div>
              <div>
                <label className="block text-slate-400 text-xs mb-1">Facility Amount (₹) *</label>
                <input
                  type="number"
                  required
                  min={100000}
                  step={50000}
                  value={formData.facilityAmount}
                  onChange={(e) => setFormData({ ...formData, facilityAmount: Number(e.target.value) })}
                  className="w-full bg-surface-container-lowest text-pure-white p-2 rounded border border-surface-container-high/60 focus:outline-none focus:ring-1 focus:ring-primary-container text-xs font-mono"
                />
              </div>
              <div>
                <label className="block text-slate-400 text-xs mb-1">Tenor (Months) *</label>
                <input
                  type="number"
                  required
                  min={6}
                  max={120}
                  value={formData.tenorMonths}
                  onChange={(e) => setFormData({ ...formData, tenorMonths: Number(e.target.value) })}
                  className="w-full bg-surface-container-lowest text-pure-white p-2 rounded border border-surface-container-high/60 focus:outline-none focus:ring-1 focus:ring-primary-container text-xs font-mono"
                />
              </div>
            </div>
            <div className="mt-2">
              <label className="block text-slate-400 text-xs mb-1">Borrowing Purpose *</label>
              <textarea
                required
                rows={2}
                value={formData.purpose}
                onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                className="w-full bg-surface-container-lowest text-pure-white p-2 rounded border border-surface-container-high/60 focus:outline-none focus:ring-1 focus:ring-primary-container text-xs"
              />
            </div>
          </div>

          <div className="p-space-lg bg-surface-container-lowest flex items-center justify-end gap-space-sm border-t border-surface-container-high/40 -mx-space-lg -mb-space-lg">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-slate-muted hover:text-pure-white text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 rounded-lg bg-primary-container text-surface-container-lowest text-xs font-bold hover:bg-primary-fixed transition-all cursor-pointer"
            >
              {loading ? "Creating Intake Dossier..." : "Create Application & Open Checklist"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
