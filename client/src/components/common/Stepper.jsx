import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Loader2, Sparkles, AlertCircle } from "lucide-react";
import { ClayCard, ClayButton } from "../../ui/index.js";
import { springs } from "../../motion/presets.js";

// 8-10 soft pastel confetti particles for completed stations
function ConfettiBurst() {
  const particles = [
    { x: -18, y: -18, color: "#34D399", size: 6 },
    { x: 18, y: -16, color: "#60A5FA", size: 5 },
    { x: -22, y: 4, color: "#F472B6", size: 7 },
    { x: 20, y: 6, color: "#FBBF24", size: 5 },
    { x: -12, y: 18, color: "#A78BFA", size: 6 },
    { x: 14, y: 18, color: "#34D399", size: 7 },
    { x: 0, y: -24, color: "#F87171", size: 5 },
    { x: -24, y: -8, color: "#38BDF8", size: 6 },
    { x: 22, y: -10, color: "#FCD34D", size: 6 },
  ];

  return (
    <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
      {particles.map((p, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 1, scale: 0, x: 0, y: 0 }}
          animate={{ opacity: 0, scale: 1.2, x: p.x, y: p.y }}
          transition={{ duration: 0.65, ease: "easeOut" }}
          style={{
            backgroundColor: p.color,
            width: p.size,
            height: p.size,
          }}
          className="rounded-full absolute shadow-sm"
        />
      ))}
    </div>
  );
}

