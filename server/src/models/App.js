import mongoose from "mongoose";

const AppSchema = new mongoose.Schema(
  {
    appId: { type: String, required: true, unique: true, index: true },
    title: { type: String, default: "" },
    icon: { type: String, default: "" },
    developer: { type: String, default: "" },
    score: { type: Number, default: 0 },
    ratingsCount: { type: Number, default: 0 },
    version: { type: String, default: "" },
    genre: { type: String, default: "" },
    url: { type: String, default: "" },
    lastAnalyzedAt: { type: Date },
  },
  { timestamps: true }
);

export const App = mongoose.models.App || mongoose.model("App", AppSchema);
