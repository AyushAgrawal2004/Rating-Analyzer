/**
 * playstore.js - Isolated wrapper around google-play-scraper.
 *
 * This is the ONLY file that imports google-play-scraper so endpoint changes
 * can be addressed in one place.
 */

import gplay from "google-play-scraper";

const SORT_MAP = {
  newest: gplay.sort.NEWEST,
  helpful: gplay.sort.HELPFULNESS,
  rating: gplay.sort.RATING,
};

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Fetch Android application details from Google Play.
 *
 * @param {string} appId - Play Store package ID
 * @param {string} lang - Language code (e.g., 'en')
 * @param {string} country - Country code (e.g., 'in')
 * @returns {Promise<Object>} Formatted app metadata
 */
export async function getAppInfo(appId, lang = "en", country = "in") {
  try {
    const data = await gplay.app({
      appId,
      lang,
      country,
    });

    return {
      appId: data.appId,
      title: data.title || "",
      icon: data.icon || "",
      developer: data.developer || "",
      score: typeof data.score === "number" ? Math.round(data.score * 100) / 100 : 0,
      ratingsCount: data.ratings || 0,
      reviewsCount: data.reviews || 0,
      version: data.version || "Varies with device",
      genre: data.genre || "",
      url: data.url || `https://play.google.com/store/apps/details?id=${appId}`,
    };
  } catch (err) {
    if (err.message && err.message.includes("404")) {
      const error = new Error(`Application "${appId}" not found on Google Play Store (${country}/${lang}).`);
      error.status = 404;
      throw error;
    }
    throw err;
  }
}

/**
 * Search Play Store for apps matching query.
 *
 * @param {string} query - App title or search phrase
 * @param {string} lang
 * @param {string} country
 * @returns {Promise<Array>} List of matching app previews
 */
export async function searchApps(query, lang = "en", country = "in") {
  if (!query || !query.trim()) return [];
  try {
    const results = await gplay.search({
      term: query.trim(),
      num: 8,
      lang,
      country,
    });

    return results.map((r) => ({
      appId: r.appId,
      title: r.title,
      icon: r.icon,
      developer: r.developer,
      score: r.score,
    }));
  } catch (err) {
    console.error("[PlayStore Search Error]:", err.message);
    return [];
  }
}

/**
 * Paged review fetcher with incremental detection and rate limiting.
 *
 * @param {Object} options
 * @param {string} options.appId - Package ID
 * @param {number} options.count - Target number of reviews to fetch (capped at 10,000)
 * @param {string} options.sort - 'newest' | 'helpful' | 'rating'
 * @param {string} options.lang - default 'en'
 * @param {string} options.country - default 'in'
 * @param {Set<string>} [options.existingReviewIds] - Set of IDs already in DB
 * @param {Function} [options.onProgress] - Callback (current, total, message)
 * @returns {Promise<{ reviews: Array, hitExisting: boolean, totalFetched: number }>}
 */
export async function fetchReviewsPaged({
  appId,
  count = 500,
  sort = "newest",
  lang = "en",
  country = "in",
  existingReviewIds = new Set(),
  onProgress = () => {},
}) {
  const targetCount = Math.min(Math.max(count, 10), 10000);
  const playSort = SORT_MAP[sort] ?? gplay.sort.NEWEST;
  const collected = [];
  const pageSize = 150;
  let nextPaginationToken = null;
  let hitExisting = false;
  let page = 0;

  while (collected.length < targetCount) {
    const batchSize = Math.min(pageSize, targetCount - collected.length);
    let attempts = 0;
    let batchData = null;

    // Retry with exponential backoff on transient errors
    while (attempts < 3) {
      try {
        const response = await gplay.reviews({
          appId,
          sort: playSort,
          lang,
          country,
          count: batchSize,
          paginate: true,
          nextPaginationToken,
        });

        batchData = response;
        break;
      } catch (err) {
        attempts++;
        if (attempts >= 3) {
          console.warn(`[PlayStore Scraper] Failed after 3 retries on page ${page}: ${err.message}`);
          throw err;
        }
        const waitMs = 1500 * attempts;
        console.warn(`[PlayStore Scraper] Attempt ${attempts} failed (${err.message}). Retrying in ${waitMs}ms...`);
        await delay(waitMs);
      }
    }

    if (!batchData || !batchData.data || batchData.data.length === 0) {
      // Reached the end of available reviews in the store
      break;
    }

    const reviewsBatch = batchData.data;
    nextPaginationToken = batchData.nextPaginationToken;
    page++;

    let hasKnownOnThisPage = false;
    for (const r of reviewsBatch) {
      if (sort === "newest" && existingReviewIds.has(r.id)) {
        hasKnownOnThisPage = true;
        hitExisting = true;
      }

      collected.push({
        reviewId: r.id,
        appId,
        userName: r.userName || "Play Store User",
        score: r.score || 1,
        content: r.text || "",
        thumbsUpCount: r.thumbsUp || 0,
        version: r.version || "",
        at: r.date ? new Date(r.date) : new Date(),
        replyContent: r.replyText || null,
        repliedAt: r.replyDate ? new Date(r.replyDate) : null,
      });

      if (collected.length >= targetCount) break;
    }

    onProgress(collected.length, targetCount, `Fetched ${collected.length} / ${targetCount} reviews`);

    // If incremental mode (newest sort) encountered known reviews, we can stop
    if (sort === "newest" && hasKnownOnThisPage) {
      console.log(`[PlayStore Scraper] Incremental stop triggered on page ${page}: encountered existing reviews.`);
      break;
    }

    if (!nextPaginationToken) {
      break; // No more pages
    }

    // Polite rate-limit delay
    await delay(350);
  }

  return {
    reviews: collected,
    hitExisting,
    totalFetched: collected.length,
  };
}