export function Stepper({ status, progress, onCancel, useAI = true }) {
  const steps = useAI
    ? [
        { key: "fetching", label: "Fetching", fullName: "Fetching Reviews", desc: "Pulling reviews from Play Store" },
        { key: "tagging", label: "Tagging", fullName: "Rule Tagging", desc: "Applying regex theme dictionary" },
        { key: "ai_labelling", label: "AI Labelling", fullName: "Gemini AI Labelling", desc: "Categorizing ambiguous low reviews" },
        { key: "building_report", label: "Report", fullName: "Building Report", desc: "Synthesizing KPIs & fix matrix" },
      ]
    : [
        { key: "fetching", label: "Fetching", fullName: "Fetching Reviews", desc: "Pulling reviews from Play Store" },
        { key: "tagging", label: "Tagging", fullName: "Rule Tagging", desc: "Applying 13 theme classifiers" },
        { key: "building_report", label: "Diagnostics", fullName: "Theme Diagnostics", desc: "Cohort & version analysis" },
        { key: "completed", label: "Report", fullName: "Synthesizing Report", desc: "KPIs & priority fixes" },
      ];

  const getStepState = (stepKey) => {
    const order = useAI
      ? ["fetching", "tagging", "ai_labelling", "building_report", "completed"]
      : ["fetching", "tagging", "building_report", "completed"];

    const normalizedStatus = status === "pending" ? "fetching" : status;
    const currentIndex = order.indexOf(normalizedStatus);
    const stepIndex = order.indexOf(stepKey);

    if (status === "failed") {
      return stepIndex <= currentIndex ? "error" : "upcoming";
    }
    if (currentIndex > stepIndex) return "completed";
    if (currentIndex === stepIndex) return "active";
    return "upcoming";
  };

  const getBallPercent = () => {
    if (status === "completed") return 100;

    if (useAI) {
      if (status === "building_report") return 88;
      if (status === "ai_labelling") {
        if (progress?.total > 0 && progress?.current > 0) {
          return Math.min(84, 62 + (progress.current / progress.total) * 22);
        }
        return 62;
      }
      if (status === "tagging") {
        if (progress?.total > 0 && progress?.current > 0) {
          return Math.min(58, 36 + (progress.current / progress.total) * 22);
        }
        return 36;
      }
      if (status === "fetching") {
        if (progress?.total > 0 && progress?.current > 0) {
          return Math.min(30, 8 + (progress.current / progress.total) * 22);
        }
        return 12;
      }
    } else {
      if (status === "building_report") return 74;
      if (status === "tagging") {
        if (progress?.total > 0 && progress?.current > 0) {
          return Math.min(68, 38 + (progress.current / progress.total) * 30);
        }
        return 38;
      }
      if (status === "fetching") {
        if (progress?.total > 0 && progress?.current > 0) {
          return Math.min(32, 10 + (progress.current / progress.total) * 22);
        }
        return 12;
      }
    }
    return 8;
  };

  const ballPercent = getBallPercent();

  return (
    <ClayCard radius="xl" className="w-full max-w-3xl mx-auto p-6 sm:p-9 shadow-2xl relative">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-8">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-pill bg-clay-blue-light dark:bg-clay-blue-dark text-brand-600 dark:text-brand-300 text-xs font-heading font-extrabold mb-1.5">
            <Sparkles className="w-3.5 h-3.5 text-accent-500 animate-spin" />
            <span>Active Diagnostics Pipeline</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-heading font-black text-ink-900 dark:text-white tracking-tight">
            Analyzing Application Reviews
          </h2>
          <p className="text-xs sm:text-sm text-ink-500 dark:text-ink-400 font-medium mt-0.5">
            {progress?.message || "Preparing background analysis job..."}
          </p>
        </div>

        {onCancel && status !== "completed" && status !== "failed" && (
          <ClayButton
            variant="ghost"
            size="sm"
            onClick={onCancel}
            className="text-status-danger hover:bg-red-50 dark:hover:bg-red-950/40 font-bold self-start sm:self-auto"
          >
            Cancel Pipeline
          </ClayButton>
        )}
      </div>

      {/* CLAY JOURNEY TRACK */}
      <div className="relative my-10 px-2 sm:px-6">
        {/* Recessed Inset Track Trough */}
        <div className="clay-inset w-full h-4 rounded-pill bg-surface-cardSubtle dark:bg-surface-darkCard p-0.5 relative overflow-visible">
          {/* Active Fill Gradient */}
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${ballPercent}%` }}
            transition={springs.soft}
            className="clay-sm h-full rounded-pill bg-gradient-to-r from-brand-500 via-accent-500 to-brand-600"
          />

          {/* Glossy Clay Rolling Ball with Wobble */}
          <motion.div
            animate={{
              left: `calc(${ballPercent}% - 18px)`,
              rotate: [-6, 6, -6],
              y: [-1, 1, -1],
            }}
            transition={{
              left: springs.soft,
              rotate: { duration: 1.2, repeat: Infinity, ease: "easeInOut" },
              y: { duration: 0.8, repeat: Infinity, ease: "easeInOut" },
            }}
            className="clay-sm absolute -top-2.5 w-9 h-9 rounded-full bg-gradient-to-tr from-brand-600 via-brand-500 to-accent-300 shadow-lg flex items-center justify-center text-white z-20 cursor-grab"
          >
            <div className="w-2.5 h-2.5 rounded-full bg-white/70 shadow-inner" />
          </motion.div>
        </div>

        {/* 4 Stations Nodes on Track */}
        <div className="flex items-center justify-between mt-6">
          {steps.map((step, idx) => {
            const state = getStepState(step.key);
            const isCompleted = state === "completed";
            const isActive = state === "active";
            const isError = state === "error";

            return (
              <div key={step.key} className="flex flex-col items-center relative text-center w-24">
                {/* Completed Confetti Burst */}
                <AnimatePresence>
                  {isCompleted && <ConfettiBurst key={`burst-${step.key}`} />}
                </AnimatePresence>

                {/* Station Node Badge */}
                <motion.div
                  initial={false}
                  animate={{
                    scale: isActive ? [1, 1.14, 1] : 1,
                  }}
                  transition={isActive ? { duration: 2, repeat: Infinity } : springs.bouncy}
                  className={`clay-sm w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-heading font-black text-xs sm:text-sm mb-2 transition-colors relative z-10 ${
                    isCompleted
                      ? "bg-accent-500 text-white shadow-md shadow-accent-500/20"
                      : isActive
                      ? "bg-brand-500 text-white shadow-md shadow-brand-500/30 ring-4 ring-brand-200 dark:ring-brand-900/60"
                      : isError
                      ? "bg-status-danger text-white shadow-md"
                      : "bg-surface-card dark:bg-surface-darkCard text-ink-400"
                  }`}
                >
                  {isCompleted ? (
                    <Check className="w-5 h-5 stroke-[3]" />
                  ) : isActive ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : isError ? (
                    <AlertCircle className="w-5 h-5" />
                  ) : (
                    <span>{idx + 1}</span>
                  )}
                </motion.div>

                <h4
                  className={`text-xs font-heading font-extrabold transition-colors leading-tight ${
                    isActive
                      ? "text-brand-600 dark:text-brand-400"
                      : isCompleted
                      ? "text-ink-900 dark:text-white"
                      : "text-ink-400"
                  }`}
                >
                  {step.fullName}
                </h4>

                <span className="text-[10px] text-ink-400 dark:text-ink-500 hidden sm:block mt-0.5">
                  {step.desc}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Live Tick Metric Box */}
      {progress && progress.total > 0 && (
        <div className="clay-sm p-4 rounded-clay-md bg-clay-blue-light/70 dark:bg-clay-blue-dark/50 flex items-center justify-between mt-8">
          <div className="flex items-center gap-2.5">
            <Loader2 className="w-4 h-4 text-brand-600 dark:text-brand-400 animate-spin shrink-0" />
            <span className="text-xs sm:text-sm font-heading font-bold text-ink-800 dark:text-ink-200">
              {progress.message || "Processing batch data..."}
            </span>
          </div>
          <span className="tabular-nums font-mono font-extrabold text-xs sm:text-sm text-brand-700 dark:text-brand-300 shrink-0">
            {progress.current?.toLocaleString()} / {progress.total?.toLocaleString()}
          </span>
        </div>
      )}
    </ClayCard>
  );
}

export default Stepper;
