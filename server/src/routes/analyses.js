import express from "express";
import { z } from "zod";
import { Analysis } from "../models/Analysis.js";
import { Review } from "../models/Review.js";
import { runAnalysis, analysisEvents, cancelAnalysis } from "../services/analysisRunner.js";

const router = express.Router();

const createAnalysisSchema = z.object({
  appId: z.string().regex(/^[A-Za-z][A-Za-z0-9_]*(\.[A-Za-z0-9_]+)+$/, {
    message: "Invalid package identifier format (e.g. com.example.app).",
  }),
  count: z.number().int().min(10).max(10000).default(500),
  sort: z.enum(["newest", "helpful", "rating"]).default("newest"),
  country: z.string().default("in"),
  lang: z.string().default("en"),
  useAI: z.boolean().default(false),
});

// POST /api/analyses
router.post("/", async (req, res, next) => {
  try {
    const parsed = createAnalysisSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.errors[0].message });
    }

    const { appId, count, sort, country, lang, useAI } = parsed.data;

    const analysis = await Analysis.create({
      appId,
      parameters: { count, sort, country, lang, useAI },
      status: "pending",
      progress: {
        step: "Queued",
        current: 0,
        total: count,
        message: "Analysis job placed in queue...",
      },
    });

    // Run background pipeline without awaiting completion
    setImmediate(() => {
      runAnalysis(analysis._id).catch((err) => {
        console.error(`[Background Error in Analysis ${analysis._id}]:`, err);
      });
    });

    res.status(201).json({
      analysisId: analysis._id,
      status: analysis.status,
      message: "Analysis started successfully.",
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/analyses/:id/progress (SSE)
router.get("/:id/progress", async (req, res, next) => {
  try {
    const analysisId = req.params.id;
    const analysis = await Analysis.findById(analysisId);

    if (!analysis) {
      return res.status(404).json({ error: "Analysis job not found." });
    }

    // Configure headers for SSE
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.flushHeaders?.();

    const sendEvent = (event, data) => {
      res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
    };

    // If job has already completed or failed, emit immediately and close
    if (analysis.status === "completed") {
      sendEvent("progress", {
        status: "completed",
        progress: analysis.progress,
        report: analysis.report,
      });
      res.end();
      return;
    }

    if (analysis.status === "failed") {
      sendEvent("progress", {
        status: "failed",
        error: analysis.error,
      });
      res.end();
      return;
    }

    // Send initial status
    sendEvent("progress", {
      status: analysis.status,
      progress: analysis.progress,
    });

    // Listen for progress updates
    const onProgress = (data) => {
      sendEvent("progress", data);
      if (data.status === "completed" || data.status === "failed") {
        cleanup();
        res.end();
      }
    };

    const cleanup = () => {
      analysisEvents.off(`progress:${analysisId}`, onProgress);
    };

    analysisEvents.on(`progress:${analysisId}`, onProgress);

    req.on("close", cleanup);
  } catch (err) {
    next(err);
  }
});

// GET /api/analyses/:id (full report JSON)
router.get("/:id", async (req, res, next) => {
  try {
    const analysis = await Analysis.findById(req.params.id).lean();
    if (!analysis) {
      return res.status(404).json({ error: "Analysis not found." });
    }

    res.json({
      id: analysis._id,
      appId: analysis.appId,
      status: analysis.status,
      parameters: analysis.parameters,
      progress: analysis.progress,
      report: analysis.report,
      error: analysis.error,
      createdAt: analysis.createdAt,
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/analyses/:id/cancel
router.post("/:id/cancel", async (req, res, next) => {
  try {
    cancelAnalysis(req.params.id);
    res.json({ success: true, message: "Cancellation request recorded." });
  } catch (err) {
    next(err);
  }
});

// GET /api/analyses/:id/export?format=csv|json
router.get("/:id/export", async (req, res, next) => {
  try {
    const format = (req.query.format || "json").toString().toLowerCase();
    const analysis = await Analysis.findById(req.params.id).lean();
    if (!analysis) {
      return res.status(404).json({ error: "Analysis not found." });
    }

    if (format === "csv") {
      // Export reviews associated with this analysis
      const reviews = await Review.find({ appId: analysis.appId })
        .sort({ at: -1 })
        .limit(analysis.parameters?.count || 1000)
        .lean();

      const headers = [
        "reviewId",
        "userName",
        "score",
        "content",
        "thumbsUpCount",
        "version",
        "at",
        "replyContent",
        "themes",
        "themeSource",
      ];

      const escapeCSV = (val) => {
        if (val === null || val === undefined) return "";
        const str = String(val).replace(/"/g, '""');
        return `"${str}"`;
      };

      const rows = [headers.join(",")];
      for (const r of reviews) {
        rows.push(
          [
            escapeCSV(r.reviewId),
            escapeCSV(r.userName),
            r.score,
            escapeCSV(r.content),
            r.thumbsUpCount || 0,
            escapeCSV(r.version),
            escapeCSV(r.at ? new Date(r.at).toISOString() : ""),
            escapeCSV(r.replyContent || ""),
            escapeCSV((r.themes || []).join("|")),
            escapeCSV(r.themeSource || "rule"),
          ].join(",")
        );
      }

      res.setHeader("Content-Type", "text/csv");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${analysis.appId}_analysis_${analysis._id}.csv"`
      );
      return res.send(rows.join("\n"));
    }

    // Default JSON export
    res.setHeader("Content-Type", "application/json");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${analysis.appId}_report_${analysis._id}.json"`
    );
    res.json(analysis);
  } catch (err) {
    next(err);
  }
});

export default router;
