import React from "react";
import { motion } from "framer-motion";
import { springs } from "../motion/presets.js";

export function ClayProgress({
  value = 0,
  max = 100,
  variant = "brand", // 'brand', 'mint', 'peach', 'rose'
  size = "md",
  showLabel = false,
  className = "",
}) {
  const percent = Math.min(100, Math.max(0, (value / max) * 100));

  const GRADIENTS = {
    brand: "from-brand-500 to-accent-500",
    mint: "from-accent-500 to-green-500",
    peach: "from-amber-500 to-orange-500",
    rose: "from-rose-500 to-red-500",
  };

  const HEIGHTS = {
    sm: "h-2.5",
    md: "h-4",
    lg: "h-6",
  };

  return (
    <div className={`w-full ${className}`}>
      {showLabel && (
        <div className="flex justify-between items-center text-xs font-heading font-bold text-ink-600 dark:text-ink-400 mb-1.5">
          <span>Progress</span>
          <span className="tabular-nums font-mono">{Math.round(percent)}%</span>
        </div>
      )}
      <div
        className={`clay-inset w-full bg-surface-cardSubtle dark:bg-surface-darkCard rounded-pill overflow-hidden p-0.5 ${
          HEIGHTS[size] || HEIGHTS.md
        }`}
      >
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percent}%` }}
          transition={springs.soft}
          className={`clay-sm h-full rounded-pill bg-gradient-to-r ${
            GRADIENTS[variant] || GRADIENTS.brand
          } shadow-sm relative overflow-hidden`}
        >
          {/* Subtle glossy top highlight inside progress bar */}
          <div className="absolute inset-x-0 top-0 h-1/2 bg-white/30 rounded-t-pill" />
        </motion.div>
      </div>
    </div>
  );
}

export default ClayProgress;
