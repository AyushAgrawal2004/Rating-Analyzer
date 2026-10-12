/**
 * seed.js - Seeds MongoDB with python-prototype/data/classified.csv
 * for com.moveinsync.ets so the dashboard can be demoed offline.
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { parse } from "csv-parse/sync";
import dotenv from "dotenv";

import { connectDB, disconnectDB } from "../src/db.js";
import { App } from "../src/models/App.js";
import { Review } from "../src/models/Review.js";
import { Analysis } from "../src/models/Analysis.js";
import { generateReport } from "../src/analysis/report.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function seed() {
  console.log("[Seed] Starting database seed process...");
  await connectDB();

  const csvPath = path.resolve(__dirname, "../../python-prototype/data/classified.csv");
  if (!fs.existsSync(csvPath)) {
    console.error(`[Seed] Error: CSV file not found at ${csvPath}`);
    process.exit(1);
  }

  console.log(`[Seed] Reading CSV file from ${csvPath}...`);
  const fileContent = fs.readFileSync(csvPath, "utf-8");
  const records = parse(fileContent, {
    columns: true,
    skip_empty_lines: true,
  });

  console.log(`[Seed] Parsed ${records.length} records from CSV.`);

  const appId = "com.moveinsync.ets";

  // 1. Create or update App metadata
  const appData = {
    appId,
    title: "MoveInSync - Employee Commute",
    icon: "https://play-lh.googleusercontent.com/zVqV-J2dY5GqgO-E3eP2aQ3qR2vX3rXw0A-pZ5o", // standard placeholder or store icon
    developer: "MoveInSync Technology Solutions",
    score: 4.2,
    ratingsCount: 5097,
    version: "12.20.0",
    genre: "Auto & Vehicles / Productivity",
    url: "https://play.google.com/store/apps/details?id=com.moveinsync.ets",
    lastAnalyzedAt: new Date(),
  };

  const appDoc = await App.findOneAndUpdate({ appId }, appData, { upsert: true, new: true });
  console.log(`[Seed] App metadata upserted: ${appDoc.title} (${appDoc.appId})`);

  // 2. Insert reviews in batches of 500
  const batchSize = 500;
  let insertedCount = 0;

  for (let i = 0; i < records.length; i += batchSize) {
    const batch = records.slice(i, i + batchSize);
    const bulkOps = batch.map((r) => {
      const themesList = r.themes
        ? r.themes
            .split("|")
            .map((t) => t.trim())
            .filter(Boolean)
        : [];

      return {
        updateOne: {
          filter: { reviewId: r.reviewId },
          update: {
            $set: {
              appId,
              userName: r.userName || "Play Store User",
              score: parseInt(r.score, 10) || 1,
              content: r.content || "",
              thumbsUpCount: parseInt(r.thumbsUpCount, 10) || 0,
              version: r.reviewCreatedVersion || "",
              at: r.at ? new Date(r.at) : new Date(),
              replyContent: r.replyContent || null,
              repliedAt: r.repliedAt ? new Date(r.repliedAt) : null,
              themes: themesList,
              themeSource: "seed",
            },
          },
          upsert: true,
        },
      };
    });

    await Review.bulkWrite(bulkOps);
    insertedCount += batch.length;
    process.stdout.write(`[Seed] Upserted ${insertedCount} / ${records.length} reviews...\r`);
  }

  console.log(`\n[Seed] Successfully stored ${records.length} reviews for ${appId}.`);

  // 3. Pre-generate and store completed Analysis
  const allReviews = await Review.find({ appId }).sort({ at: -1 }).limit(1000).lean();
  const report = generateReport({
    reviews: allReviews,
    appInfo: appDoc,
    previousAnalysis: null,
    parameters: {
      count: 1000,
      sort: "newest",
      country: "in",
      lang: "en",
      useAI: false,
    },
  });

  const analysis = await Analysis.create({
    appId,
    parameters: { count: 1000, sort: "newest", country: "in", lang: "en", useAI: false },
    status: "completed",
    progress: {
      step: "Complete",
      current: 1000,
      total: 1000,
      message: "Seeded analysis ready.",
    },
    report,
  });

  console.log(`[Seed] Generated completed analysis ${analysis._id} with ${allReviews.length} reviews.`);
  console.log("[Seed] Seeding complete! You can now start the app with 'npm run dev'.");

  await disconnectDB();
  process.exit(0);
}

seed().catch((err) => {
  console.error("[Seed] Failed to seed database:", err);
  process.exit(1);
});
