import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Flame, ArrowRight, ChevronDown, ChevronUp, Sparkles, CheckCircle2 } from "lucide-react";
import { ClayCard, ClayButton } from "../../ui/index.js";
import { springs } from "../../motion/presets.js";

export function PriorityFixes({ fixes = {}, appId }) {
  const navigate = useNavigate();
  const [expandedIndex, setExpandedIndex] = useState(0); // expand first by default
  const items = fixes.items || [];

  const getEffortBadge = (effort) => {
    switch (effort) {
      case "Low":
        return "bg-clay-mint-light text-clay-mint-text dark:bg-clay-mint-dark dark:text-clay-mint-darkText";
      case "High":
        return "bg-clay-peach-light text-clay-peach-text dark:bg-clay-peach-dark dark:text-clay-peach-darkText";
      case "Medium":
      default:
        return "bg-clay-blue-light text-clay-blue-text dark:bg-clay-blue-dark dark:text-clay-blue-darkText";
    }
  };

  const toggleExpand = (idx) => {
    setExpandedIndex(expandedIndex === idx ? null : idx);
  };

  return (
    <ClayCard className="p-6 sm:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 border-b border-ink-100 dark:border-ink-800/80 gap-3">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="clay-sm w-9 h-9 rounded-full bg-red-100 dark:bg-red-950/60 text-status-danger flex items-center justify-center shrink-0">
              <Flame className="w-5 h-5 stroke-[2.5]" />
            </div>
            <h3 className="text-base sm:text-lg font-heading font-black text-ink-900 dark:text-white">
              Prioritized Engineering Fix Matrix
            </h3>
          </div>
          <p className="text-xs text-ink-500 font-medium mt-1">
            Ranked by impact: Score = Share of 1-2★ Complaints × Severity Weight
          </p>
        </div>

        <div className="clay-sm inline-flex items-center text-xs font-medium text-ink-600 dark:text-ink-400 bg-surface-cardSubtle dark:bg-surface-darkCard px-3 py-1.5 rounded-pill self-start sm:self-auto">
          <span>* Effort values are engineering triage estimates</span>
        </div>
      </div>

      <div className="mt-6 space-y-3.5">
        {items.slice(0, 8).map((fix, idx) => {
          const isExpanded = expandedIndex === idx;
          const maxScore = items[0]?.priorityScore || 30;
          const impactPercent = Math.min(100, Math.round((fix.priorityScore / maxScore) * 100));

          return (
            <motion.div
              key={fix.themeKey}
              whileHover={{ y: -3 }}
              transition={springs.soft}
              onClick={() => toggleExpand(idx)}
              className={`clay-sm rounded-clay-md p-4 sm:p-5 transition-all cursor-pointer ${
                isExpanded
                  ? "bg-white dark:bg-surface-darkCard ring-2 ring-brand-300 dark:ring-brand-700/60 shadow-md"
                  : "bg-surface-cardSubtle/60 dark:bg-surface-darkCardSubtle/60 hover:bg-white dark:hover:bg-surface-darkCard"
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3.5 flex-1 min-w-0">
                  {/* Big Rank Number Badge */}
                  <div className="clay-sm w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-brand-500 to-brand-600 text-white font-heading font-black text-sm sm:text-base flex items-center justify-center shrink-0 shadow-sm">
                    {idx + 1}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="text-sm sm:text-base font-heading font-black text-ink-900 dark:text-white truncate">
                        {fix.label}
                      </h4>
                      <span className="clay-sm text-[10px] font-mono font-bold px-2 py-0.5 rounded-pill bg-ink-100 dark:bg-ink-800 text-ink-600 dark:text-ink-400 uppercase tracking-wider">
                        {fix.shareOfLow}% low share
                      </span>
                      <span
                        className={`clay-sm text-[10px] font-heading font-extrabold px-2.5 py-0.5 rounded-pill ${getEffortBadge(
                          fix.effortEstimate
                        )}`}
                      >
                        {fix.effortEstimate} Effort (est.)
                      </span>
                    </div>

                    {/* Animated Impact Meter */}
                    <div className="clay-inset w-full max-w-xs h-2 rounded-pill bg-surface-cardSubtle dark:bg-surface-darkCard mt-2 p-0.5 overflow-hidden">
                      <div
                        style={{ width: `${impactPercent}%` }}
                        className="clay-sm h-full rounded-pill bg-gradient-to-r from-amber-500 to-status-danger transition-all duration-700 ease-out will-change-[width]"
                      />
                    </div>
                  </div>
                </div>

                {/* Score & Actions */}
                <div className="flex items-center justify-between sm:justify-end gap-4 pl-12 sm:pl-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-ink-100 dark:border-ink-800">
                  <div className="text-left sm:text-right">
                    <span className="text-[10px] font-heading font-bold text-ink-400 uppercase tracking-wider block">
                      Priority Score
                    </span>
                    <span className="text-lg sm:text-xl font-heading font-black text-brand-600 dark:text-brand-400 tabular-nums">
                      {fix.priorityScore}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <ClayButton
                      variant="secondary"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/explorer/${appId}?theme=${fix.themeKey}`);
                      }}
                      className="text-xs"
                    >
                      <span>Inspect</span>
                      <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
                    </ClayButton>

                    <div className="clay-sm p-1.5 rounded-full text-ink-400">
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4 stroke-[2.5]" />
                      ) : (
                        <ChevronDown className="w-4 h-4 stroke-[2.5]" />
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Expandable Action Item */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={springs.soft}
                    className="overflow-hidden mt-4 pt-3.5 border-t border-ink-100 dark:border-ink-800"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="clay-sm p-3.5 rounded-clay-sm bg-clay-blue-light/70 dark:bg-clay-blue-dark/50 flex items-start gap-2.5">
                      <Sparkles className="w-4 h-4 text-brand-500 shrink-0 mt-0.5 stroke-[2.5]" />
                      <div>
                        <span className="text-xs font-heading font-extrabold text-brand-700 dark:text-brand-300 block mb-0.5">
                          Recommended Engineering Action
                        </span>
                        <p className="text-xs text-ink-700 dark:text-ink-200 font-medium leading-relaxed">
                          {fix.suggestedAction}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>
    </ClayCard>
  );
}

export default PriorityFixes;
