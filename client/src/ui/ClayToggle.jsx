import React from "react";
import { motion } from "framer-motion";
import { Sun, Moon } from "lucide-react";
import { springs } from "../motion/presets.js";

export function ClayToggle({
  checked = false,
  onChange,
  disabled = false,
  isThemeToggle = false,
  label,
  className = "",
  size = "md",
}) {
  const handleToggle = () => {
    if (!disabled && onChange) {
      onChange(!checked);
    }
  };

  const isSm = size === "sm";

  return (
    <div className={`inline-flex items-center gap-2.5 ${className}`}>
      {label && (
        <span
          onClick={handleToggle}
          className={`font-heading font-bold select-none cursor-pointer ${
            isSm ? "text-xs" : "text-sm"
          } ${disabled ? "opacity-50" : "text-ink-700 dark:text-ink-200"}`}
        >
          {label}
        </span>
      )}
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={handleToggle}
        className={`clay-inset relative inline-flex items-center shrink-0 cursor-pointer rounded-pill transition-colors p-1 clay-focus ${
          isSm ? "w-11 h-6" : "w-14 h-8"
        } ${
          checked
            ? isThemeToggle
              ? "bg-indigo-950/80"
              : "bg-brand-500"
            : isThemeToggle
            ? "bg-amber-100"
            : "bg-ink-200 dark:bg-ink-800"
        } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
      >
        <motion.div
          animate={{
            x: checked ? (isSm ? 20 : 24) : 0,
            scale: [0.95, 1.05, 1],
          }}
          transition={springs.bouncy}
          className={`clay-sm flex items-center justify-center rounded-full bg-white dark:bg-slate-200 shadow-md ${
            isSm ? "w-4 h-4" : "w-6 h-6"
          }`}
        >
          {isThemeToggle ? (
            checked ? (
              <Moon className={`${isSm ? "w-2.5 h-2.5" : "w-3.5 h-3.5"} text-indigo-900 fill-indigo-900`} />
            ) : (
              <Sun className={`${isSm ? "w-2.5 h-2.5" : "w-3.5 h-3.5"} text-amber-500 fill-amber-500`} />
            )
          ) : null}
        </motion.div>
      </button>
    </div>
  );
}

export default ClayToggle;
