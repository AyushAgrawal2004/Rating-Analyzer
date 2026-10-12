import React from "react";
import { ThumbsUp, Star, MessageSquare, Flame } from "lucide-react";
import { ClayCard, ClayChip } from "../../ui/index.js";

export function MostUpvotedLowReviews({ reviews = [] }) {
  if (!reviews || reviews.length === 0) {
    return null;
  }

  return (
    <ClayCard className="p-6 md:p-8 print-card">
      <div className="flex items-center space-x-3 mb-5">
        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-pastel-rose to-pastel-peach text-status-danger flex items-center justify-center shadow-clay-sm flex-shrink-0">
          <Flame className="w-5 h-5 stroke-[2.2]" />
        </div>
        <div>
          <h3 className="text-lg font-heading font-black text-ink-900 dark:text-white">
            Most Upvoted Critical Reviews
          </h3>
          <p className="text-xs text-ink-500 font-medium">
            High-visibility user complaints resonating with broad community sentiment
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {reviews.map((r) => (
          <div
            key={r.reviewId}
            className="p-5 rounded-2xl bg-surface-cardSubtle/70 dark:bg-surface-darkCardSubtle/50 border border-ink-100 dark:border-ink-800/60 shadow-clay-sm space-y-3"
          >
            <div className="flex items-start justify-between flex-wrap gap-2">
              <div className="flex items-center space-x-2.5">
                <span className="flex items-center text-status-danger font-heading font-black text-xs bg-pastel-rose/80 dark:bg-rose-950/60 px-2.5 py-1 rounded-xl border border-status-danger/20 shadow-clay-sm">
                  <Star className="w-3.5 h-3.5 fill-status-danger text-status-danger mr-1" />
                  {r.score}★
                </span>
                <span className="text-xs font-heading font-bold text-ink-900 dark:text-white">
                  {r.userName}
                </span>
                <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-lg bg-surface-card dark:bg-surface-darkCard border border-ink-200/50 dark:border-ink-700/50 text-ink-500">
                  v{r.version}
                </span>
              </div>

              <div className="flex items-center space-x-1.5 text-xs font-heading font-extrabold text-brand-600 dark:text-brand-300 bg-pastel-blue/80 dark:bg-brand-950/60 px-3 py-1 rounded-full border border-brand-500/20 shadow-clay-sm">
                <ThumbsUp className="w-3.5 h-3.5 stroke-[2.2]" />
                <span className="tabular-nums">{r.thumbsUpCount} upvotes</span>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-ink-800 dark:text-ink-200 leading-relaxed font-medium italic">
              "{r.content}"
            </p>

            <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-ink-100/80 dark:border-ink-800/60">
              {(r.themes || []).map((t) => (
                <ClayChip
                  key={t}
                  themeKey={t}
                  label={t.replace(/_/g, " ")}
                  size="sm"
                />
              ))}

              {r.replyContent && (
                <span className="text-[11px] font-heading font-bold text-status-success bg-pastel-mint/80 dark:bg-emerald-950/60 px-2.5 py-1 rounded-full border border-status-success/20 flex items-center space-x-1.5 ml-auto shadow-clay-sm">
                  <MessageSquare className="w-3 h-3 stroke-[2.2]" />
                  <span>Developer Replied</span>
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </ClayCard>
  );
}

export default MostUpvotedLowReviews;

