import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import ClayCard from "./ClayCard.jsx";
import { springs } from "../motion/presets.js";

export function ClayModal({
  isOpen,
  onClose,
  title,
  children,
  maxWidth = "max-w-lg",
}) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          {/* Backdrop blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-ink-900/40 backdrop-blur-sm -z-10"
          />

          {/* Modal Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={springs.bouncy}
            className={`w-full ${maxWidth}`}
          >
            <ClayCard radius="xl" className="p-6 sm:p-8 shadow-2xl relative">
              <div className="flex items-center justify-between pb-4 border-b border-ink-100 dark:border-ink-800">
                {title && (
                  <h3 className="text-lg sm:text-xl font-heading font-extrabold text-ink-900 dark:text-white">
                    {title}
                  </h3>
                )}
                <button
                  type="button"
                  onClick={onClose}
                  className="clay-sm p-2 rounded-full text-ink-500 hover:text-ink-800 dark:hover:text-ink-200 transition-colors ml-auto"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="mt-4">{children}</div>
            </ClayCard>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

export default ClayModal;
