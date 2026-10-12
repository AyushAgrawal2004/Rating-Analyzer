import React, { useState, useEffect } from "react";
import { useParams, useSearchParams, Link, useNavigate } from "react-router-dom";
import {
  Search,
  Filter,
  Star,
  ThumbsUp,
  MessageSquare,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  RefreshCw,
  ArrowLeft,
  Sparkles,
  SlidersHorizontal,
  RotateCcw,
} from "lucide-react";
import { api } from "../api/client.js";
import { ALL_THEME_KEYS, THEME_DEFINITIONS } from "../../../server/src/classifier/themes.js";
import {
  ClayCard,
  ClayButton,
  ClayInput,
  ClaySelect,
  ClayChip,
  ClayTooltip,
} from "../ui/index.js";

export function ReviewsExplorer() {
  const { appId = "com.moveinsync.ets" } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const [reviews, setReviews] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 1 });
  const [availableVersions, setAvailableVersions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filter States
  const [query, setQuery] = useState("");
  const [scoreFilter, setScoreFilter] = useState("all");
  const [themeFilter, setThemeFilter] = useState(searchParams.get("theme") || "all");
  const [sourceFilter, setSourceFilter] = useState(searchParams.get("source") || "all");
  const [versionFilter, setVersionFilter] = useState("all");
  const [sortOrder, setSortOrder] = useState("newest");
  const [repliedFilter, setRepliedFilter] = useState("all");

  const page = parseInt(searchParams.get("page") || "1", 10);

  // Keep themeFilter in sync if URL query parameter changes
  useEffect(() => {
    const urlTheme = searchParams.get("theme");
    if (urlTheme) setThemeFilter(urlTheme);
  }, [searchParams]);

  // Fetch reviews with current filters
  const fetchReviews = () => {
    setIsLoading(true);
    const params = {
      appId,
      page,
      limit: 20,
      sort: sortOrder,
      score: scoreFilter !== "all" ? scoreFilter : undefined,
      theme: themeFilter !== "all" ? themeFilter : undefined,
      themeSource: sourceFilter !== "all" ? sourceFilter : undefined,
      version: versionFilter !== "all" ? versionFilter : undefined,
      q: query.trim() || undefined,
      replied: repliedFilter !== "all" ? repliedFilter : undefined,
    };

    api
      .getReviews(params)
      .then((data) => {
        setReviews(data.reviews || []);
        setPagination(data.pagination || { page: 1, limit: 20, total: 0, totalPages: 1 });
        if (data.availableVersions?.length > 0) {
          setAvailableVersions(data.availableVersions);
        }
        setIsLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load reviews:", err);
        setIsLoading(false);
      });
  };

  useEffect(() => {
    fetchReviews();
  }, [appId, page, sortOrder, scoreFilter, themeFilter, sourceFilter, versionFilter, repliedFilter]);

  // Handle Search Input submit / debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchReviews();
    }, 350);
    return () => clearTimeout(timer);
  }, [query]);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      searchParams.set("page", String(newPage));
      setSearchParams(searchParams);
    }
  };

  const clearFilters = () => {
    setQuery("");
    setScoreFilter("all");
    setThemeFilter("all");
    setSourceFilter("all");
    setVersionFilter("all");
    setRepliedFilter("all");
    setSortOrder("newest");
    searchParams.delete("theme");
    searchParams.delete("source");
    searchParams.set("page", "1");
    setSearchParams(searchParams);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Breadcrumb & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs text-ink-500 font-medium mb-1.5">
            <Link
              to="/"
              className="hover:text-brand-600 dark:hover:text-brand-400 flex items-center space-x-1 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5 stroke-[2.2]" />
              <span>Back to Home</span>
            </Link>
            <span>/</span>
            <span className="font-mono font-bold text-brand-600 dark:text-brand-400">{appId}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-heading font-black text-ink-900 dark:text-white">
            Reviews Explorer
          </h1>
          <p className="text-xs sm:text-sm text-ink-500 font-medium mt-0.5">
            Search, filter, and inspect granular sentiment feedback across all records
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <ClayButton
            onClick={fetchReviews}
            variant="secondary"
            size="sm"
            icon={RefreshCw}
            isLoading={isLoading}
          >
            Refresh
          </ClayButton>
        </div>
      </div>

      {/* Filter Toolbar inside ClayCard */}
      <ClayCard className="p-5 sm:p-6 shadow-clay-sm space-y-5">
        <div className="flex items-center space-x-2 pb-1 border-b border-ink-100/80 dark:border-ink-800/60">
          <SlidersHorizontal className="w-4 h-4 text-brand-500 stroke-[2.2]" />
          <h3 className="text-xs font-heading font-extrabold uppercase tracking-wider text-ink-700 dark:text-ink-300">
            Interactive Filters &amp; Sorting
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Keyword Search */}
          <div>
            <ClayInput
              placeholder="Search keyword in reviews..."
              icon={Search}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onClear={() => setQuery("")}
            />
          </div>

          {/* Star Rating Filter */}
          <div>
            <ClaySelect
              value={scoreFilter}
              onChange={(e) => setScoreFilter(e.target.value)}
            >
              <option value="all">All Stars (1 - 5★)</option>
              <option value="low">1-2★ Negative Only</option>
              <option value="1">1 Star Only</option>
              <option value="2">2 Stars Only</option>
              <option value="3">3 Stars Only</option>
              <option value="4">4 Stars Only</option>
              <option value="5">5 Stars Only</option>
              <option value="high">4-5★ Positive Only</option>
            </ClaySelect>
          </div>

          {/* Theme Filter */}
          <div>
            <ClaySelect
              value={themeFilter}
              onChange={(e) => {
                setThemeFilter(e.target.value);
                if (e.target.value === "all") searchParams.delete("theme");
                else searchParams.set("theme", e.target.value);
                setSearchParams(searchParams);
              }}
            >
              <option value="all">All Themes</option>
              <option value="positive">Positive (4-5★)</option>
              {ALL_THEME_KEYS.map((t) => (
                <option key={t} value={t}>
                  {THEME_DEFINITIONS[t]?.label || t.replace(/_/g, " ")}
                </option>
              ))}
            </ClaySelect>
          </div>

          {/* Sort Order */}
          <div>
            <ClaySelect
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
            >
              <option value="newest">Sort: Newest First</option>
              <option value="oldest">Sort: Oldest First</option>
              <option value="most_helpful">Sort: Most Upvoted (Helpful)</option>
              <option value="lowest_rating">Sort: Lowest Rating (1★)</option>
              <option value="highest_rating">Sort: Highest Rating (5★)</option>
            </ClaySelect>
          </div>
        </div>

        {/* Second Row: App Version, Developer Reply, Source, Clear */}
        <div className="flex flex-wrap items-center justify-between pt-4 border-t border-ink-100/80 dark:border-ink-800/60 gap-4">
          <div className="flex flex-wrap items-center gap-3">
            {availableVersions.length > 0 && (
              <div className="flex items-center space-x-2">
                <span className="text-xs text-ink-500 font-heading font-bold">Version:</span>
                <select
                  value={versionFilter}
                  onChange={(e) => setVersionFilter(e.target.value)}
                  className="px-3 py-1.5 text-xs rounded-full bg-surface-cardSubtle dark:bg-surface-darkCardSubtle border border-ink-200/60 dark:border-ink-700/60 text-ink-800 dark:text-ink-200 font-mono font-semibold"
                >
                  <option value="all">All Versions</option>
                  {availableVersions.map((v) => (
                    <option key={v} value={v}>
                      v{v}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="flex items-center space-x-2">
              <span className="text-xs text-ink-500 font-heading font-bold">Reply:</span>
              <select
                value={repliedFilter}
                onChange={(e) => setRepliedFilter(e.target.value)}
                className="px-3 py-1.5 text-xs rounded-full bg-surface-cardSubtle dark:bg-surface-darkCardSubtle border border-ink-200/60 dark:border-ink-700/60 text-ink-800 dark:text-ink-200 font-semibold"
              >
                <option value="all">All</option>
                <option value="true">Replied Only</option>
                <option value="false">Unanswered Only</option>
              </select>
            </div>

            <div className="flex items-center space-x-2">
              <span className="text-xs text-ink-500 font-heading font-bold">Engine:</span>
              <select
                value={sourceFilter}
                onChange={(e) => {
                  setSourceFilter(e.target.value);
                  if (e.target.value === "all") searchParams.delete("source");
                  else searchParams.set("source", e.target.value);
                  setSearchParams(searchParams);
                }}
                className="px-3 py-1.5 text-xs rounded-full bg-surface-cardSubtle dark:bg-surface-darkCardSubtle border border-ink-200/60 dark:border-ink-700/60 text-ink-800 dark:text-ink-200 font-semibold"
              >
                <option value="all">All Sources</option>
                <option value="llm">AI Labeled (Gemini)</option>
                <option value="rule">Rule Classifier</option>
              </select>
            </div>
          </div>

          <div className="flex items-center space-x-4 text-xs text-ink-500">
            <span>
              Showing{" "}
              <strong className="text-ink-900 dark:text-white font-heading font-extrabold tabular-nums">
                {reviews.length}
              </strong>{" "}
              of{" "}
              <strong className="text-ink-900 dark:text-white font-heading font-extrabold tabular-nums">
                {pagination.total?.toLocaleString()}
              </strong>{" "}
              reviews
            </span>
            <button
              onClick={clearFilters}
              className="text-brand-600 dark:text-brand-400 hover:underline font-heading font-bold inline-flex items-center space-x-1 cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset Filters</span>
            </button>
          </div>
        </div>
      </ClayCard>

      {/* Reviews Table inside ClayCard */}
      <ClayCard className="p-0 overflow-hidden shadow-clay">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm border-collapse">
            <thead>
              <tr className="bg-surface-cardSubtle/80 dark:bg-surface-darkCardSubtle/80 border-b border-ink-100 dark:border-ink-800/80 text-ink-500 dark:text-ink-400 font-heading font-extrabold uppercase tracking-wider text-[11px]">
                <th className="py-3.5 px-4 w-24">Score</th>
                <th className="py-3.5 px-4 w-44">User &amp; Date</th>
                <th className="py-3.5 px-4 min-w-[280px]">Review Content</th>
                <th className="py-3.5 px-4 w-52">Themes Tagged</th>
                <th className="py-3.5 px-4 w-24">Version</th>
                <th className="py-3.5 px-4 w-24 text-right">Helpful</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-100/70 dark:divide-ink-800/40">
              {isLoading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="py-4 px-4">
                      <div className="h-5 bg-ink-200/60 dark:bg-ink-800 rounded-full w-14" />
                    </td>
                    <td className="py-4 px-4">
                      <div className="h-4 bg-ink-200/60 dark:bg-ink-800 rounded-lg w-28 mb-1.5" />
                      <div className="h-3 bg-ink-100 dark:bg-ink-900 rounded-md w-16" />
                    </td>
                    <td className="py-4 px-4">
                      <div className="h-4 bg-ink-200/60 dark:bg-ink-800 rounded-lg w-3/4 mb-1.5" />
                      <div className="h-3 bg-ink-100 dark:bg-ink-900 rounded-md w-1/2" />
                    </td>
                    <td className="py-4 px-4">
                      <div className="h-6 bg-ink-200/60 dark:bg-ink-800 rounded-full w-24" />
                    </td>
                    <td className="py-4 px-4">
                      <div className="h-4 bg-ink-200/60 dark:bg-ink-800 rounded-md w-12" />
                    </td>
                    <td className="py-4 px-4">
                      <div className="h-4 bg-ink-200/60 dark:bg-ink-800 rounded-md w-8 ml-auto" />
                    </td>
                  </tr>
                ))
              ) : reviews.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-14 text-center text-ink-500 font-medium">
                    No reviews found matching the current search filters.
                  </td>
                </tr>
              ) : (
                reviews.map((r) => (
                  <tr
                    key={r.reviewId}
                    className="hover:bg-surface-cardSubtle/60 dark:hover:bg-surface-darkCardSubtle/40 transition-colors"
                  >
                    {/* Score */}
                    <td className="py-4 px-4 font-heading font-black align-top">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-xl text-xs font-heading font-extrabold shadow-clay-sm ${
                          r.score <= 2
                            ? "bg-pastel-rose text-status-danger border border-status-danger/20"
                            : r.score >= 4
                            ? "bg-pastel-mint text-status-success border border-status-success/20"
                            : "bg-pastel-butter text-status-warning border border-status-warning/20"
                        }`}
                      >
                        <Star className="w-3.5 h-3.5 fill-current mr-1" />
                        {r.score}★
                      </span>
                    </td>

                    {/* User & Date */}
                    <td className="py-4 px-4 align-top">
                      <div className="font-heading font-bold text-ink-900 dark:text-white truncate max-w-[150px]">
                        {r.userName}
                      </div>
                      <div className="text-[11px] text-ink-400 font-medium mt-0.5">
                        {r.at ? new Date(r.at).toLocaleDateString() : "—"}
                      </div>
                    </td>

                    {/* Content & Developer Reply */}
                    <td className="py-4 px-4 align-top space-y-2">
                      <p className="text-xs sm:text-sm text-ink-800 dark:text-ink-200 leading-relaxed font-medium">
                        {r.content || <span className="text-ink-400 italic">(No review text provided)</span>}
                      </p>

                      {r.replyContent && (
                        <div className="p-3 rounded-2xl bg-pastel-mint/40 dark:bg-emerald-950/25 border border-status-success/20 text-xs text-ink-800 dark:text-emerald-200 shadow-clay-sm">
                          <div className="font-heading font-extrabold flex items-center space-x-1.5 text-[11px] text-status-success mb-1">
                            <MessageSquare className="w-3.5 h-3.5 stroke-[2.2]" />
                            <span>Developer Reply</span>
                          </div>
                          <p className="italic text-ink-700 dark:text-emerald-100 font-medium">{r.replyContent}</p>
                        </div>
                      )}

                      {r.themeSource === "llm" && r.llmReason && (
                        <div className="p-2.5 rounded-2xl bg-pastel-lavender/50 dark:bg-purple-950/30 border border-purple-500/20 text-[11px] text-purple-900 dark:text-purple-200 flex items-start space-x-2 shadow-clay-sm">
                          <Sparkles className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                          <span>
                            <strong className="font-heading font-bold">Gemini AI Reasoning:</strong> {r.llmReason}
                          </span>
                        </div>
                      )}
                    </td>

                    {/* Themes Tagged */}
                    <td className="py-4 px-4 align-top">
                      <div className="flex flex-wrap gap-1.5">
                        {(r.themes || []).map((t) => (
                          <ClayChip
                            key={t}
                            themeKey={t}
                            label={t.replace(/_/g, " ")}
                            size="sm"
                            clickable={true}
                            onClick={() => {
                              setThemeFilter(t);
                              searchParams.set("theme", t);
                              setSearchParams(searchParams);
                            }}
                          />
                        ))}
                        {r.themeSource === "llm" && (
                          <span
                            className="inline-flex items-center space-x-1 text-[9px] font-heading font-black px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 border border-purple-400/30 shadow-clay-sm"
                            title={r.llmReason || "Classified with Gemini"}
                          >
                            <Sparkles className="w-2.5 h-2.5 text-purple-600 dark:text-purple-400" />
                            <span>AI</span>
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Version */}
                    <td className="py-4 px-4 align-top font-mono font-bold text-xs text-ink-600 dark:text-ink-400">
                      {r.version ? (
                        <span className="px-2 py-0.5 rounded-lg bg-surface-cardSubtle dark:bg-surface-darkCardSubtle border border-ink-200/50 dark:border-ink-700/50">
                          v{r.version}
                        </span>
                      ) : (
                        "—"
                      )}
                    </td>

                    {/* Helpful upvotes */}
                    <td className="py-4 px-4 align-top text-right font-mono text-xs text-ink-500 tabular-nums">
                      {r.thumbsUpCount > 0 ? (
                        <span className="inline-flex items-center text-brand-600 dark:text-brand-400 font-heading font-extrabold px-2 py-0.5 rounded-full bg-pastel-blue/80 dark:bg-brand-950/60 shadow-clay-sm border border-brand-500/20">
                          <ThumbsUp className="w-3 h-3 mr-1 stroke-[2.2]" />
                          {r.thumbsUpCount}
                        </span>
                      ) : (
                        "—"
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="p-4 border-t border-ink-100 dark:border-ink-800 flex items-center justify-between bg-surface-cardSubtle/80 dark:bg-surface-darkCardSubtle/80">
          <span className="text-xs text-ink-500 font-medium">
            Page <strong className="text-ink-900 dark:text-white font-heading font-extrabold tabular-nums">{pagination.page}</strong> of{" "}
            <strong className="text-ink-900 dark:text-white font-heading font-extrabold tabular-nums">{pagination.totalPages}</strong>
          </span>

          <div className="flex items-center space-x-2">
            <ClayButton
              onClick={() => handlePageChange(pagination.page - 1)}
              disabled={pagination.page <= 1}
              variant="secondary"
              size="sm"
              icon={ChevronLeft}
            >
              Previous
            </ClayButton>
            <ClayButton
              onClick={() => handlePageChange(pagination.page + 1)}
              disabled={pagination.page >= pagination.totalPages}
              variant="secondary"
              size="sm"
            >
              <span>Next</span>
              <ChevronRight className="w-4 h-4 ml-1 stroke-[2.2]" />
            </ClayButton>
          </div>
        </div>
      </ClayCard>
    </div>
  );
}

export default ReviewsExplorer;

