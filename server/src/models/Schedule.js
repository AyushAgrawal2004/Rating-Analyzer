import mongoose from "mongoose";

const ScheduleSchema = new mongoose.Schema(
  {
    appId: { type: String, required: true, index: true },
    frequency: { type: String, enum: ["weekly", "monthly"], required: true },
    parameters: {
      count: { type: Number, default: 500 },
      sort: { type: String, default: "newest" },
      country: { type: String, default: "in" },
      lang: { type: String, default: "en" },
      useAI: { type: Boolean, default: false },
    },
    lastRunAt: { type: Date, default: null },
    nextRunAt: { type: Date, default: null },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const Schedule = mongoose.models.Schedule || mongoose.model("Schedule", ScheduleSchema);
