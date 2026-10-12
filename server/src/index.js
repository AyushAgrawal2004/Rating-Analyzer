import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import cron from "node-cron";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, "../.env") });
dotenv.config();
import { connectDB } from "./db.js";
import appsRoutes from "./routes/apps.js";
import analysesRoutes from "./routes/analyses.js";
import reviewsRoutes from "./routes/reviews.js";
import llmRoutes from "./routes/llm.js";
import scheduleRoutes from "./routes/schedule.js";
import { Schedule } from "./models/Schedule.js";
import { Analysis } from "./models/Analysis.js";
import { runAnalysis } from "./services/analysisRunner.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || "http://localhost:5173";

// Security Middleware
app.use(
  helmet({
    contentSecurityPolicy: false, // Allow client development & Vite HMR
    crossOriginEmbedderPolicy: false,
  })
);

app.use(
  cors({
    origin: CLIENT_ORIGIN === "*" ? "*" : [CLIENT_ORIGIN, "http://localhost:5173", "http://127.0.0.1:5173"],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true,
  })
);

app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true }));

// Rate Limiter
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300, // Limit each IP to 300 requests per window
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many requests. Please try again after 15 minutes." },
});
app.use("/api", limiter);

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "healthy", timestamp: new Date().toISOString() });
});

// API Routes
app.use("/api/apps", appsRoutes);
app.use("/api/apps", scheduleRoutes);
app.use("/api/analyses", analysesRoutes);
app.use("/api/reviews", reviewsRoutes);
app.use("/api/llm", llmRoutes);

// Consistent Error Handling Middleware
app.use((err, req, res, next) => {
  console.error(`[Server Error] ${req.method} ${req.originalUrl}:`, err);
  const status = err.status || err.statusCode || 500;
  res.status(status).json({
    error: err.message || "An unexpected server error occurred.",
  });
});

// Scheduled Cron Worker (Runs every hour to check for due recurring schedules)
cron.schedule("0 * * * *", async () => {
  try {
    const dueSchedules = await Schedule.find({
      active: true,
      nextRunAt: { $lte: new Date() },
    });

    for (const item of dueSchedules) {
      console.log(`[Cron] Triggering scheduled analysis for app: ${item.appId}`);
      const analysis = await Analysis.create({
        appId: item.appId,
        parameters: item.parameters || { count: 500, sort: "newest" },
        status: "pending",
        progress: {
          step: "Scheduled",
          current: 0,
          total: item.parameters?.count || 500,
          message: "Triggered by recurring schedule...",
        },
      });

      // Update next run date
      const nextDate = new Date();
      if (item.frequency === "weekly") {
        nextDate.setDate(nextDate.getDate() + 7);
      } else {
        nextDate.setMonth(nextDate.getMonth() + 1);
      }
      item.lastRunAt = new Date();
      item.nextRunAt = nextDate;
      await item.save();

      // Run analysis
      runAnalysis(analysis._id).catch((e) => {
        console.error(`[Cron Analysis Error]:`, e);
      });
    }
  } catch (cronErr) {
    console.error("[Cron Scheduler Error]:", cronErr);
  }
});

// Start Server after connecting to Database
async function startServer() {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`[Server] Rating Analyzer API listening on http://localhost:${PORT}`);
  });
}

// Only start when invoked directly
if (process.env.NODE_ENV !== "test") {
  startServer().catch((err) => {
    console.error("[Fatal Startup Error]:", err);
    process.exit(1);
  });
}

export default app;
