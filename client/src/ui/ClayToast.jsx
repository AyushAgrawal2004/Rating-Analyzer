import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";
import { springs } from "../motion/presets.js";

const TOAST_ICONS = {
  success: CheckCircle2,
  error: AlertCircle,
  info: Info,
};

const TOAST_STYLES = {
  success: "bg-green-50 text-green-900 border-green-200 dark:bg-green-950/90 dark:text-green-200",
  error: "bg-red-50 text-red-900 border-red-200 dark:bg-red-950/90 dark:text-red-200",
  info: "bg-blue-50 text-blue-900 border-blue-200 dark:bg-blue-950/90 dark:text-blue-200",
};

export function ClayToast({ message, type = "success", isVisible = false, onClose }) {
  const Icon = TOAST_ICONS[type] || TOAST_ICONS.info;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.9 }}
          transition={springs.bouncy}
          className={`clay fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-pill shadow-xl border ${
            TOAST_STYLES[type] || TOAST_STYLES.info
          }`}
        >
          <Icon className="w-5 h-5 shrink-0 stroke-[2.3]" />
          <span className="text-xs sm:text-sm font-heading font-bold">{message}</span>
          {onClose && (
            <button
              onClick={onClose}
              className="p-1 rounded-full opacity-70 hover:opacity-100 transition-opacity"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default ClayToast;
