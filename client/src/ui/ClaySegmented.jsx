import React from "react";
import { motion } from "framer-motion";
import { springs } from "../motion/presets.js";

export function ClaySegmented({
  options = [],
  value,
  onChange,
  className = "",
  size = "md",
  name = "segmented",
}) {
  return (
    <div
      role="radiogroup"
      className={`clay-inset p-1.5 bg-surface-cardSubtle dark:bg-surface-darkCard rounded-pill inline-flex items-center gap-1 select-none ${className}`}
    >
      {options.map((opt) => {
        const isSelected = value === opt.value;
        const optValue = opt.value;
        const optLabel = opt.label;

        return (
          <button
            key={optValue}
            type="button"
            role="radio"
            aria-checked={isSelected}
            onClick={() => onChange(optValue)}
            className={`relative z-10 px-3.5 py-1.5 text-xs sm:text-sm font-heading font-bold rounded-pill transition-colors cursor-pointer clay-focus ${
              size === "sm" ? "px-2.5 py-1 text-xs" : "px-4 py-1.5 text-xs sm:text-sm"
            } ${
              isSelected
                ? "text-brand-600 dark:text-brand-300"
                : "text-ink-500 hover:text-ink-800 dark:text-ink-400 dark:hover:text-ink-200"
            }`}
          >
            {isSelected && (
              <motion.div
                layoutId={`segmented-thumb-${name}`}
                transition={springs.bouncy}
                className="clay-sm absolute inset-0 bg-white dark:bg-surface-darkCardSubtle rounded-pill -z-10 shadow-sm"
              />
            )}
            <span className="relative z-10">{optLabel}</span>
          </button>
        );
      })}
    </div>
  );
}

export default ClaySegmented;
