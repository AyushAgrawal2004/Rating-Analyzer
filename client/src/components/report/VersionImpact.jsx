import React from "react";
import { AlertTriangle, AlertCircle, Layers } from "lucide-react";
import { ClayCard, ClayChip } from "../../ui/index.js";

export function VersionImpact({ versionData = {} }) {
  const versions = versionData.versions || [];
  const worstRecent = versionData.worstRecentVersion;

  return (
    <ClayCard className="p-6 md:p-8 print-card">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-5 gap-2">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-pastel-peach to-pastel-rose text-status-warning dark:text-amber-400 flex items-center justify-center shadow-clay-sm flex-shrink-0">
            <Layers className="w-5 h-5 stroke-[2.2]" />
          </div>
          <div>
            <h3 className="text-lg font-heading font-black text-ink-900 dark:text-white">
              Release Version Impact
            </h3>
            <p className="text-xs text-ink-500 font-medium">
              Versions with 10+ reviews (ranked chronologically)
            </p>
          </div>
        </div>

        <div className="text-[11px] text-ink-400 italic px-3 py-1 rounded-full bg-surface-cardSubtle dark:bg-surface-darkCardSubtle">
          * Correlation does not imply causation (release timing may coincide with external factors)
        </div>
      </div>

      {worstRecent && (
        <div className="mb-5 p-4 bg-pastel-rose/50 dark:bg-rose-950/30 border border-status-danger/20 rounded-2xl flex items-center justify-between text-xs shadow-clay-sm">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-xl bg-status-danger/15 text-status-danger flex items-center justify-center flex-shrink-0">
              <AlertTriangle className="w-4 h-4 stroke-[2.2]" />
            </div>
            <span className="text-ink-900 dark:text-rose-100 font-medium">
              <strong className="font-heading font-extrabold text-status-danger">Worst Recent Release:</strong> Version{" "}
              <span className="font-mono font-black px-1.5 py-0.5 rounded-md bg-white/70 dark:bg-black/30">v{worstRecent.version}</span> had the highest
              negative sentiment ({worstRecent.pctLow}% low reviews, avg {worstRecent.avgScore}★).
            </span>
          </div>
        </div>
      )}

      <div className="overflow-x-auto rounded-2xl border border-ink-100 dark:border-ink-800/60 bg-white/50 dark:bg-slate-900/40">
        <table className="w-full text-left text-xs sm:text-sm border-collapse">
          <thead>
            <tr className="border-b border-ink-100 dark:border-ink-800/80 bg-surface-cardSubtle/70 dark:bg-surface-darkCardSubtle/70 text-ink-500 dark:text-ink-400 font-heading font-extrabold uppercase tracking-wider text-[11px]">
              <th className="py-3 px-4">App Version</th>
              <th className="py-3 px-4">Average Score</th>
              <th className="py-3 px-4">% 1-2★ Low</th>
              <th className="py-3 px-4">Review Volume</th>
              <th className="py-3 px-4">First Seen</th>
              <th className="py-3 px-4">Sample Reliability</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ink-100/70 dark:divide-ink-800/40">
            {versions.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-ink-500 font-medium">
                  Not enough reviews recorded per version yet (minimum 10 required).
                </td>
              </tr>
            ) : (
              versions.map((v) => {
                const isWorst = worstRecent && worstRecent.version === v.version;

                return (
                  <tr
                    key={v.version}
                    className={`hover:bg-surface-cardSubtle/60 dark:hover:bg-surface-darkCardSubtle/40 transition-colors ${
                      isWorst ? "bg-pastel-rose/25 dark:bg-rose-950/20" : ""
                    }`}
                  >
                    <td className="py-3.5 px-4 font-mono font-bold text-ink-900 dark:text-white flex items-center space-x-2">
                      <span className="px-2 py-0.5 rounded-lg bg-surface-cardSubtle dark:bg-surface-darkCardSubtle border border-ink-200/50 dark:border-ink-700/50">
                        v{v.version}
                      </span>
                      {isWorst && (
                        <span className="text-[10px] font-heading font-extrabold px-2 py-0.5 rounded-full bg-pastel-rose text-status-danger border border-status-danger/20 shadow-clay-sm">
                          Watchlist
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 font-heading font-black">
                      <span
                        className={`tabular-nums ${
                          v.avgScore < 3.0
                            ? "text-status-danger"
                            : v.avgScore >= 4.0
                            ? "text-status-success"
                            : "text-status-warning"
                        }`}
                      >
                        {v.avgScore.toFixed(2)}★
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-semibold">
                      <span className={`tabular-nums ${v.pctLow > 35 ? "text-status-danger font-bold" : "text-ink-700 dark:text-ink-300"}`}>
                        {v.pctLow}%
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-ink-700 dark:text-ink-300 tabular-nums">
                      {v.reviewCount.toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4 text-ink-500 text-xs">
                      {v.firstSeen ? new Date(v.firstSeen).toLocaleDateString() : "—"}
                    </td>
                    <td className="py-3.5 px-4">
                      {v.isSmallSample ? (
                        <span className="inline-flex items-center text-status-warning space-x-1.5 px-2 py-0.5 rounded-full bg-pastel-butter/80 dark:bg-amber-950/40 text-[11px] font-semibold" title="Fewer than 50 reviews">
                          <AlertCircle className="w-3.5 h-3.5 stroke-[2.2]" />
                          <span>Small Sample (&lt;50)</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center text-status-success px-2 py-0.5 rounded-full bg-pastel-mint/80 dark:bg-emerald-950/40 text-[11px] font-bold">
                          Sufficient (50+)
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </ClayCard>
  );
}
export default VersionImpact;

