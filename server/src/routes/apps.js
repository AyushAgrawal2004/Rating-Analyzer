import express from "express";
import { z } from "zod";
import { getAppInfo, searchApps } from "../scraper/playstore.js";
import { App } from "../models/App.js";
import { Analysis } from "../models/Analysis.js";

const router = express.Router();

const appIdSchema = z.string().regex(/^[A-Za-z][A-Za-z0-9_]*(\.[A-Za-z0-9_]+)+$/, {
  message: "Invalid Android package identifier format (e.g., com.example.app).",
});

// GET /api/apps/search?q=
router.get("/search", async (req, res, next) => {
  try {
    const q = (req.query.q || "").toString().trim();
    if (!q) {
      return res.json({ results: [] });
    }
    const results = await searchApps(q);
    res.json({ results });
  } catch (err) {
    next(err);
  }
});

// GET /api/apps/:appId
router.get("/:appId", async (req, res, next) => {
  try {
    const parsedAppId = appIdSchema.safeParse(req.params.appId);
    if (!parsedAppId.success) {
      return res.status(400).json({ error: parsedAppId.error.errors[0].message });
    }
    const appId = parsedAppId.data;
    const { lang = "en", country = "in" } = req.query;

    let app = await App.findOne({ appId }).lean();
    try {
      // Try fetching fresh data from store
      const storeInfo = await getAppInfo(appId, lang, country);
      app = await App.findOneAndUpdate(
        { appId },
        { ...storeInfo },
        { upsert: true, new: true }
      ).lean();
    } catch (scrapeErr) {
      if (!app) {
        return res.status(scrapeErr.status || 404).json({
          error: scrapeErr.message || `Application ${appId} could not be found.`,
        });
      }
    }

    res.json({ app });
  } catch (err) {
    next(err);
  }
});

// GET /api/apps/:appId/analyses (History with key metrics for comparison)
router.get("/:appId/analyses", async (req, res, next) => {
  try {
    const parsedAppId = appIdSchema.safeParse(req.params.appId);
    if (!parsedAppId.success) {
      return res.status(400).json({ error: parsedAppId.error.errors[0].message });
    }
    const appId = parsedAppId.data;

    const analyses = await Analysis.find({ appId })
      .sort({ createdAt: -1 })
      .limit(20)
      .select("appId status parameters progress report.headline report.dataNotes createdAt error")
      .lean();

    const formatted = analyses.map((a) => ({
      id: a._id,
      status: a.status,
      parameters: a.parameters,
      progress: a.progress,
      headline: a.report?.headline || null,
      dataNotes: a.report?.dataNotes || null,
      createdAt: a.createdAt,
      error: a.error,
    }));

    res.json({ analyses: formatted });
  } catch (err) {
    next(err);
  }
});

export default router;
