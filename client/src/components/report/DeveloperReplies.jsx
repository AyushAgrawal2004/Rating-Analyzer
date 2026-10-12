import React from "react";
import { MessageSquareReply, CheckCircle, AlertCircle } from "lucide-react";
import { ClayCard } from "../../ui/index.js";

export function DeveloperReplies({ replies = {} }) {
  const overall = replies.overallReplyRate || 0;
  const low = replies.lowReplyRate || 0;
  const isHealthy = low >= 50;

  return (
    <ClayCard className="p-6 sm:p-7 flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base sm:text-lg font-heading font-black text-ink-900 dark:text-white">
              Developer Reply &amp; Engagement Health
            </h3>
            <p className="text-xs text-ink-500 font-medium">
              How proactively engineering &amp; support teams respond to user feedback
            </p>
          </div>
          <div className="clay-sm w-10 h-10 rounded-full flex items-center justify-center bg-white dark:bg-surface-darkCard text-brand-600 dark:text-brand-400 shrink-0">
            <MessageSquareReply className="w-5 h-5 stroke-[2.4]" />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
          <div className="clay-sm p-4 rounded-clay-md bg-surface-cardSubtle/70 dark:bg-surface-darkCardSubtle">
            <span className="text-xs font-heading font-bold text-ink-500 uppercase tracking-wider block">
              Overall Reply Rate
            </span>
            <div className="mt-1.5 flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-heading font-black text-ink-900 dark:text-white tabular-nums">
                {overall}%
              </span>
              <span className="text-xs text-ink-400 font-medium">
                ({replies.repliedAllCount || 0} replied)
              </span>
            </div>
          </div>

          <div className="clay-sm p-4 rounded-clay-md bg-surface-cardSubtle/70 dark:bg-surface-darkCardSubtle">
            <span className="text-xs font-heading font-bold text-ink-500 uppercase tracking-wider block">
              1-2★ Low Reviews Reply Rate
            </span>
            <div className="mt-1.5 flex items-baseline gap-2">
              <span
                className={`text-2xl sm:text-3xl font-heading font-black tabular-nums ${
                  isHealthy ? "text-status-success" : "text-status-danger"
                }`}
              >
                {low}%
              </span>
              <span className="text-xs text-ink-400 font-medium">
                ({replies.repliedLowCount || 0} replied)
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Plain Language Callout in soft pastel clay */}
      <div
        className={`clay-sm p-4 rounded-clay-md flex items-start gap-3 ${
          isHealthy
            ? "bg-clay-mint-light dark:bg-clay-mint-dark text-clay-mint-text dark:text-clay-mint-darkText"
            : "bg-clay-butter-light dark:bg-clay-butter-dark text-clay-butter-text dark:text-clay-butter-darkText"
        }`}
      >
        {isHealthy ? (
          <CheckCircle className="w-5 h-5 shrink-0 mt-0.5 stroke-[2.5]" />
        ) : (
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 stroke-[2.5]" />
        )}
        <p className="text-xs sm:text-sm font-medium leading-relaxed">
          {replies.callout ||
            `Developer responds to ${low}% of 1-2 star reviews. Maintaining an active reply cadence helps prevent customer churn and drives positive re-ratings.`}
        </p>
      </div>
    </ClayCard>
  );
}

export default DeveloperReplies;
