import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Download,
  Printer,
  RotateCw,
  Search,
  Star,
  Clock,
  ArrowLeft,
  Calendar,
  AlertCircle,
  Check,
  Sparkles,
  Zap,
} from "lucide-react";
import { api } from "../api/client.js";
import { Stepper } from "../components/common/Stepper.jsx";
import { CardSkeleton, ChartSkeleton } from "../components/common/Skeleton.jsx";
import { HeadlineKPIs } from "../components/report/HeadlineKPIs.jsx";
import { StarDistribution } from "../components/report/StarDistribution.jsx";
import { WhyLowRatings } from "../components/report/WhyLowRatings.jsx";
import { MonthlyTrend } from "../components/report/MonthlyTrend.jsx";
import { VersionImpact } from "../components/report/VersionImpact.jsx";
import { DeveloperReplies } from "../components/report/DeveloperReplies.jsx";
import { MostUpvotedLowReviews } from "../components/report/MostUpvotedLowReviews.jsx";
import { PriorityFixes } from "../components/report/PriorityFixes.jsx";
import { DataNotes } from "../components/report/DataNotes.jsx";
import { ClayCard, ClayButton, Mascot } from "../ui/index.js";
import { cardCascade, slideUp } from "../motion/variants.js";

export function ReportPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [analysis, setAnalysis] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [liveProgress, setLiveProgress] = useState(null);
  const [scheduleSuccess, setScheduleSuccess] = useState(false);
  const [showScheduleMenu, setShowScheduleMenu] = useState(false);

  // Load initial analysis data
  const loadAnalysis = () => {
    setIsLoading(true);
    setError(null);
    api
      .getAnalysisReport(id)
      .then((data) => {
        setAnalysis(data);
        setIsLoading(false);
      })
      .catch((err) => {
        setError(err.message || "Failed to load analysis report");
        setIsLoading(false);
      });
  };

  useEffect(() => {
    loadAnalysis();
  }, [id]);

  // Handle SSE live stream if analysis is still in progress
  useEffect(() => {
    if (!analysis || analysis.status === "completed" || analysis.status === "failed") {
      return;
    }

    const eventSource = new EventSource(`/api/analyses/${id}/progress`);

    eventSource.addEventListener("progress", (e) => {
      try {
        const data = JSON.parse(e.data);
        setLiveProgress(data);

        if (data.status === "completed") {
          eventSource.close();
          // Brief 700ms celebratory pause so user sees final station checkmark and confetti before switching
          setTimeout(() => {
            loadAnalysis();
          }, 700);
        } else if (data.status === "failed") {
          eventSource.close();
          setError(data.error || "Analysis job failed");
          loadAnalysis();
        }
      } catch (err) {
        console.error("SSE JSON parse error:", err);
      }
    });

    eventSource.onerror = () => {
      setTimeout(() => {
        loadAnalysis();
      }, 3000);
      eventSource.close();
    };

    return () => {
      eventSource.close();
    };
  }, [id, analysis?.status]);

  const handleCancel = () => {
    api.cancelAnalysis(id).then(() => {
      loadAnalysis();
    });
  };

  const handleReRun = () => {
    if (!analysis) return;
    navigate(`/?appId=${analysis.appId}&count=${analysis.parameters?.count || 500}`);
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
        <div className="h-16 clay-sm bg-surface-card dark:bg-surface-darkCard rounded-3xl animate-pulse" />
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
        <ChartSkeleton />
      </div>
    );
  }

  if (error || analysis?.status === "failed") {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center">
        <ClayCard className="p-8 text-center space-y-4">
          <div className="w-14 h-14 rounded-3xl bg-pastel-rose text-status-danger flex items-center justify-center mx-auto shadow-clay-sm">
            <AlertCircle className="w-7 h-7 stroke-[2.2]" />
          </div>
          <h2 className="text-xl font-heading font-black text-ink-900 dark:text-white">
            Analysis Encountered an Error
          </h2>
          <p className="text-sm text-ink-500 font-medium">
            {error || analysis?.error || "We could not complete the report for this application."}
          </p>
          <div className="flex items-center justify-center space-x-3 pt-2">
            <ClayButton onClick={loadAnalysis} variant="primary" size="md">
              Retry Request
            </ClayButton>
            <ClayButton onClick={() => navigate("/")} variant="secondary" size="md">
              Back to Home
            </ClayButton>
          </div>
        </ClayCard>
      </div>
    );
  }

  // Active Progress Stepper View
  if (analysis.status !== "completed") {
    const activeStatus =
      liveProgress?.status ||
      (liveProgress?.step ? liveProgress.step.toLowerCase().replace(/\s+/g, "_") : analysis.status);
    const activeProgress =
      liveProgress?.progress ||
      (liveProgress?.total !== undefined ? liveProgress : analysis.progress);

    return (
      <div className="max-w-7xl mx-auto px-4 py-16">
        <Stepper
          status={activeStatus}
          progress={activeProgress}
          onCancel={handleCancel}
          useAI={analysis.parameters?.useAI}
        />
      </div>
    );
  }

  const report = analysis.report;
  const appInfo = report?.appInfo || {};
  const avgRating = appInfo.score || report?.headline?.overallSentiment?.avgScore || 4.2;
  const worstTheme = report?.headline?.worstTheme;
  const replyPct = report?.headline?.replyRate?.pct || 0;

  return (
    <div className="print-page pb-20">
      {/* Sticky Header with Clay Styling & Actions */}
      <div className="sticky top-16 z-30 py-2.5 bg-surface-base/95 dark:bg-surface-dark/95 backdrop-blur-sm border-b border-ink-100/80 dark:border-ink-800/60 no-print transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ClayCard className="p-3.5 sm:p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-clay-sm">
            {/* App Metadata Snippet */}
            <div className="flex items-center space-x-3.5 min-w-0">
              {appInfo.icon ? (
                <img
                  src={appInfo.icon}
                  alt={appInfo.title}
                  className="w-12 h-12 rounded-2xl shadow-clay-sm object-cover bg-white flex-shrink-0"
                  onError={(e) => (e.target.style.display = "none")}
                />
              ) : (
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-brand-500 to-brand-600 text-white font-heading font-black text-lg flex items-center justify-center shadow-clay-sm flex-shrink-0">
                  {appInfo.title?.[0] || "A"}
                </div>
              )}
              <div className="min-w-0">
                <div className="flex items-center space-x-2">
                  <h2 className="text-base font-heading font-black text-ink-900 dark:text-white truncate">
                    {appInfo.title}
                  </h2>
                  <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-lg bg-surface-cardSubtle dark:bg-surface-darkCardSubtle text-ink-600 dark:text-ink-300 border border-ink-200/50 dark:border-ink-700/50 flex-shrink-0">
                    v{appInfo.version}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-2 text-xs text-ink-500 font-medium mt-0.5">
                  <span className="font-mono text-brand-600 dark:text-brand-400 font-bold">{analysis.appId}</span>
                  <span>•</span>
                  <span className="text-amber-500 font-bold flex items-center">
                    <Star className="w-3.5 h-3.5 fill-amber-400 mr-1" />
                    {appInfo.score}★
                  </span>
                  <span>•</span>
                  <span className="flex items-center space-x-1 text-ink-400">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{new Date(analysis.createdAt).toLocaleDateString()}</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Action Buttons using ClayButton */}
            <div className="flex flex-wrap items-center gap-2 flex-shrink-0">
              <ClayButton
                variant="secondary"
                size="sm"
                icon={Search}
                onClick={() => navigate(`/explorer/${analysis.appId}`)}
              >
                Explorer
              </ClayButton>

              <ClayButton
                variant="secondary"
                size="sm"
                icon={RotateCw}
                onClick={handleReRun}
              >
                Re-run
              </ClayButton>

              <ClayButton
                variant="secondary"
                size="sm"
                icon={Download}
                onClick={() => {
                  window.location.href = `/api/analyses/${id}/export?format=csv`;
                }}
              >
                Export CSV
              </ClayButton>

              <ClayButton
                variant="primary"
                size="sm"
                icon={Printer}
                onClick={() => window.print()}
              >
                Print / PDF
              </ClayButton>
            </div>
          </ClayCard>
        </div>
      </div>

      {/* Main Report Dashboard Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6 space-y-7">
        {/* Signature Executive Summary Banner with Reactive Mascot */}
        <ClayCard className="p-6 md:p-8 bg-gradient-to-br from-pastel-blue/40 via-white to-pastel-mint/30 dark:from-slate-900 dark:via-surface-darkCard dark:to-slate-900 border-2 border-brand-500/15 dark:border-brand-500/20 shadow-clay">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
            <div className="flex flex-col items-center flex-shrink-0">
              <Mascot rating={avgRating} celebrate={false} size="lg" />
              <span className="mt-2 text-[11px] font-heading font-extrabold uppercase tracking-wider text-brand-600 dark:text-brand-400 px-2.5 py-0.5 rounded-full bg-pastel-blue/80 dark:bg-brand-950/60 shadow-clay-sm">
                {avgRating >= 4.2 ? "Ecstatic Star" : avgRating >= 3.8 ? "Happy Star" : "Alert Star"}
              </span>
            </div>

            <div className="space-y-3 text-center md:text-left flex-1 min-w-0">
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-brand-500/10 text-brand-700 dark:text-brand-300 text-xs font-heading font-extrabold shadow-clay-sm">
                <Sparkles className="w-3.5 h-3.5 text-brand-500" />
                <span>Executive Summary &amp; Ratings Health</span>
              </div>

              <h3 className="text-xl sm:text-2xl font-heading font-black text-ink-900 dark:text-white leading-snug">
                {avgRating >= 4.0
                  ? `Strong Overall Sentiment (${avgRating.toFixed(2)}★) with targeted areas for polish.`
                  : avgRating >= 3.5
                  ? `Moderate User Satisfaction (${avgRating.toFixed(2)}★) — Friction observed in core workflows.`
                  : `Critical Attention Required (${avgRating.toFixed(2)}★) — System regressions impacting ratings.`}
              </h3>

              <p className="text-xs sm:text-sm text-ink-600 dark:text-ink-300 font-medium leading-relaxed">
                Based on a structured analysis of{" "}
                <strong className="text-ink-900 dark:text-white font-bold">{report?.dataNotes?.sampleSize?.toLocaleString() || "5,000"} reviews</strong>
                {worstTheme?.theme && (
                  <>
                    , the primary negative driver is{" "}
                    <span className="font-heading font-black text-status-danger underline decoration-wavy decoration-status-danger/40">
                      {worstTheme.theme.replace(/_/g, " ")}
                    </span>{" "}
                    accounting for <strong className="text-status-danger">{worstTheme.share}%</strong> of 1-2 star complaints.
                  </>
                )}{" "}
                Developer team has addressed{" "}
                <strong className="text-brand-600 dark:text-brand-400">{replyPct}%</strong> of incoming critical feedback.
              </p>

              <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 pt-1">
                <div className="px-3 py-1 rounded-xl bg-surface-cardSubtle/80 dark:bg-surface-darkCardSubtle/80 border border-ink-100 dark:border-ink-800 text-xs font-semibold text-ink-700 dark:text-ink-300 flex items-center space-x-1.5 shadow-clay-sm">
                  <Zap className="w-3.5 h-3.5 text-amber-500 stroke-[2.2]" />
                  <span>Top Fix: <strong className="font-heading font-extrabold">{report?.priorityFixes?.[0]?.title || "App Reliability"}</strong></span>
                </div>
                <div className="px-3 py-1 rounded-xl bg-surface-cardSubtle/80 dark:bg-surface-darkCardSubtle/80 border border-ink-100 dark:border-ink-800 text-xs font-semibold text-ink-700 dark:text-ink-300 flex items-center space-x-1.5 shadow-clay-sm">
                  <Clock className="w-3.5 h-3.5 text-brand-500 stroke-[2.2]" />
                  <span>Active Version: <strong className="font-mono font-bold">v{appInfo.version || "Current"}</strong></span>
                </div>
              </div>
            </div>
          </div>
        </ClayCard>

        {/* 1. Headline KPIs */}
        <div>
          <HeadlineKPIs headline={report?.headline} appInfo={appInfo} />
        </div>

        {/* 2. Star Distribution & Developer Reply Health */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-7">
          <StarDistribution distribution={report?.starDistribution} />
          <DeveloperReplies replies={report?.developerReplies} />
        </div>

        {/* 3. What Drives 1-2 Star Reviews */}
        <div>
          <WhyLowRatings whyLow={report?.whyLowThemes} appId={analysis.appId} />
        </div>

        {/* 4. Priority Fixes Matrix */}
        <div>
          <PriorityFixes fixes={report?.priorityFixes} appId={analysis.appId} />
        </div>

        {/* 5. Monthly Trend Line Chart */}
        <div>
          <MonthlyTrend trend={report?.monthlyTrend} />
        </div>

        {/* 6. Release Version Impact Table */}
        <div>
          <VersionImpact versionData={report?.versionImpact} />
        </div>

        {/* 7. Most Upvoted Low Reviews */}
        <div>
          <MostUpvotedLowReviews reviews={report?.topLowReviews} />
        </div>

        {/* 8. Data Notes & Methodology Box */}
        <div>
          <DataNotes notes={report?.dataNotes} />
        </div>
      </div>
    </div>
  );
}

export default ReportPage;

