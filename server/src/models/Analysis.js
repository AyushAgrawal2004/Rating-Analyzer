import mongoose from "mongoose";

const AnalysisSchema = new mongoose.Schema(
  {
    appId: { type: String, required: true, index: true },
    parameters: {
      count: { type: Number, default: 500 },
      sort: { type: String, default: "newest" },
      country: { type: String, default: "in" },
      lang: { type: String, default: "en" },
      useAI: { type: Boolean, default: false },
    },
    status: {
      type: String,
      enum: ["pending", "fetching", "tagging", "ai_labelling", "building_report", "completed", "failed"],
      default: "pending",
      index: true,
    },
    progress: {
      step: { type: String, default: "Initializing" },
      current: { type: Number, default: 0 },
      total: { type: Number, default: 0 },
      message: { type: String, default: "" },
    },
    error: { type: String, default: null },
    report: { type: mongoose.Schema.Types.Mixed, default: null },
  },
  { timestamps: true }
);

AnalysisSchema.index({ appId: 1, createdAt: -1 });

export const Analysis = mongoose.models.Analysis || mongoose.model("Analysis", AnalysisSchema);
