import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Sparkles, Zap } from "lucide-react";
import { HeroCard } from "../components/home/HeroCard.jsx";
import { RecentAnalyses } from "../components/home/RecentAnalyses.jsx";
import { FloatingShapes, Mascot, ClayChip } from "../ui/index.js";
import { api } from "../api/client.js";

export function Home() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [recentAnalyses, setRecentAnalyses] = useState([]);

  // Fetch recent analyses for history display
  useEffect(() => {
    api
      .getAppAnalyses("com.moveinsync.ets")
      .then((res) => {
        if (res?.analyses) setRecentAnalyses(res.analyses);
      })
      .catch(() => {});
  }, []);

  const handleStartAnalysis = async (payload) => {
    setIsSubmitting(true);
    try {
      const res = await api.startAnalysis(payload);
      if (res.analysisId) {
        navigate(`/report/${res.analysisId}`);
      }
    } catch (err) {
      alert(`Could not start analysis: ${err.message}`);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative overflow-hidden py-10 sm:py-16">
      {/* 4-6 Clay Floating Geometric Shapes with Cursor Parallax */}
      <FloatingShapes />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Headline */}
        <div className="text-center max-w-2xl mx-auto mb-9 sm:mb-12">
          <div className="clay-sm inline-flex items-center gap-2 px-4 py-1.5 rounded-pill bg-white/90 dark:bg-surface-darkCard/90 text-brand-700 dark:text-brand-300 text-xs font-heading font-extrabold mb-5 shadow-sm">
            <Mascot mood="happy" size="sm" className="w-5 h-5 -my-1" />
            <span>Tactile Play Store Rating Diagnostics</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-heading font-black text-ink-900 dark:text-white tracking-tight leading-tight">
            How are your ratings,{" "}
            <span className="text-brand-500 underline decoration-accent-400 decoration-wavy decoration-3">
              and why?
            </span>
          </h1>

          <p className="mt-4 text-sm sm:text-base text-ink-600 dark:text-ink-300 leading-relaxed font-medium">
            Analyze any Android app to reveal store health, 1-2★ complaint drivers, release
            regressions, developer reply gaps, and an engineering fix list.
          </p>

          {/* Quick Pick Demo Pill Chip */}
          <div className="mt-5 flex items-center justify-center gap-2">
            <span className="text-xs font-heading font-bold text-ink-400">Quick Demo:</span>
            <ClayChip
              themeKey="positive"
              label="MoveInSync Commute (com.moveinsync.ets)"
              onClick={() => navigate("/explorer/com.moveinsync.ets")}
              className="text-xs py-1"
            />
          </div>
        </div>

        {/* Main Analysis Configuration Card */}
        <HeroCard onStartAnalysis={handleStartAnalysis} isSubmitting={isSubmitting} />

        {/* Historical Analyses List */}
        <RecentAnalyses analyses={recentAnalyses} />
      </div>
    </div>
  );
}

export default Home;
