import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { springs } from "../motion/presets.js";

export const Mascot = React.memo(function Mascot({
  rating,
  mood, // 'ecstatic' | 'happy' | 'neutral' | 'worried'
  celebrate = false,
  size = "md",
  className = "",
}) {
  const [isBlinking, setIsBlinking] = useState(false);

  // Determine mood from rating if not explicitly passed
  let currentMood = mood;
  if (!currentMood) {
    if (rating === undefined || rating === null) currentMood = "happy";
    else if (rating >= 4.5) currentMood = "ecstatic";
    else if (rating >= 4.0) currentMood = "happy";
    else if (rating >= 3.5) currentMood = "neutral";
    else currentMood = "worried";
  }

  // Periodic natural eye blinking cycle
  useEffect(() => {
    const blinkInterval = setInterval(() => {
      setIsBlinking(true);
      setTimeout(() => setIsBlinking(false), 160);
    }, 4200);

    return () => clearInterval(blinkInterval);
  }, []);

  const SIZES = {
    sm: "w-9 h-9",
    md: "w-14 h-14",
    lg: "w-20 h-20",
    xl: "w-28 h-28",
  };

  const currentSizeClass = SIZES[size] || SIZES.md;

  return (
    <motion.div
      animate={
        celebrate
          ? {
              y: [0, -18, 0, -10, 0],
              rotate: [0, -6, 6, -3, 0],
              scale: [1, 1.15, 1, 1.05, 1],
            }
          : {
              y: [0, -4, 0],
            }
      }
      transition={
        celebrate
          ? { duration: 0.8, ease: "easeOut" }
          : { duration: 3, repeat: Infinity, ease: "easeInOut" }
      }
      className={`mascot-animated inline-block shrink-0 select-none ${currentSizeClass} ${className}`}
    >
      <svg viewBox="0 0 120 120" className="w-full h-full drop-shadow-md overflow-visible">
        <defs>
          {/* Soft 3D Clay Body Gradient */}
          <radialGradient id="mascotClayBody" cx="35%" cy="30%" r="70%">
            <stop offset="0%" stopColor="#FFF9D2" />
            <stop offset="35%" stopColor="#FDE047" />
            <stop offset="75%" stopColor="#EAB308" />
            <stop offset="100%" stopColor="#CA8A04" />
          </radialGradient>

          {/* Rosy Cheek Gradient */}
          <radialGradient id="mascotCheek" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FB7185" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#FDA4AF" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* 5-pointed Soft Rounded Clay Star Body */}
        <path
          d="M60 12 
             C63 26, 74 38, 88 41 
             C104 44, 114 54, 107 68 
             C101 79, 97 92, 104 105 
             C92 105, 78 98, 66 102 
             C54 105, 42 114, 30 106 
             C35 93, 30 80, 22 70 
             C12 58, 20 45, 34 43 
             C47 40, 56 26, 60 12 Z"
          fill="url(#mascotClayBody)"
          stroke="#FFFFFF"
          strokeWidth="3.5"
          strokeLinejoin="round"
        />

        {/* Soft Specular Highlights on top horn */}
        <ellipse cx="60" cy="24" rx="12" ry="5" fill="#FFFFFF" opacity="0.65" />

        {/* Cheeks */}
        <circle cx="36" cy="68" r="8" fill="url(#mascotCheek)" />
        <circle cx="84" cy="68" r="8" fill="url(#mascotCheek)" />

        {/* Eyes */}
        {isBlinking ? (
          // Blinking Slits
          <g stroke="#1E293B" strokeWidth="3" strokeLinecap="round">
            <line x1="40" y1="58" x2="50" y2="58" />
            <line x1="70" y1="58" x2="80" y2="58" />
          </g>
        ) : currentMood === "ecstatic" ? (
          // Ecstatic Curved Happy Eyes
          <g stroke="#0F172A" strokeWidth="3.5" strokeLinecap="round" fill="none">
            <path d="M38 60 Q 45 50 52 60" />
            <path d="M68 60 Q 75 50 82 60" />
            <circle cx="45" cy="46" r="2" fill="#FFFFFF" />
            <circle cx="75" cy="46" r="2" fill="#FFFFFF" />
          </g>
        ) : currentMood === "happy" ? (
          // Happy Eyes with Highlights
          <g fill="#0F172A">
            <circle cx="45" cy="57" r="5" />
            <circle cx="75" cy="57" r="5" />
            <circle cx="43" cy="55" r="1.8" fill="#FFFFFF" />
            <circle cx="73" cy="55" r="1.8" fill="#FFFFFF" />
          </g>
        ) : currentMood === "neutral" ? (
          // Curious Round Eyes
          <g fill="#0F172A">
            <circle cx="45" cy="58" r="4.5" />
            <circle cx="75" cy="58" r="4.5" />
            <circle cx="43.5" cy="56" r="1.5" fill="#FFFFFF" />
            <circle cx="73.5" cy="56" r="1.5" fill="#FFFFFF" />
          </g>
        ) : (
          // Worried Eyes with slight drooping angle
          <g fill="#0F172A">
            <ellipse cx="45" cy="59" rx="4.5" ry="5.5" />
            <ellipse cx="75" cy="59" rx="4.5" ry="5.5" />
            <circle cx="44" cy="57" r="1.5" fill="#FFFFFF" />
            <circle cx="74" cy="57" r="1.5" fill="#FFFFFF" />
            {/* Worried brows */}
            <path d="M40 51 Q 46 48 51 52" stroke="#1E293B" strokeWidth="2" fill="none" strokeLinecap="round" />
            <path d="M80 51 Q 74 48 69 52" stroke="#1E293B" strokeWidth="2" fill="none" strokeLinecap="round" />
          </g>
        )}

        {/* Mouth Reactions */}
        {currentMood === "ecstatic" ? (
          // Big Open Happy Mouth with Tongue
          <g>
            <path
              d="M50 68 Q 60 84 70 68 Z"
              fill="#BE123C"
              stroke="#0F172A"
              strokeWidth="2.5"
              strokeLinejoin="round"
            />
            <path d="M54 75 Q 60 78 66 75" fill="#FB7185" />
          </g>
        ) : currentMood === "happy" ? (
          // Sweet Smile
          <path
            d="M50 69 Q 60 79 70 69"
            fill="none"
            stroke="#0F172A"
            strokeWidth="3.2"
            strokeLinecap="round"
          />
        ) : currentMood === "neutral" ? (
          // Straight neutral line
          <path
            d="M52 71 Q 60 71 68 71"
            fill="none"
            stroke="#0F172A"
            strokeWidth="3"
            strokeLinecap="round"
          />
        ) : (
          // Worried slight downward curve
          <path
            d="M52 75 Q 60 69 68 75"
            fill="none"
            stroke="#0F172A"
            strokeWidth="3.2"
            strokeLinecap="round"
          />
        )}
      </svg>
    </motion.div>
  );
});

export default Mascot;
