import React, { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

export function FloatingShapes({ className = "" }) {
  const [isMobile, setIsMobile] = useState(false);

  // Mouse parallax springs for desktop
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springX = useSpring(mouseX, { stiffness: 45, damping: 20 });
  const springY = useSpring(mouseY, { stiffness: 45, damping: 20 });

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);

    const handleMouseMove = (e) => {
      if (window.innerWidth >= 768) {
        const x = (e.clientX / window.innerWidth - 0.5) * 40;
        const y = (e.clientY / window.innerHeight - 0.5) * 40;
        mouseX.set(x);
        mouseY.set(y);
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => {
      window.removeEventListener("resize", checkMobile);
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, [mouseX, mouseY]);

  return (
    <div
      aria-hidden="true"
      className={`floating-shapes absolute inset-0 overflow-hidden pointer-events-none -z-0 ${className}`}
    >
      {/* 1. Pastel Blue Star (Top Left) */}
      <motion.div
        style={{
          x: isMobile ? 0 : springX,
          y: isMobile ? 0 : springY,
        }}
        animate={{
          y: [0, -18, 0],
          rotate: [0, 8, 0],
        }}
        transition={{
          duration: 7,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute top-12 left-[5%] w-24 h-24 sm:w-32 sm:h-32 opacity-75 dark:opacity-40"
      >
        <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-lg">
          <defs>
            <radialGradient id="blueClay" cx="35%" cy="30%" r="70%">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="30%" stopColor="#C8D8FE" />
              <stop offset="100%" stopColor="#6C8EF8" />
            </radialGradient>
          </defs>
          <path
            d="M50 8 C53 32, 68 47, 92 50 C68 53, 53 68, 50 92 C47 68, 32 53, 8 50 C32 47, 47 32, 50 8 Z"
            fill="url(#blueClay)"
          />
        </svg>
      </motion.div>

      {/* 2. Pastel Mint Rounded Cube (Top Right) */}
      <motion.div
        style={{
          x: isMobile ? 0 : useSpring(mouseX, { stiffness: 35, damping: 18 }),
          y: isMobile ? 0 : useSpring(mouseY, { stiffness: 35, damping: 18 }),
        }}
        animate={{
          y: [0, 20, 0],
          rotate: [0, -10, 0],
        }}
        transition={{
          duration: 8.5,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 0.8,
        }}
        className="absolute top-20 right-[7%] w-20 h-20 sm:w-28 sm:h-28 opacity-70 dark:opacity-35"
      >
        <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-lg">
          <defs>
            <radialGradient id="mintClay" cx="35%" cy="30%" r="70%">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="35%" stopColor="#B6F0E3" />
              <stop offset="100%" stopColor="#34D399" />
            </radialGradient>
          </defs>
          <rect
            x="15"
            y="15"
            width="70"
            height="70"
            rx="24"
            fill="url(#mintClay)"
            transform="rotate(15 50 50)"
          />
        </svg>
      </motion.div>

      {/* 3. Pastel Lavender Ring / Donut (Middle Left) */}
      <motion.div
        style={{
          x: isMobile ? 0 : useSpring(mouseX, { stiffness: 50, damping: 24 }),
          y: isMobile ? 0 : useSpring(mouseY, { stiffness: 50, damping: 24 }),
        }}
        animate={{
          y: [0, -14, 0],
          scale: [1, 1.04, 1],
        }}
        transition={{
          duration: 6.5,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1.5,
        }}
        className="absolute top-[48%] left-[2%] w-24 h-24 sm:w-32 sm:h-32 opacity-65 dark:opacity-35"
      >
        <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-lg">
          <defs>
            <radialGradient id="lavenderClay" cx="35%" cy="30%" r="70%">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="35%" stopColor="#DDD0FE" />
              <stop offset="100%" stopColor="#A78BFA" />
            </radialGradient>
          </defs>
          <circle cx="50" cy="50" r="38" fill="url(#lavenderClay)" />
          <circle cx="50" cy="50" r="16" fill="rgba(240, 244, 252, 0.95)" />
        </svg>
      </motion.div>

      {/* 4. Pastel Peach Pill (Bottom Right) */}
      <motion.div
        style={{
          x: isMobile ? 0 : useSpring(mouseX, { stiffness: 40, damping: 22 }),
          y: isMobile ? 0 : useSpring(mouseY, { stiffness: 40, damping: 22 }),
        }}
        animate={{
          y: [0, 16, 0],
          rotate: [0, 12, 0],
        }}
        transition={{
          duration: 7.8,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 2.2,
        }}
        className="absolute top-[65%] right-[4%] w-28 h-16 sm:w-36 sm:h-20 opacity-70 dark:opacity-35"
      >
        <svg viewBox="0 0 120 70" className="w-full h-full drop-shadow-lg">
          <defs>
            <radialGradient id="peachClay" cx="35%" cy="30%" r="70%">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="35%" stopColor="#FED7AA" />
              <stop offset="100%" stopColor="#FB923C" />
            </radialGradient>
          </defs>
          <rect
            x="10"
            y="10"
            width="100"
            height="50"
            rx="25"
            fill="url(#peachClay)"
            transform="rotate(-15 60 35)"
          />
        </svg>
      </motion.div>

      {/* 5. Pastel Butter Speech Cloud (Bottom Left) */}
      <motion.div
        style={{
          x: isMobile ? 0 : useSpring(mouseX, { stiffness: 30, damping: 16 }),
          y: isMobile ? 0 : useSpring(mouseY, { stiffness: 30, damping: 16 }),
        }}
        animate={{
          y: [0, -12, 0],
          scale: [1, 1.03, 1],
        }}
        transition={{
          duration: 9,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 0.5,
        }}
        className="absolute top-[82%] left-[8%] w-24 h-24 sm:w-32 sm:h-32 opacity-65 dark:opacity-30"
      >
        <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-lg">
          <defs>
            <radialGradient id="butterClay" cx="35%" cy="30%" r="70%">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="40%" stopColor="#FEF08A" />
              <stop offset="100%" stopColor="#FACC15" />
            </radialGradient>
          </defs>
          <path
            d="M50 15 C65 15, 80 26, 80 42 C80 52, 74 60, 64 65 L66 82 L50 72 C47 72, 44 72, 41 72 C25 72, 12 60, 12 42 C12 26, 28 15, 50 15 Z"
            fill="url(#butterClay)"
          />
        </svg>
      </motion.div>
    </div>
  );
}

export default FloatingShapes;
