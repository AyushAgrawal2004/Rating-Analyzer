/**
 * report.js - Analyzes classified reviews and generates the complete structured report.
 *
 * Computes:
 * 1. Headline KPIs + historical deltas
 * 2. Star distribution
 * 3. Complaint theme breakdown for 1-2 stars with 3 examples each
 * 4. Monthly trends (with low-confidence flag for <30 reviews)
 * 5. Version impact table (versions with 10+ reviews, sample size warning, worst recent version)
 * 6. Developer reply rates and engagement callouts
 * 7. Most upvoted low reviews
 * 8. Prioritized fix list with effort estimates and actions
 * 9. Data notes and sample bias disclaimers
 */

import { THEME_DEFINITIONS } from "../classifier/themes.js";
import { THEME_PRIORITIES } from "../config/priorities.js";

/**
 * Generate full analytics report for an app's collected reviews.
 *
 * @param {Object} params
 * @param {Array} params.reviews - Array of review documents
 * @param {Object} params.appInfo - App store metadata
 * @param {Object} [params.previousAnalysis] - Previous report for computing deltas
 * @param {Object} [params.parameters] - Run parameters
 * @returns {Object} Complete report data object
 */
export function generateReport({ reviews, appInfo, previousAnalysis = null, parameters = {} }) {
  if (!reviews || reviews.length === 0) {
    return {
      empty: true,
      headline: {
        storeRating: appInfo?.score || 0,
        totalStoreRatings: appInfo?.ratingsCount || 0,
        collectedCount: 0,
        averageScore: 0,
      },
    };
  }

  // Basic totals
  const totalReviews = reviews.length;
  const scores = reviews.map((r) => r.score);
  const avgScore = scores.reduce((a, b) => a + b, 0) / totalReviews;

  // Date boundaries
  const dates = reviews.map((r) => new Date(r.at).getTime()).filter((t) => !isNaN(t));
  const maxDateMs = dates.length ? Math.max(...dates) : Date.now();
  const minDateMs = dates.length ? Math.min(...dates) : Date.now();
  const latestDate = new Date(maxDateMs);
  const oldestDate = new Date(minDateMs);

  // Time window filters
  const msInDay = 86400000;
  const reviewsLast30 = reviews.filter((r) => maxDateMs - new Date(r.at).getTime() <= 30 * msInDay);
  const reviewsLast90 = reviews.filter((r) => maxDateMs - new Date(r.at).getTime() <= 90 * msInDay);

  const calcWindowStats = (windowReviews) => {
    if (!windowReviews.length) return { avgScore: null, count: 0, pctLow: 0 };
    const wScores = windowReviews.map((r) => r.score);
    const wAvg = wScores.reduce((a, b) => a + b, 0) / windowReviews.length;
    const wLow = windowReviews.filter((r) => r.score <= 2).length;
    return {
      avgScore: Math.round(wAvg * 100) / 100,
      count: windowReviews.length,
      pctLow: Math.round((wLow / windowReviews.length) * 1000) / 10,
    };
  };

  const last30 = calcWindowStats(reviewsLast30);
  const last90 = calcWindowStats(reviewsLast90);

  // Low rating reviews (1-2 stars)
  const lowReviews = reviews.filter((r) => r.score <= 2);
  const totalLow = lowReviews.length;
  const pctLow = Math.round((totalLow / totalReviews) * 1000) / 10;

  // Star Distribution
  const starCounts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  for (const s of scores) {
    if (starCounts[s] !== undefined) starCounts[s]++;
  }
  const starDistribution = [1, 2, 3, 4, 5].map((star) => ({
    star,
    count: starCounts[star],
    percentage: Math.round((starCounts[star] / totalReviews) * 1000) / 10,
  }));

  // Why people give 1-2 stars (Themes breakdown)
  const themeCounts = {};
  const themeExamples = {};

  for (const r of lowReviews) {
    const rThemes = Array.isArray(r.themes) && r.themes.length > 0 ? r.themes : ["other"];
    for (const t of rThemes) {
      themeCounts[t] = (themeCounts[t] || 0) + 1;
      if (!themeExamples[t]) themeExamples[t] = [];
      if (themeExamples[t].length < 3 && r.content && r.content.trim().length > 10) {
        themeExamples[t].push({
          reviewId: r.reviewId,
          userName: r.userName,
          score: r.score,
          version: r.version || "N/A",
          thumbsUpCount: r.thumbsUpCount || 0,
          at: r.at,
          content: r.content,
          replyContent: r.replyContent,
        });
      }
    }
  }

  const themesSummary = Object.entries(themeCounts)
    .map(([themeKey, count]) => {
      const def = THEME_DEFINITIONS[themeKey];
      const shareOfLow = totalLow > 0 ? Math.round((count / totalLow) * 1000) / 10 : 0;
      const shareOfAll = Math.round((count / totalReviews) * 1000) / 10;
      return {
        themeKey,
        label: def?.label || themeKey.replace(/_/g, " "),
        description: def?.description || "",
        count,
        shareOfLow,
        shareOfAll,
        examples: themeExamples[themeKey] || [],
      };
    })
    .sort((a, b) => b.count - a.count);

  // Monthly trend
  const monthMap = {};
  for (const r of reviews) {
    const d = new Date(r.at);
    if (isNaN(d.getTime())) continue;
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    if (!monthMap[key]) {
      monthMap[key] = { count: 0, sum: 0, lowCount: 0 };
    }
    monthMap[key].count++;
    monthMap[key].sum += r.score;
    if (r.score <= 2) monthMap[key].lowCount++;
  }

  const monthlyTrend = Object.keys(monthMap)
    .sort()
    .map((period) => {
      const m = monthMap[period];
      return {
        period,
        reviewCount: m.count,
        avgScore: Math.round((m.sum / m.count) * 100) / 100,
        pctLow: Math.round((m.lowCount / m.count) * 1000) / 10,
        isLowConfidence: m.count < 30,
      };
    });

  // Version Impact table (versions with 10+ reviews)
  const versionMap = {};
  for (const r of reviews) {
    const v = (r.version || "").trim();
    if (!v) continue;
    if (!versionMap[v]) {
      versionMap[v] = { count: 0, sum: 0, lowCount: 0, firstSeen: r.at, lastSeen: r.at };
    }
    versionMap[v].count++;
    versionMap[v].sum += r.score;
    if (r.score <= 2) versionMap[v].lowCount++;
    if (new Date(r.at) < new Date(versionMap[v].firstSeen)) versionMap[v].firstSeen = r.at;
    if (new Date(r.at) > new Date(versionMap[v].lastSeen)) versionMap[v].lastSeen = r.at;
  }

  const versionImpact = Object.entries(versionMap)
    .filter(([_, stats]) => stats.count >= 10)
    .map(([version, stats]) => ({
      version,
      reviewCount: stats.count,
      avgScore: Math.round((stats.sum / stats.count) * 100) / 100,
      pctLow: Math.round((stats.lowCount / stats.count) * 1000) / 10,
      firstSeen: stats.firstSeen,
      lastSeen: stats.lastSeen,
      isSmallSample: stats.count < 50,
    }))
    .sort((a, b) => new Date(b.firstSeen) - new Date(a.firstSeen));

  // Worst recent version highlight (from top 5 most recent versions with 10+ reviews)
  let worstRecentVersion = null;
  if (versionImpact.length > 0) {
    const candidateRecent = versionImpact.slice(0, 5);
    worstRecentVersion = [...candidateRecent].sort((a, b) => b.pctLow - a.pctLow)[0];
  }

  // Developer replies
  const repliedAll = reviews.filter((r) => r.replyContent && r.replyContent.trim().length > 0).length;
  const repliedLow = lowReviews.filter((r) => r.replyContent && r.replyContent.trim().length > 0).length;
  const overallReplyRate = Math.round((repliedAll / totalReviews) * 1000) / 10;
  const lowReplyRate = totalLow > 0 ? Math.round((repliedLow / totalLow) * 1000) / 10 : 0;

  let replyCallout = "";
  if (lowReplyRate >= 70) {
    replyCallout = `High responsiveness: developer replied to ${lowReplyRate}% of 1-2 star reviews, proactively addressing negative sentiment.`;
  } else if (lowReplyRate >= 35) {
    replyCallout = `Moderate responsiveness: developer replied to ${lowReplyRate}% of low ratings, leaving room to improve resolution speed.`;
  } else {
    replyCallout = `Significant engagement gap: only ${lowReplyRate}% of 1-2 star reviews received a developer reply. ${totalLow - repliedLow} frustrated users were left unanswered.`;
  }

  // Most upvoted low reviews
  const topLowReviews = [...lowReviews]
    .sort((a, b) => {
      if ((b.thumbsUpCount || 0) !== (a.thumbsUpCount || 0)) {
        return (b.thumbsUpCount || 0) - (a.thumbsUpCount || 0);
      }
      return new Date(b.at) - new Date(a.at);
    })
    .slice(0, 5)
    .map((r) => ({
      reviewId: r.reviewId,
      score: r.score,
      thumbsUpCount: r.thumbsUpCount || 0,
      version: r.version || "N/A",
      userName: r.userName || "User",
      at: r.at,
      content: r.content,
      themes: r.themes || [],
      replyContent: r.replyContent,
    }));

  // Priority Fixes (Ranked by: Share of Low Reviews * Severity Weight)
  const priorityFixes = themesSummary
    .filter((t) => t.themeKey !== "positive")
    .map((theme) => {
      const config = THEME_PRIORITIES[theme.themeKey] || {
        severityWeight: 1.0,
        effortEstimate: "Medium",
        suggestedAction: "Investigate review details and address recurring user complaints.",
      };
      const priorityScore = Math.round(theme.shareOfLow * config.severityWeight * 10) / 10;
      return {
        themeKey: theme.themeKey,
        label: theme.label,
        shareOfLow: theme.shareOfLow,
        count: theme.count,
        severityWeight: config.severityWeight,
        priorityScore,
        effortEstimate: config.effortEstimate,
        suggestedAction: config.suggestedAction,
      };
    })
    .sort((a, b) => b.priorityScore - a.priorityScore);

  // Label source counts
  let ruleCount = 0;
  let llmCount = 0;
  let seedCount = 0;
  for (const r of reviews) {
    if (r.themeSource === "llm") llmCount++;
    else if (r.themeSource === "seed") seedCount++;
    else ruleCount++;
  }

  // Deltas vs previous analysis
  let deltas = null;
  if (previousAnalysis && previousAnalysis.report?.headline) {
    const prev = previousAnalysis.report.headline;
    deltas = {
      avgScore: Math.round((avgScore - prev.collectedAverage) * 100) / 100,
      pctLow: Math.round((pctLow - prev.pctLow) * 10) / 10,
      storeRating: appInfo?.score && prev.storeRating ? Math.round((appInfo.score - prev.storeRating) * 100) / 100 : 0,
      lastAnalyzedAt: previousAnalysis.createdAt,
    };
  }

  return {
    appInfo: {
      appId: appInfo?.appId,
      title: appInfo?.title || "Android App",
      icon: appInfo?.icon || "",
      developer: appInfo?.developer || "",
      score: appInfo?.score || 0,
      ratingsCount: appInfo?.ratingsCount || 0,
      version: appInfo?.version || "Varies with device",
      genre: appInfo?.genre || "",
      url: appInfo?.url || "",
    },
    headline: {
      storeRating: appInfo?.score || 0,
      totalStoreRatings: appInfo?.ratingsCount || 0,
      collectedCount: totalReviews,
      collectedAverage: Math.round(avgScore * 100) / 100,
      pctLow,
      last30,
      last90,
      deltas,
    },
    starDistribution,
    whyLowThemes: {
      totalLowReviews: totalLow,
      note: "Percentages overlap as reviews can be tagged with multiple complaint themes.",
      themes: themesSummary,
    },
    monthlyTrend,
    versionImpact: {
      versions: versionImpact,
      worstRecentVersion,
      note: "Correlation does not imply causation. Releases may coincide with OS updates or server changes.",
    },
    developerReplies: {
      overallReplyRate,
      lowReplyRate,
      repliedAllCount: repliedAll,
      repliedLowCount: repliedLow,
      callout: replyCallout,
    },
    topLowReviews,
    priorityFixes: {
      note: "Formula: Priority Score = Share of 1-2★ Reviews × Severity Weight. Effort is an engineering estimate.",
      items: priorityFixes,
    },
    dataNotes: {
      sampleSize: totalReviews,
      dateRange: {
        from: oldestDate.toISOString(),
        to: latestDate.toISOString(),
      },
      sortUsed: parameters.sort || "newest",
      requestedCount: parameters.count || totalReviews,
      labelingBreakdown: {
        rule: ruleCount,
        llm: llmCount,
        seed: seedCount,
      },
      disclaimer:
        "Public Play Store reviews represent a self-selected sample of users who experienced strong friction or delight.",
    },
  };
}
