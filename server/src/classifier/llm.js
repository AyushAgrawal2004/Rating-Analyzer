/**
 * llm.js - Second pass: optional Gemini model labeling for 1-2 star reviews
 * that keyword rules could not explain (other / no_detail).
 *
 * Uses @google/genai SDK with exponential backoff, MongoDB caching,
 * and fail-fast 404 model checking.
 */

import { GoogleGenAI } from "@google/genai";
import { ALL_THEME_KEYS } from "./themes.js";
import { LlmCache } from "../models/LlmCache.js";

const DEFAULT_MODEL = process.env.GEMINI_MODEL || "gemini-3.5-flash-lite";

const PROMPT_TEMPLATE = `You label Play Store reviews of an employee commute app (employees book office cabs/shuttles, get a pickup time, track the vehicle, verify with OTP, and raise issues to support).
Reviews may be English, Hindi, or mixed Hinglish.

For each review, choose 1-3 themes from this exact list:
{{themes}}

Theme meanings:
- update_regression: complaint about a new version/update making things worse
- app_crash_wont_open: crashes, freezes, won't open, loading forever
- login_access: cannot log in, account/verification problems
- booking_failure: cannot book/schedule, waitlist, slot or roster problems
- late_or_no_cab: cab late, did not arrive, trip cancelled, driver issues
- eta_tracking: wrong ETA, wrong live location, GPS/map problems
- routing_pooling: bad routes, long detours, pooling too many people
- safety: safety, SOS, women's safety, seatbelt, unsafe driving
- ux_friction: confusing or annoying UI, too many steps, forced actions
- support_grievance: support did not respond, complaints not resolved
- notifications: missing or wrong notifications
- other: a real complaint that fits none of the above
- no_detail: negative but gives no reason (e.g. "worst app")

Return ONLY a JSON array, one object per review, in this form:
[{"id": 1, "themes": ["eta_tracking"], "reason": "5-10 word summary"}]

Reviews:
{{reviews}}`;

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * List models accessible to the current API key.
 *
 * @param {string} apiKey
 * @returns {Promise<string[]>}
 */
export async function listAvailableModels(apiKey = process.env.GEMINI_API_KEY) {
  if (!apiKey) {
    return [];
  }
  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${encodeURIComponent(apiKey)}`
    );
    if (!res.ok) {
      throw new Error(`Google API returned HTTP ${res.status}`);
    }
    const data = await res.json();
    const models = (data.models || [])
      .filter((m) => m.supportedGenerationMethods?.includes("generateContent"))
      .map((m) => m.name.replace(/^models\//, ""));
    return models;
  } catch (err) {
    console.warn("[LLM Models List Error]:", err.message);
    return [process.env.GEMINI_MODEL || "gemini-2.5-flash", "gemini-1.5-flash"];
  }
}

/**
 * Batch calls Gemini with retries and exponential backoff.
 */
async function callGeminiBatch(ai, model, batch, retries = 3) {
  const reviewsText = batch
    .map((item, idx) => `${idx + 1}. "${(item.content || "").slice(0, 500).replace(/"/g, '\\"')}"`)
    .join("\n");

  const prompt = PROMPT_TEMPLATE.replace("{{themes}}", ALL_THEME_KEYS.join(", ")).replace("{{reviews}}", reviewsText);

  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          temperature: 0,
        },
      });

      const text = response.text || "[]";
      const parsed = JSON.parse(text);
      const resultMap = new Map();

      if (Array.isArray(parsed)) {
        for (const item of parsed) {
          if (item && item.id) {
            const validThemes = (item.themes || []).filter((t) => ALL_THEME_KEYS.includes(t));
            resultMap.set(item.id, {
              themes: validThemes.length > 0 ? validThemes : ["other"],
              reason: item.reason || "",
            });
          }
        }
      }
      return resultMap;
    } catch (err) {
      const msg = err.message || "";
      if (msg.includes("404") || msg.includes("NOT_FOUND")) {
        throw new Error(
          `Gemini model '${model}' was not found (404). Please verify GEMINI_MODEL or select an available model via /api/llm/models.`
        );
      }

      if ((msg.includes("429") || msg.includes("503")) && model !== "gemini-3.5-flash-lite") {
        console.warn(`[LLM Batch] Model ${model} encountered error (${msg.slice(0, 80)}). Falling back to gemini-3.5-flash-lite...`);
        model = "gemini-3.5-flash-lite";
        continue;
      }

      const waitMs = 2000 * Math.pow(2, attempt);
      console.warn(`[LLM Batch] Attempt ${attempt + 1} failed (${msg}). Retrying in ${waitMs}ms...`);
      if (attempt === retries - 1) {
        console.error(`[LLM Batch] Exhausted retries for batch.`);
        return new Map();
      }
      await delay(waitMs);
    }
  }

  return new Map();
}

