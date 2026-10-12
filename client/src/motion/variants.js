/**
 * client/src/motion/variants.js
 * Reusable framer-motion variants honoring prefers-reduced-motion.
 */

import { springs, easings } from "./presets.js";

export const fadeIn = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.35, ease: easings.smooth },
  },
};

export const slideUp = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: springs.soft,
  },
};

export const popScale = {
  hidden: { opacity: 0, scale: 0.88 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: springs.bouncy,
  },
};

export const cardCascade = {
  hidden: { opacity: 0, y: 28, scale: 0.96 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      ...springs.soft,
      delay: i * 0.08,
    },
  }),
};

export const containerStagger = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.05,
    },
  },
};

export const itemStagger = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: springs.soft,
  },
};
