import express from "express";
import { Review } from "../models/Review.js";

const router = express.Router();

// GET /api/reviews
router.get("/", async (req, res, next) => {
  try {
    const {
      appId,
      page = 1,
      limit = 20,
      sort = "newest",
      score,
      theme,
      themeSource,
      version,
      q,
      from,
      to,
      replied,
    } = req.query;

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
    const skip = (pageNum - 1) * limitNum;

    const filter = {};
    if (appId) {
      filter.appId = appId;
    }

    if (score) {
      if (score === "low") {
        filter.score = { $lte: 2 };
      } else if (score === "high") {
        filter.score = { $gte: 4 };
      } else {
        const scoreInt = parseInt(score, 10);
        if (!isNaN(scoreInt)) {
          filter.score = scoreInt;
        }
      }
    }

    if (theme && theme !== "all") {
      filter.themes = theme;
    }

    if (themeSource && themeSource !== "all") {
      filter.themeSource = themeSource;
    }

    if (version && version !== "all") {
      filter.version = version;
    }

    if (q && q.trim()) {
      filter.content = { $regex: q.trim(), $options: "i" };
    }

    if (replied === "true") {
      filter.replyContent = { $ne: null, $exists: true };
    } else if (replied === "false") {
      filter.replyContent = null;
    }

    if (from || to) {
      filter.at = {};
      if (from) filter.at.$gte = new Date(from);
      if (to) filter.at.$lte = new Date(to);
    }

    // Determine sort
    let sortDoc = { at: -1 };
    switch (sort) {
      case "oldest":
        sortDoc = { at: 1 };
        break;
      case "most_helpful":
        sortDoc = { thumbsUpCount: -1, at: -1 };
        break;
      case "highest_rating":
        sortDoc = { score: -1, at: -1 };
        break;
      case "lowest_rating":
        sortDoc = { score: 1, at: -1 };
        break;
      case "newest":
      default:
        sortDoc = { at: -1 };
        break;
    }

    const [reviews, total] = await Promise.all([
      Review.find(filter).sort(sortDoc).skip(skip).limit(limitNum).lean(),
      Review.countDocuments(filter),
    ]);

    // Also get distinct available versions for filter dropdown
    const distinctVersions = appId ? await Review.distinct("version", { appId }) : [];

    res.json({
      reviews,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum) || 1,
      },
      availableVersions: distinctVersions.filter(Boolean).sort(),
    });
  } catch (err) {
    next(err);
  }
});

export default router;
