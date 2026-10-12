import express from "express";
import { listAvailableModels } from "../classifier/llm.js";

const router = express.Router();

// GET /api/llm/models
router.get("/models", async (req, res, next) => {
  try {
    const hasKey = Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim().length > 0);
    const activeModel = process.env.GEMINI_MODEL || "gemini-3.5-flash-lite";

    if (!hasKey) {
      return res.json({
        hasKey: false,
        activeModel,
        availableModels: [],
        message: "Gemini API key is not configured in server/.env. Deep AI analysis is disabled.",
      });
    }

    try {
      const models = await listAvailableModels();
      res.json({
        hasKey: true,
        activeModel,
        availableModels: models,
      });
    } catch (err) {
      res.status(200).json({
        hasKey: true,
        activeModel,
        availableModels: [activeModel],
        warning: `Could not fetch live models list: ${err.message}. Using default model.`,
      });
    }
  } catch (err) {
    next(err);
  }
});

export default router;
