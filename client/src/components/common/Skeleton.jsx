import React from "react";

export function CardSkeleton({ className = "" }) {
  return (
    <div
      className={`bg-surface-card dark:bg-surface-darkCard border border-ink-200 dark:border-surface-darkBorder rounded-2xl p-6 shadow-card animate-pulse ${className}`}
    >
      <div className="h-4 bg-ink-200 dark:bg-ink-800 rounded w-1/3 mb-4" />
      <div className="h-8 bg-ink-200 dark:bg-ink-800 rounded w-1/2 mb-2" />
      <div className="h-3 bg-ink-100 dark:bg-ink-900 rounded w-2/3" />
    </div>
  );
}

export function ChartSkeleton({ height = "h-64" }) {
  return (
    <div className={`w-full bg-surface-card dark:bg-surface-darkCard border border-ink-200 dark:border-surface-darkBorder rounded-2xl p-6 shadow-card animate-pulse ${height} flex flex-col justify-between`}>
      <div className="h-4 bg-ink-200 dark:bg-ink-800 rounded w-1/4" />
      <div className="flex items-end space-x-4 h-3/4 pt-8">
        {[40, 70, 30, 90, 60, 80, 50, 65].map((h, i) => (
          <div
            key={i}
            className="flex-1 bg-ink-100 dark:bg-ink-800 rounded-t"
            style={{ height: `${h}%` }}
          />
        ))}
      </div>
    </div>
  );
}
