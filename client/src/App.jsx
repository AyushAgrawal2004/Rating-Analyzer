import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Header } from "./components/common/Header.jsx";
import { Home } from "./pages/Home.jsx";
import { ReportPage } from "./pages/ReportPage.jsx";
import { ReviewsExplorer } from "./pages/ReviewsExplorer.jsx";

export function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen flex flex-col bg-clay-mesh text-ink-900 dark:text-ink-100 font-sans transition-colors duration-300 relative selection:bg-brand-500 selection:text-white">
        <Header />
        <main className="flex-1 relative z-10">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/report/:id" element={<ReportPage />} />
            <Route path="/explorer/:appId" element={<ReviewsExplorer />} />
          </Routes>
        </main>
        <footer className="py-8 text-center text-xs text-ink-500 no-print transition-colors relative z-10">
          <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
            <span className="font-heading font-bold text-ink-700 dark:text-ink-300">
              Rating Insights — Play Store Sentiment Diagnostics
            </span>
            <span className="text-ink-400 dark:text-ink-500">
              Tactile Soft 3D UI • Built with Node.js, Express, React, Tailwind &amp; MongoDB
            </span>
          </div>
        </footer>
      </div>
    </BrowserRouter>
  );
}

export default App;
