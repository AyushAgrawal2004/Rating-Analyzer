import React from "react";
import { motion } from "framer-motion";
import { Sparkles, Check } from "lucide-react";
import { springs } from "../motion/presets.js";

const THEME_COLOR_MAP = {
  update_regression: {
    bg: "bg-clay-peach-light dark:bg-clay-peach-dark",
    text: "text-clay-peach-text dark:text-clay-peach-darkText",
  },
  app_crash_wont_open: {
    bg: "bg-clay-rose-light dark:bg-clay-rose-dark",
    text: "text-clay-rose-text dark:text-clay-rose-darkText",
  },
  login_access: {
    bg: "bg-clay-lavender-light dark:bg-clay-lavender-dark",
    text: "text-clay-lavender-text dark:text-clay-lavender-darkText",
  },
  booking_failure: {
    bg: "bg-clay-peach-light dark:bg-clay-peach-dark",
    text: "text-clay-peach-text dark:text-clay-peach-darkText",
  },
  late_or_no_cab: {
    bg: "bg-clay-butter-light dark:bg-clay-butter-dark",
    text: "text-clay-butter-text dark:text-clay-butter-darkText",
  },
  eta_tracking: {
    bg: "bg-clay-blue-light dark:bg-clay-blue-dark",
    text: "text-clay-blue-text dark:text-clay-blue-darkText",
  },
  routing_pooling: {
    bg: "bg-clay-blue-light dark:bg-clay-blue-dark",
    text: "text-clay-blue-text dark:text-clay-blue-darkText",
  },
  safety: {
    bg: "bg-clay-rose-light dark:bg-clay-rose-dark",
    text: "text-clay-rose-text dark:text-clay-rose-darkText",
  },
  ux_friction: {
    bg: "bg-clay-lavender-light dark:bg-clay-lavender-dark",
    text: "text-clay-lavender-text dark:text-clay-lavender-darkText",
  },
  support_grievance: {
    bg: "bg-clay-butter-light dark:bg-clay-butter-dark",
    text: "text-clay-butter-text dark:text-clay-butter-darkText",
  },
  notifications: {
    bg: "bg-clay-blue-light dark:bg-clay-blue-dark",
    text: "text-clay-blue-text dark:text-clay-blue-darkText",
  },
  positive: {
    bg: "bg-clay-mint-light dark:bg-clay-mint-dark",
    text: "text-clay-mint-text dark:text-clay-mint-darkText",
  },
  other: {
    bg: "bg-slate-100 dark:bg-slate-800",
    text: "text-slate-700 dark:text-slate-300",
  },
  no_detail: {
    bg: "bg-slate-100 dark:bg-slate-800",
    text: "text-slate-700 dark:text-slate-300",
  },
};

export function ClayChip({
  label,
  themeKey,
  selected = false,
  onClick,
  isAI = false,
  count,
  className = "",
  size = "md",
}) {
  const colors = (themeKey && THEME_COLOR_MAP[themeKey]) || {
    bg: "bg-surface-cardSubtle dark:bg-surface-darkCard",
    text: "text-ink-800 dark:text-ink-200",
  };

  const isClickable = Boolean(onClick);

  return (
    <motion.button
      type="button"
      onClick={onClick}
      disabled={!isClickable}
      whileHover={isClickable ? { scale: 1.05, y: -1, transition: springs.bouncy } : undefined}
      whileTap={isClickable ? { scale: 0.94, transition: springs.squish } : undefined}
      className={`clay-sm inline-flex items-center rounded-pill font-heading font-bold select-none cursor-pointer tracking-wide transition-all ${
        size === "sm" ? "px-2.5 py-0.5 text-[11px] gap-1" : "px-3.5 py-1 text-xs gap-1.5"
      } ${
        selected
          ? "bg-brand-500 text-white shadow-md ring-2 ring-brand-300"
          : `${colors.bg} ${colors.text}`
      } ${!isClickable ? "cursor-default" : ""} ${className}`}
    >
      {isAI && <Sparkles className="w-3 h-3 text-accent-500 shrink-0" />}
      {selected && <Check className="w-3 h-3 text-white shrink-0" />}
      <span className="capitalize">{label || (themeKey ? themeKey.replace(/_/g, " ") : "")}</span>
      {count !== undefined && (
        <span
          className={`ml-0.5 px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
            selected
              ? "bg-white/20 text-white"
              : "bg-ink-900/10 dark:bg-white/10 text-current"
          }`}
        >
          {count}
        </span>
      )}
    </motion.button>
  );
}

export default ClayChip;
