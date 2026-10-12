import React from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight, ArrowDownRight, Clock, ChevronRight } from "lucide-react";
import { ClayCard } from "../../ui/index.js";

export function RecentAnalyses({ analyses = [] }) {
  if (!analyses || analyses.length === 0) {
    return null;
  }

  return (
    <div className="w-full max-w-3xl mx-auto mt-12">
      <div className="flex items-center justify-between mb-5 px-1">
        <h3 className="text-xs sm:text-sm font-heading font-extrabold text-ink-700 dark:text-ink-300 uppercase tracking-wider">
          Saved Reports &amp; History
        </h3>
        <span className="clay-sm text-xs font-heading font-bold px-3 py-1 rounded-pill bg-white dark:bg-surface-darkCard text-ink-600 dark:text-ink-400">
          {analyses.length} reports
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {analyses.map((a) => {
          const headline = a.headline;
          const deltaAvg = headline?.deltas?.avgScore;
          const deltaLow = headline?.deltas?.pctLow;

          return (
            <Link key={a.id} to={`/report/${a.id}`} className="block">
              <ClayCard
                hoverLift
                radius="md"
                className="p-5 flex flex-col justify-between group transition-all"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <span className="text-xs font-mono font-bold text-brand-600 dark:text-brand-400 block truncate">
                        {a.appId}
                      </span>
                      <span className="text-[11px] font-medium text-ink-400 flex items-center gap-1.5 mt-1">
                        <Clock className="w-3 h-3" />
                        <span>{new Date(a.createdAt).toLocaleDateString()}</span>
                      </span>
                    </div>
                    <div className="clay-sm p-1.5 rounded-full bg-surface-cardSubtle dark:bg-surface-darkCard text-ink-400 group-hover:text-brand-500 group-hover:translate-x-1 transition-all shrink-0">
                      <ChevronRight className="w-4 h-4 stroke-[2.5]" />
                    </div>
                  </div>

                  {headline && (
                    <div className="mt-4 pt-3.5 border-t border-ink-100 dark:border-ink-800/80 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] font-heading font-bold text-ink-500 uppercase tracking-wider block">
                          Avg Rating
                        </span>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="text-base font-heading font-extrabold text-ink-900 dark:text-white tabular-nums">
                            {headline.collectedAverage?.toFixed(2)}★
                          </span>
                          {deltaAvg !== undefined && deltaAvg !== 0 && (
                            <span
                              className={`clay-sm px-1.5 py-0.2 rounded-pill text-[10px] font-heading font-bold flex items-center ${
                                deltaAvg > 0
                                  ? "bg-green-100 text-status-success dark:bg-green-950/80"
                                  : "bg-red-100 text-status-danger dark:bg-red-950/80"
                              }`}
                            >
                              {deltaAvg > 0 ? (
                                <ArrowUpRight className="w-3 h-3 stroke-[2.5]" />
                              ) : (
                                <ArrowDownRight className="w-3 h-3 stroke-[2.5]" />
                              )}
                              {Math.abs(deltaAvg)}
                            </span>
                          )}
                        </div>
                      </div>

                      <div>
                        <span className="text-[10px] font-heading font-bold text-ink-500 uppercase tracking-wider block">
                          1-2★ Share
                        </span>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="text-base font-heading font-extrabold text-ink-900 dark:text-white tabular-nums">
                            {headline.pctLow}%
                          </span>
                          {deltaLow !== undefined && deltaLow !== 0 && (
                            <span
                              className={`clay-sm px-1.5 py-0.2 rounded-pill text-[10px] font-heading font-bold flex items-center ${
                                deltaLow < 0
                                  ? "bg-green-100 text-status-success dark:bg-green-950/80"
                                  : "bg-red-100 text-status-danger dark:bg-red-950/80"
                              }`}
                            >
                              {deltaLow < 0 ? (
                                <ArrowDownRight className="w-3 h-3 stroke-[2.5]" />
                              ) : (
                                <ArrowUpRight className="w-3 h-3 stroke-[2.5]" />
                              )}
                              {Math.abs(deltaLow)}%
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-[10px] font-heading font-bold text-ink-500 uppercase tracking-wider block">
                          Cohort
                        </span>
                        <span className="text-sm font-heading font-bold text-ink-700 dark:text-ink-300 tabular-nums">
                          {headline.collectedCount?.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </ClayCard>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

export default RecentAnalyses;
