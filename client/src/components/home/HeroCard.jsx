import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Sparkles, ChevronDown, ChevronUp, Star, ShieldAlert, ArrowRight } from "lucide-react";
import { api } from "../../api/client.js";
import {
  ClayCard,
  ClayButton,
  ClayInput,
  ClaySelect,
  ClaySegmented,
  ClayToggle,
} from "../../ui/index.js";
import { springs } from "../../motion/presets.js";

export function HeroCard({ onStartAnalysis, isSubmitting = false }) {
  const [inputVal, setInputVal] = useState("com.moveinsync.ets");
  const [appId, setAppId] = useState("com.moveinsync.ets");
  const [preview, setPreview] = useState(null);
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState(null);

  const [selectedSize, setSelectedSize] = useState(500);
  const [customCount, setCustomCount] = useState("");

  const [sort, setSort] = useState("newest");
  const [country, setCountry] = useState("in");
  const [lang, setLang] = useState("en");
  const [useAI, setUseAI] = useState(false);

  const [showAdvanced, setShowAdvanced] = useState(false);
  const [llmStatus, setLlmStatus] = useState({ hasKey: false, message: "" });

  // Extract package ID from URL or raw text
  const extractAppId = (text) => {
    if (!text) return "";
    const clean = text.trim();
    if (clean.includes("play.google.com")) {
      try {
        const url = new URL(clean);
        const idParam = url.searchParams.get("id");
        if (idParam) return idParam;
      } catch {
        const match = clean.match(/[?&]id=([a-zA-Z0-9_.]+)/);
        if (match) return match[1];
      }
    }
    return clean;
  };

  // Check LLM status on mount
  useEffect(() => {
    api
      .getLlmModels()
      .then((data) => setLlmStatus(data))
      .catch(() => setLlmStatus({ hasKey: false, message: "LLM unavailable" }));
  }, []);

  // Sync input value with extracted appId
  useEffect(() => {
    const extracted = extractAppId(inputVal);
    setAppId(extracted);
  }, [inputVal]);

  // Debounced app info fetch for live preview
  useEffect(() => {
    if (!appId || !/^[A-Za-z][A-Za-z0-9_]*(\.[A-Za-z0-9_]+)+$/.test(appId)) {
      setPreview(null);
      setPreviewError(null);
      return;
    }

    const timer = setTimeout(() => {
      setIsPreviewLoading(true);
      setPreviewError(null);
      api
        .getAppInfo(appId, lang, country)
        .then((res) => {
          setPreview(res.app);
          setIsPreviewLoading(false);
        })
        .catch((err) => {
          setPreview(null);
          setPreviewError(err.message || "App not found on Play Store");
          setIsPreviewLoading(false);
        });
    }, 380);

    return () => clearTimeout(timer);
  }, [appId, country, lang]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const finalCount =
      selectedSize === "custom" ? parseInt(customCount, 10) || 500 : selectedSize;

    onStartAnalysis({
      appId,
      count: Math.min(Math.max(finalCount, 10), 10000),
      sort,
      country,
      lang,
      useAI: useAI && llmStatus.hasKey,
    });
  };

  const sampleSizeOptions = [
    { label: "200", value: 200 },
    { label: "500", value: 500 },
    { label: "1,000", value: 1000 },
    { label: "2,000", value: 2000 },
    { label: "5,000", value: 5000 },
    { label: "Custom", value: "custom" },
  ];

  const sortOptions = [
    { label: "Newest First (Fast Incremental Refresh)", value: "newest" },
    { label: "Most Helpful First", value: "helpful" },
    { label: "Lowest Rating First (1★)", value: "rating" },
  ];

  const countryOptions = [
    { label: "India (in)", value: "in" },
    { label: "United States (us)", value: "us" },
    { label: "United Kingdom (gb)", value: "gb" },
    { label: "Canada (ca)", value: "ca" },
    { label: "Singapore (sg)", value: "sg" },
    { label: "United Arab Emirates (ae)", value: "ae" },
  ];

  const langOptions = [
    { label: "English (en)", value: "en" },
    { label: "Hindi (hi)", value: "hi" },
  ];

  return (
    <ClayCard
      radius="xl"
      className="w-full max-w-3xl mx-auto p-6 sm:p-9 shadow-2xl relative z-10"
    >
      <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-7">
        {/* Main Input: App ID or Play Store URL */}
        <div>
          <ClayInput
            label="Android App ID or Play Store URL"
            icon={Search}
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            onClear={() => setInputVal("")}
            placeholder="e.g. com.moveinsync.ets or paste https://play.google.com/..."
            required
          />
          {appId && appId !== inputVal && (
            <p className="text-xs text-brand-600 dark:text-brand-400 mt-2 ml-1 font-mono font-bold">
              Detected Package: <span className="underline">{appId}</span>
            </p>
          )}
        </div>

        {/* Live App Store Preview Card (Springy Pop-in) */}
        <AnimatePresence mode="wait">
          {isPreviewLoading && (
            <motion.div
              key="loading"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="clay-inset p-4 rounded-clay-md bg-surface-cardSubtle/60 flex items-center gap-3.5 animate-pulse-subtle"
            >
              <div className="w-13 h-13 rounded-2xl bg-ink-200 dark:bg-ink-800 shrink-0" />
              <div className="space-y-2 flex-1">
                <div className="h-4 bg-ink-200 dark:bg-ink-800 rounded-pill w-1/3" />
                <div className="h-3 bg-ink-100 dark:bg-ink-900 rounded-pill w-1/4" />
              </div>
            </motion.div>
          )}

          {preview && !isPreviewLoading && (
            <motion.div
              key="preview"
              initial={{ scale: 0.9, rotate: -1.5, opacity: 0 }}
              animate={{ scale: 1, rotate: 0, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={springs.bouncy}
              className="clay-sm p-4 sm:p-5 rounded-clay-md bg-clay-blue-light/80 dark:bg-clay-blue-dark/60 flex items-center gap-4"
            >
              {preview.icon ? (
                <motion.img
                  initial={{ scale: 0.7 }}
                  animate={{ scale: [1, 1.12, 1] }}
                  transition={{ duration: 0.45, delay: 0.1 }}
                  src={preview.icon}
                  alt={preview.title}
                  className="w-13 h-13 sm:w-14 sm:h-14 rounded-2xl shadow-md object-cover bg-white shrink-0"
                  onError={(e) => (e.target.style.display = "none")}
                />
              ) : (
                <div className="w-13 h-13 rounded-2xl bg-brand-500 text-white flex items-center justify-center font-heading font-extrabold text-xl shadow-md shrink-0">
                  {preview.title?.[0] || "A"}
                </div>
              )}

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm sm:text-base font-heading font-extrabold text-ink-900 dark:text-white truncate">
                    {preview.title}
                  </h4>
                  <span className="clay-sm text-[10px] font-heading font-extrabold px-2.5 py-0.5 rounded-pill bg-white dark:bg-surface-darkCard text-ink-600 dark:text-ink-300">
                    v{preview.version || "latest"}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-ink-600 dark:text-ink-300 mt-1 font-medium">
                  <span>{preview.developer}</span>
                  <span>•</span>
                  <span className="inline-flex items-center font-bold text-amber-600 dark:text-amber-400">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400 mr-1" />
                    {preview.score}★ ({preview.ratingsCount?.toLocaleString()} ratings)
                  </span>
                </div>
              </div>
            </motion.div>
          )}

          {previewError && !isPreviewLoading && (
            <motion.div
              key="error"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="clay-sm p-3.5 rounded-clay-md bg-amber-50 dark:bg-amber-950/40 text-xs font-semibold text-amber-800 dark:text-amber-200 flex items-center gap-2"
            >
              <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
              <span>{previewError} (Analysis can still proceed if package exists on store)</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Reviews Sample Size: Segmented Control */}
        <div>
          <label className="block text-xs uppercase font-heading font-extrabold tracking-wider text-ink-600 dark:text-ink-400 mb-2 ml-1">
            Reviews Sample Size
          </label>
          <div className="flex flex-wrap items-center gap-3">
            <ClaySegmented
              options={sampleSizeOptions}
              value={selectedSize}
              onChange={setSelectedSize}
              name="sample-size"
            />
          </div>

          {selectedSize === "custom" && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="mt-3 w-full sm:w-60"
            >
              <ClayInput
                type="number"
                min="10"
                max="10000"
                placeholder="Enter custom count (10 - 10,000)"
                value={customCount}
                onChange={(e) => setCustomCount(e.target.value)}
                required
              />
            </motion.div>
          )}
        </div>

        {/* Sort & Advanced Controls */}
        <div className="pt-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-end">
            <div>
              <ClaySelect
                label="Sort Order"
                options={sortOptions}
                value={sort}
                onChange={(e) => setSort(e.target.value)}
              />
            </div>

            <div className="flex justify-end pb-1">
              <button
                type="button"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="text-xs font-heading font-extrabold text-brand-600 dark:text-brand-400 inline-flex items-center gap-1.5 hover:underline py-1"
              >
                <span>{showAdvanced ? "Hide Advanced Options" : "Advanced Options"}</span>
                {showAdvanced ? (
                  <ChevronUp className="w-4 h-4 stroke-[2.5]" />
                ) : (
                  <ChevronDown className="w-4 h-4 stroke-[2.5]" />
                )}
              </button>
            </div>
          </div>

          {/* Advanced Section */}
          <AnimatePresence>
            {showAdvanced && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={springs.soft}
                className="overflow-hidden mt-4"
              >
                <div className="clay-inset p-4 sm:p-5 bg-surface-cardSubtle/60 dark:bg-surface-darkCard rounded-clay-md grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <ClaySelect
                    label="Store Country"
                    options={countryOptions}
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                  />
                  <ClaySelect
                    label="Store Language"
                    options={langOptions}
                    value={lang}
                    onChange={(e) => setLang(e.target.value)}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* AI Deep Analysis Toggle */}
        <div className="pt-4 border-t border-ink-100 dark:border-ink-800 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="clay-sm w-10 h-10 rounded-full bg-clay-lavender-light dark:bg-clay-lavender-dark text-brand-600 dark:text-brand-300 flex items-center justify-center shrink-0">
              <Sparkles className="w-5 h-5 stroke-[2.3]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs sm:text-sm font-heading font-extrabold text-ink-900 dark:text-white">
                  Deep Analysis with AI (Gemini)
                </span>
                {!llmStatus.hasKey && (
                  <span className="clay-sm text-[10px] font-heading font-extrabold px-2 py-0.5 rounded-pill bg-ink-200 dark:bg-ink-800 text-ink-600 dark:text-ink-400">
                    No Key in .env
                  </span>
                )}
              </div>
              <p className="text-[11px] text-ink-500 dark:text-ink-400 font-medium">
                Uses LLM to categorize ambiguous 1-2★ reviews rules could not explain
              </p>
            </div>
          </div>

          <ClayToggle
            checked={useAI && llmStatus.hasKey}
            onChange={setUseAI}
            disabled={!llmStatus.hasKey}
          />
        </div>

        {/* Primary Analyse Button (Puffy & Squishy) */}
        <div className="pt-2">
          <ClayButton
            type="submit"
            variant="primary"
            size="lg"
            isLoading={isSubmitting}
            disabled={!appId}
            className="w-full text-base py-4 shadow-xl"
          >
            <span>Analyse Ratings &amp; Themes</span>
            <ArrowRight className="w-5 h-5 stroke-[2.5]" />
          </ClayButton>
        </div>
      </form>
    </ClayCard>
  );
}

export default HeroCard;
