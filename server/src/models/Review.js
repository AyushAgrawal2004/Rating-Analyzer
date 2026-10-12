import mongoose from "mongoose";

const ReviewSchema = new mongoose.Schema(
  {
    reviewId: { type: String, required: true, unique: true, index: true },
    appId: { type: String, required: true, index: true },
    userName: { type: String, default: "" },
    score: { type: Number, required: true, index: true },
    content: { type: String, default: "" },
    thumbsUpCount: { type: Number, default: 0 },
    version: { type: String, default: "", index: true },
    at: { type: Date, required: true, index: true },
    replyContent: { type: String, default: null },
    repliedAt: { type: Date, default: null },
    themes: { type: [String], default: [], index: true },
    themeSource: { type: String, enum: ["rule", "llm", "seed"], default: "rule" },
    llmReason: { type: String, default: "" },
  },
  { timestamps: true }
);

ReviewSchema.index({ appId: 1, at: -1 });
ReviewSchema.index({ appId: 1, score: 1 });
ReviewSchema.index({ appId: 1, themes: 1 });

export const Review = mongoose.models.Review || mongoose.model("Review", ReviewSchema);
