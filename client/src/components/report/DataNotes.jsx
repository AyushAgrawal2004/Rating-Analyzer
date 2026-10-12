import React from "react";
import { Info, Database, Sparkles, Filter } from "lucide-react";
import { ClayCard } from "../../ui/index.js";

export function DataNotes({ notes = {} }) {
  const breakdown = notes.labelingBreakdown || {};

  return (
    <ClayCard className="p-6 md:p-8 print-card">
      <div className="flex items-center space-x-3 mb-5">
        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-pastel-blue to-pastel-lavender text-brand-500 flex items-center justify-center shadow-clay-sm flex-shrink-0">
          <Info className="w-5 h-5 stroke-[2.2]" />
        </div>
        <div>
          <h3 className="text-lg font-heading font-black text-ink-900 dark:text-white">
            Methodology &amp; Sampling Notes
          </h3>
          <p className="text-xs text-ink-500 font-medium">
            Dataset constraints, classification distribution, and collection boundary
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 py-4 border-y border-ink-100 dark:border-ink-800/60 my-2">
        <div className="p-4 rounded-2xl bg-surface-cardSubtle/70 dark:bg-surface-darkCardSubtle/50 border border-ink-100 dark:border-ink-800/60 shadow-clay-sm">
          <span className="text-[11px] font-heading font-extrabold text-ink-500 uppercase tracking-wider block">Sample Analyzed</span>
          <p className="text-base font-heading font-black text-ink-900 dark:text-white mt-1 tabular-nums">
            {notes.sampleSize?.toLocaleString()} Reviews
          </p>
          <span className="text-xs text-ink-400 font-medium mt-0.5 block">Sort: <span className="font-semibold text-brand-600 dark:text-brand-300">{notes.sortUsed || "newest"}</span></span>
        </div>

        <div className="p-4 rounded-2xl bg-surface-cardSubtle/70 dark:bg-surface-darkCardSubtle/50 border border-ink-100 dark:border-ink-800/60 shadow-clay-sm">
          <span className="text-[11px] font-heading font-extrabold text-ink-500 uppercase tracking-wider block">Date Boundary</span>
          <p className="text-base font-heading font-black text-ink-900 dark:text-white mt-1">
            {notes.dateRange?.from ? new Date(notes.dateRange.from).toLocaleDateString() : "—"} →{" "}
            {notes.dateRange?.to ? new Date(notes.dateRange.to).toLocaleDateString() : "—"}
          </p>
          <span className="text-xs text-ink-400 font-medium mt-0.5 block">Observed active timeframe</span>
        </div>

        <div className="p-4 rounded-2xl bg-surface-cardSubtle/70 dark:bg-surface-darkCardSubtle/50 border border-ink-100 dark:border-ink-800/60 shadow-clay-sm">
          <span className="text-[11px] font-heading font-extrabold text-ink-500 uppercase tracking-wider block">Labeling Engine</span>
          <div className="text-base font-heading font-black text-ink-900 dark:text-white mt-1 flex items-center space-x-2">
            <span className="text-ink-700 dark:text-ink-300">{breakdown.rule || 0} Rules</span>
            <span className="text-ink-300">•</span>
            <span className="text-purple-600 dark:text-purple-300">{breakdown.llm || 0} AI</span>
            {breakdown.seed > 0 && <span className="text-ink-400">• {breakdown.seed} Seed</span>}
          </div>
          <span className="text-xs text-ink-400 font-medium mt-0.5 block">Multi-label classification pass</span>
        </div>
      </div>

      <div className="text-xs leading-relaxed text-ink-500 dark:text-ink-400 space-y-1.5 pt-2">
        <p>
          <strong className="text-ink-700 dark:text-ink-200">Sampling Bias Note:</strong> {notes.disclaimer ||
            "Public reviews are a self-selected sample of users motivated to share feedback; sentiment may be more polarized than the silent median user base."}
        </p>
        <p>
          <strong className="text-ink-700 dark:text-ink-200">Repeatability:</strong> When sorted by newest, re-runs will incrementally fetch newly published reviews without duplicating existing records.
        </p>
      </div>
    </ClayCard>
  );
}

export default DataNotes;

