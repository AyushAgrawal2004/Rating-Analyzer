import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ExternalLink, ChevronDown, ChevronUp, MessageSquare, Info, Quote } from "lucide-react";
import { ClayCard, ClayChip } from "../../ui/index.js";
import { springs } from "../../motion/presets.js";

export function WhyLowRatings({ whyLow = {}, appId }) {
  const navigate = useNavigate();
  const [expandedTheme, setExpandedTheme] = useState(null);

  const themes = (whyLow.themes || []).filter((t) => t.themeKey !== "positive");
  const totalLow = whyLow.totalLowReviews || 0;

  const toggleExpand = (themeKey, e) => {
    e.stopPropagation();
    setExpandedTheme(expandedTheme === themeKey ? null : themeKey);
  };

  const handleOpenExplorer = (themeKey) => {
    navigate(`/explorer/${appId}?theme=${themeKey}`);
  };

  return (
    <ClayCard className="p-6 sm:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 border-b border-ink-100 dark:border-ink-800/80 gap-3">
        <div>
          <div className="flex items-center gap-2.5">
            <h3 className="text-base sm:text-lg font-heading font-black text-ink-900 dark:text-white">
              What Drives 1-2 Star Reviews?
            </h3>
            <span className="clay-sm text-xs font-heading font-extrabold px-3 py-0.5 rounded-pill bg-clay-rose-light text-clay-rose-text dark:bg-clay-rose-dark dark:text-clay-rose-darkText">
              {totalLow.toLocaleString()} Low Reviews
            </span>
          </div>
          <p className="text-xs text-ink-500 font-medium mt-1">
            Ranked root-cause complaint themes identified from user text
          </p>
        </div>

        <div className="clay-sm inline-flex items-center text-xs font-medium text-ink-600 dark:text-ink-300 bg-surface-cardSubtle dark:bg-surface-darkCard px-3 py-1.5 rounded-pill self-start sm:self-auto">
          <Info className="w-3.5 h-3.5 mr-1.5 text-brand-500 shrink-0" />
          <span>Percentages overlap due to multi-label complaints</span>
        </div>
      </div>

      <div className="mt-6 space-y-4">
        {themes.map((theme, idx) => {
          const isExpanded = expandedTheme === theme.themeKey;
          const share = theme.shareOfLow || 0;

          return (
            <motion.div
              key={theme.themeKey}
              whileHover={{ y: -2 }}
              transition={springs.soft}
              onClick={() => handleOpenExplorer(theme.themeKey)}
              className="clay-sm p-4 sm:p-5 rounded-clay-md bg-surface-cardSubtle/60 dark:bg-surface-darkCardSubtle/60 hover:bg-white dark:hover:bg-surface-darkCard transition-all cursor-pointer group"
            >
              <div className="flex items-start sm:items-center justify-between gap-3">
                <div className="flex-1 min-w-0 pr-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <ClayChip
                      themeKey={theme.themeKey}
                      label={theme.label}
                      className="text-xs"
                    />
                    <span className="text-xs font-mono font-bold text-ink-400">
                      ({theme.count.toLocaleString()} reviews)
                    </span>
                  </div>
                  {theme.description && (
                    <p className="text-xs text-ink-500 dark:text-ink-400 mt-1 line-clamp-1 font-medium">
                      {theme.description}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <div className="text-right">
                    <span className="text-base sm:text-lg font-heading font-black text-ink-900 dark:text-white tabular-nums">
                      {share}%
                    </span>
                    <span className="text-[10px] text-ink-400 block font-heading font-bold uppercase tracking-wider">
                      of 1-2★
                    </span>
                  </div>

                  {theme.examples?.length > 0 && (
                    <button
                      type="button"
                      onClick={(e) => toggleExpand(theme.themeKey, e)}
                      className="clay-sm p-1.5 rounded-full text-ink-500 hover:text-ink-900 dark:hover:text-white transition-colors"
                      title="View user quotes"
                    >
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4 stroke-[2.5]" />
                      ) : (
                        <ChevronDown className="w-4 h-4 stroke-[2.5]" />
                      )}
                    </button>
                  )}

                  <div className="clay-sm p-1.5 rounded-full text-ink-400 group-hover:text-brand-500 transition-colors">
                    <ExternalLink className="w-4 h-4 stroke-[2.5]" />
                  </div>
                </div>
              </div>

              {/* Sequential Horizontal Progress Fill */}
              <div className="clay-inset w-full bg-surface-cardSubtle dark:bg-surface-darkCard rounded-pill h-2.5 mt-3.5 p-0.5 overflow-hidden">
                <div
                  style={{ width: `${Math.min(100, share)}%` }}
                  className="clay-sm h-full rounded-pill bg-gradient-to-r from-brand-500 to-accent-500 transition-all duration-700 ease-out will-change-[width]"
                />
              </div>

              {/* Expandable User Voice Quotes */}
              <AnimatePresence>
                {isExpanded && theme.examples?.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={springs.soft}
                    className="overflow-hidden mt-4 pt-4 border-t border-ink-100 dark:border-ink-800"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="flex items-center gap-2 mb-3 text-xs font-heading font-bold text-ink-600 dark:text-ink-400">
                      <Quote className="w-3.5 h-3.5 text-brand-500" />
                      <span>User Voice Quotes (3 Verified Examples)</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      {theme.examples.map((ex, i) => (
                        <div
                          key={i}
                          className="clay-sm p-3.5 rounded-clay-sm bg-white dark:bg-surface-darkCard text-xs text-ink-700 dark:text-ink-300 flex flex-col justify-between"
                        >
                          <p className="italic font-medium leading-relaxed line-clamp-4">
                            "{ex.content}"
                          </p>
                          <div className="mt-3 pt-2 border-t border-ink-100 dark:border-ink-800 flex items-center justify-between text-[11px] font-mono text-ink-400">
                            <span className="truncate max-w-[130px]">
                              {ex.userName} • v{ex.version}
                            </span>
                            <span className="font-heading font-bold text-amber-500">
                              {ex.score}★
                            </span>
                          </div>
                        </div>
                      ))}
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

export default WhyLowRatings;
