import express from "express";
import { z } from "zod";
import { Schedule } from "../models/Schedule.js";

const router = express.Router();

const scheduleSchema = z.object({
  frequency: z.enum(["weekly", "monthly"]),
  count: z.number().int().min(10).max(10000).default(500),
  sort: z.enum(["newest", "helpful", "rating"]).default("newest"),
  useAI: z.boolean().default(false),
});

// GET /api/apps/:appId/schedule
router.get("/:appId", async (req, res, next) => {
  try {
    const schedules = await Schedule.find({ appId: req.params.appId }).sort({ createdAt: -1 });
    res.json({ schedules });
  } catch (err) {
    next(err);
  }
});

// POST /api/apps/:appId/schedule
router.post("/:appId", async (req, res, next) => {
  try {
    const parsed = scheduleSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.errors[0].message });
    }

    const { appId } = req.params;
    const { frequency, count, sort, useAI } = parsed.data;

    // Calculate nextRunAt
    const now = new Date();
    const nextRun = new Date(now);
    if (frequency === "weekly") {
      nextRun.setDate(now.getDate() + 7);
    } else {
      nextRun.setMonth(now.getMonth() + 1);
    }

    const schedule = await Schedule.create({
      appId,
      frequency,
      parameters: { count, sort, useAI },
      nextRunAt: nextRun,
      active: true,
    });

    res.status(201).json({ schedule, message: `Auto re-run scheduled ${frequency}.` });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/apps/:appId/schedule/:scheduleId
router.delete("/:appId/:scheduleId", async (req, res, next) => {
  try {
    const { scheduleId } = req.params;
    await Schedule.findByIdAndDelete(scheduleId);
    res.json({ success: true, message: "Schedule cancelled." });
  } catch (err) {
    next(err);
  }
});

export default router;
