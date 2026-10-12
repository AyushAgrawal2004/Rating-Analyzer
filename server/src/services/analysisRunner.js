/**
 * analysisRunner.js - Coordinates background analysis jobs:
 * 1. Fetching reviews from Play Store
 * 2. Rule-based tagging (themes.js)
 * 3. AI labeling (llm.js) if enabled
 * 4. Aggregating & building report (report.js)
 * 5. SSE progress broadcasting
 */

import { EventEmitter } from "events";
import { getAppInfo, fetchReviewsPaged } from "../scraper/playstore.js";
import { classifyText } from "../classifier/themes.js";
import { classifyReviewsWithLLM } from "../classifier/llm.js";
import { generateReport } from "../analysis/report.js";
import { App } from "../models/App.js";
import { Review } from "../models/Review.js";
import { Analysis } from "../models/Analysis.js";

export const analysisEvents = new EventEmitter();

// In-memory set of cancelled analysis IDs
const cancelledAnalyses = new Set();

export function cancelAnalysis(analysisId) {
  cancelledAnalyses.add(analysisId.toString());
}

/**
 * Emit SSE progress event to listeners.
 */
export function emitProgress(analysisId, data) {
  analysisEvents.emit(`progress:${analysisId}`, data);
}

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function broadcast(analysisId, status, progress, extra = {}) {
  emitProgress(analysisId, {
    status,
    progress,
    step: progress.step,
    current: progress.current,
    total: progress.total,
    message: progress.message,
    ...extra,
  });
}

/**
 * Executes full analysis pipeline in the background.
 *
 * @param {string} analysisId - Mongo document ID of the Analysis
 */
