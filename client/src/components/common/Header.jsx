import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { DarkModeToggle } from "./DarkModeToggle.jsx";
import { BarChart3, Search, Sparkles } from "lucide-react";
import { ClayButton } from "../../ui/ClayButton.jsx";

export function Header() {
  const navigate = useNavigate();

  return (
    <header className="sticky top-2 z-40 px-3 sm:px-6 transition-all no-print">
      <div className="clay max-w-7xl mx-auto rounded-pill px-4 sm:px-6 h-16 flex items-center justify-between bg-white/95 dark:bg-surface-darkCard/95 backdrop-blur-sm">
        {/* Brand / Logo */}
        <div className="flex items-center space-x-3">
          <Link to="/" className="flex items-center space-x-3 group">
            {/* Logo Slot: leave clearly marked slot for custom logo asset */}
            <div className="clay-sm w-10 h-10 rounded-full bg-gradient-to-br from-brand-500 to-brand-600 flex items-center justify-center text-white shrink-0 group-hover:scale-105 transition-transform">
              {/* [LOGO SLOT: Replace with <img src="/logo.svg" alt="MoveInSync Logo" /> if provided] */}
              <BarChart3 className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-heading font-extrabold text-lg sm:text-xl text-ink-900 dark:text-white tracking-tight">
                  Rating Insights
                </span>
                <span className="clay-sm text-[10px] uppercase font-heading font-extrabold px-2 py-0.5 rounded-pill bg-clay-blue-light text-brand-600 dark:bg-clay-blue-dark dark:text-clay-blue-darkText">
                  Play Store
                </span>
              </div>
              <p className="text-[11px] text-ink-500 dark:text-ink-400 hidden sm:block font-medium">
                Executive Health &amp; Root-Cause Diagnostics
              </p>
            </div>
          </Link>
        </div>

        {/* Navigation & Actions */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          <Link to="/explorer/com.moveinsync.ets" className="hidden md:inline-flex">
            <ClayButton variant="ghost" size="sm" icon={Search}>
              Reviews Explorer
            </ClayButton>
          </Link>

          <ClayButton
            variant="secondary"
            size="sm"
            onClick={() => navigate("/?demo=true")}
            className="text-brand-600 dark:text-brand-300"
          >
            <Sparkles className="w-3.5 h-3.5 text-accent-500 stroke-[2.5]" />
            <span>Demo App</span>
          </ClayButton>

          <div className="h-6 w-[2px] bg-ink-200 dark:bg-ink-700/60 hidden sm:block mx-1" />

          <DarkModeToggle />
        </div>
      </div>
    </header>
  );
}

export default Header;
