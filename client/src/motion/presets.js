/**
 * client/src/motion/presets.js
 * Expressive motion tokens and spring presets for claymorphism.
 */

export const springs = {
  // Soft, buoyant motion for cards and floating blobs
  soft: {
    type: "spring",
    stiffness: 120,
    damping: 18,
    mass: 0.8,
  },
  // Playful bouncy spring for mascots, chips, and modals
  bouncy: {
    type: "spring",
    stiffness: 260,
    damping: 15,
    mass: 0.7,
  },
  // Snappy responsive feedback for buttons, toggles, and thumbs
  snappy: {
    type: "spring",
    stiffness: 420,
    damping: 24,
    mass: 0.5,
  },
  // Squish spring for button presses and tactile taps
  squish: {
    type: "spring",
    stiffness: 500,
    damping: 18,
    mass: 0.4,
  },
  // Gentle slow float
  float: {
    type: "spring",
    stiffness: 40,
    damping: 10,
  },
};

export const easings = {
  smooth: [0.22, 1, 0.36, 1], // easeOutQuint
  anticipate: [0.34, 1.56, 0.64, 1], // soft overshoot
  gentle: [0.16, 1, 0.3, 1],
};

export const durations = {
  instant: 0.15,
  fast: 0.25,
  normal: 0.4,
  deliberate: 0.65,
  slow: 0.9,
};

export const staggerTimings = {
  fast: 0.04,
  normal: 0.08,
  relaxed: 0.12,
};
