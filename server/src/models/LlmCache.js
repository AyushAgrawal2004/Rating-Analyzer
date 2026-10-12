import mongoose from "mongoose";

const LlmCacheSchema = new mongoose.Schema(
  {
    reviewId: { type: String, required: true, unique: true, index: true },
    themes: { type: [String], default: [] },
    reason: { type: String, default: "" },
    model: { type: String, default: "" },
  },
  { timestamps: true }
);

export const LlmCache = mongoose.models.LlmCache || mongoose.model("LlmCache", LlmCacheSchema);
