import React, { useEffect, useState } from "react";
import { motion, useSpring, useTransform } from "framer-motion";
import { ArrowUpRight, ArrowDownRight, Minus } from "lucide-react";
import ClayCard from "./ClayCard.jsx";
import { springs } from "../motion/presets.js";

function AnimatedNumber({ value, precision = 0, prefix = "", suffix = "" }) {
  const numValue = typeof value === "number" ? value : parseFloat(value) || 0;
  const [rendered, setRendered] = useState(() =>
    precision > 0 ? numValue.toFixed(precision) : Math.round(numValue).toLocaleString()
  );

  useEffect(() => {
    let startTime = null;
    let animId = null;
    const duration = 450; // ms

    const animate = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      const current = numValue * eased;
      setRendered(
        precision > 0 ? current.toFixed(precision) : Math.round(current).toLocaleString()
      );
      if (progress < 1) {
        animId = requestAnimationFrame(animate);
      }
    };

    animId = requestAnimationFrame(animate);
    return () => {
      if (animId) cancelAnimationFrame(animId);
    };
  }, [numValue, precision]);

  return (
    <span className="tabular-nums font-heading font-black">
      {prefix}
      {rendered}
      {suffix}
    </span>
  );
}

export function ClayStat({
  title,
  value,
  displayValue,
  precision = 0,
  prefix = "",
  suffix = "",
  delta,
  deltaType = "score", // 'score' (higher is better) or 'friction' (lower is better)
  icon: Icon,
  variant = "default",
  note,
  className = "",
}) {
  let deltaDirection = "neutral";
  let isPositive = false;

  if (delta !== undefined && delta !== null) {
    if (delta > 0) {
      deltaDirection = "up";
      isPositive = deltaType === "score";
    } else if (delta < 0) {
      deltaDirection = "down";
      isPositive = deltaType !== "score";
    }
  }

  return (
    <ClayCard variant={variant} hoverLift className={`p-5 sm:p-6 ${className}`}>
      <div className="flex items-center justify-between gap-3 mb-2">
        <span className="text-xs sm:text-sm font-heading font-bold text-ink-500 dark:text-ink-400 uppercase tracking-wider">
          {title}
        </span>
        {Icon && (
          <div className="clay-sm w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center bg-white dark:bg-surface-darkCard text-brand-600 dark:text-brand-400 shrink-0">
            <Icon className="w-5 h-5 stroke-[2.4]" />
          </div>
        )}
      </div>

      <div className="flex items-baseline gap-2.5 my-1">
        <div className="text-3xl sm:text-4xl lg:text-5xl font-heading font-extrabold tracking-tight text-ink-900 dark:text-white">
          {displayValue ? (
            <span className="tabular-nums font-heading font-black">{displayValue}</span>
          ) : typeof value === "number" ? (
            <AnimatedNumber value={value} precision={precision} prefix={prefix} suffix={suffix} />
          ) : (
            value
          )}
        </div>

        {delta !== undefined && delta !== null && delta !== 0 && (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={springs.bouncy}
            className={`clay-sm inline-flex items-center gap-1 px-2.5 py-1 rounded-pill text-xs font-heading font-extrabold shadow-sm ${
              isPositive
                ? "bg-green-100 text-status-success dark:bg-green-950/80 dark:text-green-300"
                : "bg-red-100 text-status-danger dark:bg-red-950/80 dark:text-red-300"
            }`}
          >
            {deltaDirection === "up" ? (
              <ArrowUpRight className="w-3.5 h-3.5 stroke-[2.8]" />
            ) : deltaDirection === "down" ? (
              <ArrowDownRight className="w-3.5 h-3.5 stroke-[2.8]" />
            ) : (
              <Minus className="w-3.5 h-3.5" />
            )}
            <span>
              {delta > 0 ? `+${delta}` : delta}
              {deltaType === "friction" ? "%" : ""}
            </span>
          </motion.div>
        )}
      </div>

      {note && (
        <p className="text-xs text-ink-500 dark:text-ink-400 mt-1 font-medium">
          {note}
        </p>
      )}
    </ClayCard>
  );
}

export default ClayStat;
