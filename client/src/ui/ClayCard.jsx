import React from "react";
import { motion } from "framer-motion";
import { springs } from "../motion/presets.js";

const VARIANTS = {
  default: "bg-surface-card dark:bg-surface-darkCard text-ink-900 dark:text-ink-100",
  subtle: "bg-surface-cardSubtle dark:bg-surface-darkCardSubtle text-ink-900 dark:text-ink-100",
  blue: "bg-clay-blue-light dark:bg-clay-blue-dark text-clay-blue-text dark:text-clay-blue-darkText",
  mint: "bg-clay-mint-light dark:bg-clay-mint-dark text-clay-mint-text dark:text-clay-mint-darkText",
  lavender: "bg-clay-lavender-light dark:bg-clay-lavender-dark text-clay-lavender-text dark:text-clay-lavender-darkText",
  peach: "bg-clay-peach-light dark:bg-clay-peach-dark text-clay-peach-text dark:text-clay-peach-darkText",
  butter: "bg-clay-butter-light dark:bg-clay-butter-dark text-clay-butter-text dark:text-clay-butter-darkText",
  rose: "bg-clay-rose-light dark:bg-clay-rose-dark text-clay-rose-text dark:text-clay-rose-darkText",
};

const RADII = {
  sm: "rounded-clay-sm",
  md: "rounded-clay-md",
  lg: "rounded-clay-lg",
  xl: "rounded-clay-xl",
  pill: "rounded-pill",
};

export const ClayCard = React.forwardRef(function ClayCard(
  {
    children,
    variant = "default",
    radius = "lg",
    hoverLift = false,
    className = "",
    onClick,
    ...props
  },
  ref
) {
  const liftClass = hoverLift ? "hover:-translate-y-1 transition-transform duration-150 ease-out will-change-transform" : "";
  const baseClasses = `clay relative overflow-hidden ${VARIANTS[variant] || VARIANTS.default} ${RADII[radius] || RADII.lg} ${liftClass} ${className}`;

  if (!onClick) {
    return (
      <div
        ref={ref}
        className={baseClasses}
        {...props}
      >
        {children}
      </div>
    );
  }

  return (
    <motion.div
      ref={ref}
      onClick={onClick}
      whileTap={{ scale: 0.98, transition: springs.squish }}
      className={`${baseClasses} cursor-pointer`}
      {...props}
    >
      {children}
    </motion.div>
  );
});

export default ClayCard;
