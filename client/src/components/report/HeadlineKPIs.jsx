import React from "react";
import { Star, Users, AlertTriangle, Calendar } from "lucide-react";
import { ClayStat, ClayCard } from "../../ui/index.js";

export function HeadlineKPIs({ headline = {}, appInfo = {} }) {
  const deltas = headline.deltas;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
      {/* 1. Store Public Rating */}
      <ClayStat
        title="Store Public Rating"
        value={appInfo.score || 0}
        precision={2}
        icon={Star}
        delta={deltas?.storeRating}
        deltaType="score"
        note={`${appInfo.ratingsCount?.toLocaleString() || "0"} all-time ratings`}
      />

      {/* 2. Collected Cohort Avg */}
      <ClayStat
        title="Cohort Sample Avg"
        value={headline.collectedAverage || 0}
        precision={2}
        icon={Users}
        delta={deltas?.avgScore}
        deltaType="score"
        note={`${headline.collectedCount?.toLocaleString() || "0"} reviews analyzed`}
      />

      {/* 3. 1-2★ Negative Share */}
      <ClayStat
        title="1-2★ Negative Share"
        value={headline.pctLow || 0}
        suffix="%"
        icon={AlertTriangle}
        delta={deltas?.pctLow}
        deltaType="friction"
        note="High friction cohort"
      />

      {/* 4. Velocity Card */}
      <ClayCard hoverLift className="p-5 sm:p-6 flex flex-col justify-between">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs sm:text-sm font-heading font-bold text-ink-500 dark:text-ink-400 uppercase tracking-wider">
            Recent Velocity
          </span>
          <div className="clay-sm w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center bg-white dark:bg-surface-darkCard text-accent-600 dark:text-accent-400 shrink-0">
            <Calendar className="w-5 h-5 stroke-[2.4]" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 pt-1">
          <div>
            <span className="text-[11px] font-heading font-extrabold text-ink-400 uppercase tracking-wider block">
              Last 30 Days
            </span>
            <p className="text-xl sm:text-2xl font-heading font-black text-ink-900 dark:text-white mt-0.5 tabular-nums">
              {headline.last30?.avgScore !== null ? `${headline.last30.avgScore}★` : "—"}
            </p>
            <span className="text-[11px] font-medium text-ink-500 dark:text-ink-400">
              {headline.last30?.count || 0} reviews ({headline.last30?.pctLow || 0}% low)
            </span>
          </div>

          <div className="text-right">
            <span className="text-[11px] font-heading font-extrabold text-ink-400 uppercase tracking-wider block">
              Last 90 Days
            </span>
            <p className="text-xl sm:text-2xl font-heading font-black text-ink-900 dark:text-white mt-0.5 tabular-nums">
              {headline.last90?.avgScore !== null ? `${headline.last90.avgScore}★` : "—"}
            </p>
            <span className="text-[11px] font-medium text-ink-500 dark:text-ink-400">
              {headline.last90?.count || 0} reviews ({headline.last90?.pctLow || 0}% low)
            </span>
          </div>
        </div>
      </ClayCard>
    </div>
  );
}

export default HeadlineKPIs;
