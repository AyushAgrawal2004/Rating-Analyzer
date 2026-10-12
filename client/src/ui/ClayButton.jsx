import React from "react";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { springs } from "../motion/presets.js";

const VARIANTS = {
  primary:
    "clay-sm bg-gradient-to-br from-brand-500 to-brand-600 text-white font-bold shadow-brand-500/25 hover:from-brand-600 hover:to-brand-700",
  secondary:
    "clay-sm bg-surface-card dark:bg-surface-darkCard text-ink-800 dark:text-ink-100 hover:text-brand-600 dark:hover:text-brand-400 font-semibold",
  accent:
    "clay-sm bg-gradient-to-br from-accent-500 to-accent-600 text-white font-bold shadow-accent-500/25 hover:from-accent-600 hover:to-accent-700",
  ghost:
    "bg-transparent text-ink-600 dark:text-ink-300 hover:bg-surface-card/60 dark:hover:bg-surface-darkCard/60 font-semibold",
  danger:
    "clay-sm bg-gradient-to-br from-status-danger to-red-600 text-white font-bold",
};

const SIZES = {
  sm: "px-3.5 py-1.5 text-xs rounded-pill gap-1.5",
  md: "px-5 py-2.5 text-sm rounded-pill gap-2",
  lg: "px-7 py-3.5 text-base rounded-pill gap-2.5",
  icon: "p-2.5 rounded-full aspect-square flex items-center justify-center",
  iconLg: "p-3.5 rounded-full aspect-square flex items-center justify-center",
};

export const ClayButton = React.forwardRef(function ClayButton(
  {
    children,
    variant = "primary",
    size = "md",
    isLoading = false,
    disabled = false,
    className = "",
    onClick,
    type = "button",
    icon: Icon,
    ...props
  },
  ref
) {
  const isIconOnly = size === "icon" || size === "iconLg";

  return (
    <motion.button
      ref={ref}
      type={type}
      disabled={disabled || isLoading}
      onClick={onClick}
      whileHover={
        disabled || isLoading
          ? undefined
          : { scale: 1.025, y: -2, transition: springs.bouncy }
      }
      whileTap={
        disabled || isLoading
          ? undefined
          : { scale: 0.94, y: 1, transition: springs.squish }
      }
      className={`inline-flex items-center justify-center select-none font-heading cursor-pointer tracking-wide disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none transition-colors clay-focus ${VARIANTS[variant] || VARIANTS.primary} ${SIZES[size] || SIZES.md} ${className}`}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin text-current" />
      ) : Icon ? (
        <Icon className={`${isIconOnly ? "w-5 h-5" : "w-4 h-4"} stroke-[2.2]`} />
      ) : null}
      {!isIconOnly && children}
    </motion.button>
  );
});

export default ClayButton;