export async function runAnalysis(analysisId) {
  const analysis = await Analysis.findById(analysisId);
  if (!analysis) return;

  const { appId, parameters } = analysis;
  const { count = 500, sort = "newest", lang = "en", country = "in", useAI = false } = parameters;

  try {
    // Check cancellation
    if (cancelledAnalyses.has(analysisId.toString())) {
      analysis.status = "failed";
      analysis.error = "Analysis was canceled by user.";
      await analysis.save();
      emitProgress(analysisId, { status: "failed", error: analysis.error });
      return;
    }

    // Step 0: Fetch or update App Store metadata
    broadcast(analysisId, "fetching", {
      step: "Fetching",
      current: 0,
      total: count,
      message: `Loading App Store details for ${appId}...`,
    });

    let appDoc = await App.findOne({ appId });
    try {
      const appInfo = await getAppInfo(appId, lang, country);
      appDoc = await App.findOneAndUpdate(
        { appId },
        {
          ...appInfo,
          lastAnalyzedAt: new Date(),
        },
        { upsert: true, new: true }
      );
    } catch (appErr) {
      if (!appDoc) {
        throw appErr; // If not even cached in DB, fail
      }
      console.warn(`[Scraper] Could not refresh app info, using cached metadata: ${appErr.message}`);
    }

    // Step 1: Fetching reviews
    analysis.status = "fetching";
    analysis.progress = {
      step: "Fetching",
      current: 0,
      total: count,
      message: `Fetching up to ${count} reviews from Play Store...`,
    };
    await analysis.save();
    broadcast(analysisId, "fetching", analysis.progress);

    // Get existing review IDs in DB for incremental stops
    const existingReviews = await Review.find({ appId }, { reviewId: 1 }).lean();
    const existingIds = new Set(existingReviews.map((r) => r.reviewId));

    const { reviews: fetchedReviews } = await fetchReviewsPaged({
      appId,
      count,
      sort,
      lang,
      country,
      existingReviewIds: existingIds,
      onProgress: (current, total, message) => {
        analysis.progress = { step: "Fetching", current, total, message };
        broadcast(analysisId, "fetching", analysis.progress);
      },
    });

    if (cancelledAnalyses.has(analysisId.toString())) {
      throw new Error("Analysis was canceled by user.");
    }

    // Ensure user perceives Fetching station completing
    analysis.progress = {
      step: "Fetching",
      current: count,
      total: count,
      message: `Successfully collected review records.`,
    };
    broadcast(analysisId, "fetching", analysis.progress);
    await delay(350);

    // Step 2: Rule-based Tagging
    analysis.status = "tagging";
    const reviewsToTag = fetchedReviews.length > 0 ? fetchedReviews : await Review.find({ appId }).limit(count).lean();
    analysis.progress = {
      step: "Tagging",
      current: 0,
      total: reviewsToTag.length,
      message: `Applying rule-based complaint theme classifiers...`,
    };
    await analysis.save();
    broadcast(analysisId, "tagging", analysis.progress);

    const bulkOps = [];
    for (let i = 0; i < reviewsToTag.length; i++) {
      const r = reviewsToTag[i];
      const themes = classifyText(r.content, r.score);

      bulkOps.push({
        updateOne: {
          filter: { reviewId: r.reviewId },
          update: {
            $set: {
              appId: r.appId,
              userName: r.userName,
              score: r.score,
              content: r.content,
              thumbsUpCount: r.thumbsUpCount,
              version: r.version,
              at: r.at,
              replyContent: r.replyContent,
              repliedAt: r.repliedAt,
              themes,
              themeSource: "rule",
            },
          },
          upsert: true,
        },
      });

      if (i % 80 === 0 || i === reviewsToTag.length - 1) {
        analysis.progress = {
          step: "Tagging",
          current: i + 1,
          total: reviewsToTag.length,
          message: `Classified ${i + 1} / ${reviewsToTag.length} reviews`,
        };
        broadcast(analysisId, "tagging", analysis.progress);
      }
    }

    if (bulkOps.length > 0) {
      await Review.bulkWrite(bulkOps);
    }

    analysis.progress = {
      step: "Tagging",
      current: reviewsToTag.length,
      total: reviewsToTag.length,
      message: `Rule classification complete across 13 theme categories.`,
    };
    broadcast(analysisId, "tagging", analysis.progress);
    await delay(350);

    // Load active reviews from DB to form the analysis cohort
    let sortQuery = { at: -1 };
    if (sort === "helpful") sortQuery = { thumbsUpCount: -1, at: -1 };
    if (sort === "rating") sortQuery = { score: 1, at: -1 };

    let targetReviews = await Review.find({ appId })
      .sort(sortQuery)
      .limit(count)
      .lean();

    // Step 3: AI Labelling (if enabled)
    if (useAI && process.env.GEMINI_API_KEY) {
      analysis.status = "ai_labelling";
      analysis.progress = {
        step: "AI Labelling",
        current: 0,
        total: targetReviews.length,
        message: "Identifying ambiguous 1-2 star reviews for Gemini deep analysis...",
      };
      await analysis.save();
      broadcast(analysisId, "ai_labelling", analysis.progress);

      await classifyReviewsWithLLM(targetReviews, {
        onProgress: (current, total, message) => {
          analysis.progress = { step: "AI Labelling", current, total, message };
          broadcast(analysisId, "ai_labelling", analysis.progress);
        },
      });

      // Update any newly AI-labeled reviews in DB
      const aiUpdates = targetReviews
        .filter((r) => r.themeSource === "llm")
        .map((r) => ({
          updateOne: {
            filter: { reviewId: r.reviewId },
            update: {
              $set: {
                themes: r.themes,
                themeSource: "llm",
                llmReason: r.llmReason,
              },
            },
          },
        }));

      if (aiUpdates.length > 0) {
        await Review.bulkWrite(aiUpdates);
      }

      await delay(350);
    }

    // Step 4: Building Report
    analysis.status = "building_report";
    analysis.progress = {
      step: "Building Report",
      current: 75,
      total: 100,
      message: "Synthesizing KPIs, theme drivers, version impact, and fix priorities...",
    };
    await analysis.save();
    broadcast(analysisId, "building_report", analysis.progress);
    await delay(400);

    // Find previous completed analysis for delta comparison
    const previousAnalysis = await Analysis.findOne({
      appId,
      status: "completed",
      _id: { $ne: analysis._id },
    }).sort({ createdAt: -1 });

    const report = generateReport({
      reviews: targetReviews,
      appInfo: appDoc,
      previousAnalysis,
      parameters,
    });

    analysis.status = "completed";
    analysis.progress = {
      step: "Complete",
      current: count,
      total: count,
      message: "Report successfully generated.",
    };
    analysis.report = report;
    await analysis.save();

    broadcast(analysisId, "completed", analysis.progress, {
      analysisId: analysis._id,
      report,
    });
  } catch (err) {
    console.error(`[Analysis Error] Job ${analysisId} failed:`, err);
    analysis.status = "failed";
    analysis.error = err.message || "An unexpected error occurred during analysis.";
    await analysis.save();

    emitProgress(analysisId, {
      status: "failed",
      error: analysis.error,
    });
  } finally {
    cancelledAnalyses.delete(analysisId.toString());
  }
}