/**
 * Labels unclassified low-rating reviews using Gemini with caching.
 *
 * @param {Array} reviews - List of review objects
 * @param {Object} options - Options
 * @param {Function} [options.onProgress] - Progress callback
 * @returns {Promise<{ labeledCount: number, cacheHits: number }>}
 */
export async function classifyReviewsWithLLM(reviews, options = {}) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.log("[LLM Classifier] GEMINI_API_KEY is not configured; skipping AI labelling pass.");
    return { labeledCount: 0, cacheHits: 0, skipped: true };
  }

  const model = process.env.GEMINI_MODEL || DEFAULT_MODEL;
  const ai = new GoogleGenAI({ apiKey });
  const onProgress = options.onProgress || (() => {});

  // Identify candidate reviews: 1-2 stars with other or no_detail
  const targetCandidates = reviews.filter(
    (r) =>
      r.score <= 2 &&
      r.themes &&
      (r.themes.includes("other") || r.themes.includes("no_detail") || r.themes.length === 0)
  );

  if (targetCandidates.length === 0) {
    return { labeledCount: 0, cacheHits: 0 };
  }

  // Check cache first in MongoDB
  const candidateIds = targetCandidates.map((r) => r.reviewId);
  const cachedEntries = await LlmCache.find({ reviewId: { $in: candidateIds } });
  const cacheMap = new Map();
  for (const entry of cachedEntries) {
    cacheMap.set(entry.reviewId, entry);
  }

  let cacheHits = 0;
  const toSend = [];

  for (const review of targetCandidates) {
    if (cacheMap.has(review.reviewId)) {
      const cached = cacheMap.get(review.reviewId);
      review.themes = cached.themes;
      review.themeSource = "llm";
      review.llmReason = cached.reason;
      cacheHits++;
    } else {
      toSend.push(review);
    }
  }

  console.log(
    `[LLM Classifier] Candidates: ${targetCandidates.length}, Cache hits: ${cacheHits}, To process via API: ${toSend.length}`
  );

  const batchSize = 20;
  let processed = 0;

  for (let i = 0; i < toSend.length; i += batchSize) {
    const batch = toSend.slice(i, i + batchSize);
    onProgress(
      cacheHits + processed,
      targetCandidates.length,
      `AI labeling: ${cacheHits + processed} / ${targetCandidates.length} reviews`
    );

    const resultMap = await callGeminiBatch(ai, model, batch);

    const newCacheDocs = [];
    for (let bIdx = 0; bIdx < batch.length; bIdx++) {
      const review = batch[bIdx];
      const result = resultMap.get(bIdx + 1);

      if (result && result.themes && result.themes.length > 0) {
        review.themes = result.themes;
        review.themeSource = "llm";
        review.llmReason = result.reason;

        newCacheDocs.push({
          reviewId: review.reviewId,
          themes: result.themes,
          reason: result.reason,
          model,
        });
      }
    }

    if (newCacheDocs.length > 0) {
      await LlmCache.insertMany(newCacheDocs, { ordered: false }).catch(() => {});
    }

    processed += batch.length;
    // Rate limit sleep between requests (respect free-tier RPM)
    await delay(1200);
  }

  onProgress(
    targetCandidates.length,
    targetCandidates.length,
    `AI labeling completed for ${targetCandidates.length} reviews`
  );

  return {
    labeledCount: targetCandidates.length,
    cacheHits,
    apiCalls: Math.ceil(toSend.length / batchSize),
  };
}
