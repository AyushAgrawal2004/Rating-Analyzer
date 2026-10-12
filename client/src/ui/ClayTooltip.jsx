import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { springs } from "../motion/presets.js";

export function ClayTooltip({ content, children, className = "" }) {
  const [isVisible, setIsVisible] = useState(false);

  if (!content) return children;

  return (
    <div
      className="relative inline-flex"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
      onFocus={() => setIsVisible(true)}
      onBlur={() => setIsVisible(false)}
    >
      {children}
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0, scale: 0.85, y: 6 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.85, y: 4 }}
            transition={springs.bouncy}
            className={`clay-sm absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 rounded-pill bg-ink-900 text-white text-[11px] font-heading font-bold shadow-lg pointer-events-none whitespace-nowrap z-50 ${className}`}
          >
            {content}
            <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-ink-900" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default ClayTooltip;
