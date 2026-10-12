/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#EEF4FF",
          100: "#E0EBFF",
          200: "#C7D8FE",
          300: "#A4BEFD",
          400: "#7094FA",
          500: "#1F4FD8", // Primary Brand Blue
          600: "#1A43B8",
          700: "#153594",
          800: "#122A73",
          900: "#0F2156",
        },
        accent: {
          50: "#F0FDFA",
          100: "#CCFBF1",
          200: "#99F6E4",
          300: "#5EEAD4",
          400: "#2DD4BF",
          500: "#10B981", // Accent Emerald/Teal
          600: "#0D9488",
          700: "#0F766E",
        },
        clay: {
          blue: {
            light: "#E8EEFF",
            border: "#C8D7FE",
            text: "#1E3EB3",
            dark: "#1B244A",
            darkText: "#A5BDFC",
          },
          mint: {
            light: "#E4F9F4",
            border: "#B6F0E3",
            text: "#0D7A65",
            dark: "#12332A",
            darkText: "#6EE7B7",
          },
          lavender: {
            light: "#F3EEFF",
            border: "#DDD0FE",
            text: "#6327CD",
            dark: "#2A1E4A",
            darkText: "#C4B5FD",
          },
          peach: {
            light: "#FFF1EB",
            border: "#FED3C3",
            text: "#C2410C",
            dark: "#3B221B",
            darkText: "#FDBA74",
          },
          butter: {
            light: "#FEF9E7",
            border: "#FDE68A",
            text: "#A16207",
            dark: "#362F18",
            darkText: "#FDE047",
          },
          rose: {
            light: "#FFEBF2",
            border: "#FECDD3",
            text: "#BE123C",
            dark: "#3D1A27",
            darkText: "#FDA4AF",
          },
        },
        ink: {
          50: "#F8FAFC",
          100: "#F1F5F9",
          200: "#E2E8F0",
          300: "#CBD5E1",
          400: "#94A3B8",
          500: "#64748B",
          600: "#475569",
          700: "#334155",
          800: "#1E293B",
          900: "#0F172A", // Deep Slate Ink
          950: "#080D1A",
        },
        surface: {
          light: "#F0F4FC",
          card: "#FFFFFF",
          cardSubtle: "#F8FAFE",
          dark: "#0B1024",
          darkCard: "#141A38",
          darkCardSubtle: "#192144",
          darkBorder: "#232D54",
        },
        status: {
          success: "#16A34A",
          warning: "#F59E0B",
          danger: "#DC2626",
          info: "#0284C7",
        },
      },
      fontFamily: {
        sans: ["Plus Jakarta Sans", "Inter", "-apple-system", "BlinkMacSystemFont", "sans-serif"],
        display: ["Nunito", "Plus Jakarta Sans", "sans-serif"],
        heading: ["Nunito", "Plus Jakarta Sans", "sans-serif"],
      },
      borderRadius: {
        "clay-sm": "1rem", // 16px
        "clay-md": "1.5rem", // 24px
        "clay-lg": "2rem", // 32px
        "clay-xl": "2.5rem", // 40px
        pill: "9999px",
      },
      animation: {
        "float-slow": "floatSlow 6s ease-in-out infinite",
        "float-delayed": "floatSlow 7s ease-in-out 2s infinite",
        "pulse-subtle": "pulseSubtle 3s ease-in-out infinite",
        "shimmer-clay": "shimmerClay 2s linear infinite",
      },
      keyframes: {
        floatSlow: {
          "0%, 100%": { transform: "translateY(0px) rotate(0deg)" },
          "50%": { transform: "translateY(-12px) rotate(2deg)" },
        },
        pulseSubtle: {
          "0%, 100%": { opacity: 1, transform: "scale(1)" },
          "50%": { opacity: 0.9, transform: "scale(1.02)" },
        },
        shimmerClay: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
    },
  },
  plugins: [],
};
