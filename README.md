<div align="center">

# 🌟 Play Store Rating Analyzer
### *“How are our Play Store ratings and why?” — For Any Android App*

[![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-6-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-20+-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-4.21-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Gemini AI](https://img.shields.io/badge/Google_Gemini-Flash-8E75B2?style=for-the-badge&logo=googlegemini&logoColor=white)](https://ai.google.dev/)

<p align="center">
  A production-grade, full-stack intelligence platform that scrapes, tags, diagnoses, and synthesizes Google Play Store reviews for <b>any Android application</b> into executive-level root-cause reports, version regression alerts, and engineering action plans in seconds.
</p>

[Key Features](#-key-features) • [Claymorphism UI](#-claymorphic-soft-3d-design-system) • [Architecture](#-architecture--tech-stack) • [Classification Engine](#-dual-classification-pipeline) • [Quick Start](#-quick-start) • [API Contracts](#-api-endpoints)

</div>

---

## 🚀 Overview

Public app store ratings are a goldmine of feedback, but product managers and engineers face two major obstacles:
1. **Volume & Noise:** Reading hundreds or thousands of unorganized reviews is manual, slow, and error-prone.
2. **Actionability Gap:** Knowing an app dropped from 4.5★ to 3.8★ doesn't tell you *what* broke, *which* app release caused it, or *which* bug fix will have the highest ROI.

**Play Store Rating Analyzer** solves this end-to-end. Enter any Play Store App ID (or paste the store URL), choose your review sample size and sorting mode, and get a comprehensive diagnostic report:
- 📈 **Executive Ratings Health:** Lifetime store rating vs. analyzed cohort velocity.
- 📉 **Negative Driver Breakdown:** Identifies and ranks root-cause complaints behind 1- and 2-star reviews.
- 🔍 **Release Version Impact:** Pinpoints exact buggy APK versions causing rating drops.
- 💬 **Developer Reply Health:** Highlights unanswered, dissatisfied users.
- 🎯 **Prioritized Engineering Fix Matrix:** Computes actionable backlog items ranked by `Severity Weight × Complaint Frequency`.
- 🔎 **Full Reviews Explorer:** Server-side paginated, multi-filter review search with AI justification badges.
- 🖨️ **Executive Export:** One-click print-ready PDF styling and structured CSV exports.

---

## 📹 Demo & Walkthrough Video

A complete 9-minute video walkthrough showcasing the application end-to-end — from URL configuration and live real-time analysis to in-depth report interpretation — is included directly in this repository:
- 🎬 **[Watch MoveInSync Showcase Video](./MoveInSync_demo.mp4)**

---

## ✨ Key Features

### 🎨 Claymorphic (Soft 3D) Design System
- **Puffy 3D Clay Surfaces:** 4-tier layered physical shadows, top-left illumination highlights, inset depressions, and pill-shaped interactive controls.
- **MoveInSync Pastel Palette:** Derived from MoveInSync’s brand tokens — tinted washes in soft Blue, Teal, Lavender, Peach, Mint, and Butter.
- **Reactive Mascot:** An interactive SVG mascot that changes facial expressions based on app score (*Ecstatic*, *Happy*, *Neutral*, or *Worried*) with natural eye-blink cycles and celebratory physics.
- **Dynamic Floating Parallax:** Floating geometric clay shapes with mouse parallax and smooth spring damping.
- **Clay at Night (Dark Mode):** Deep navy-violet surfaces, softer diffuse highlights, and a bouncy animated sun/moon toggle switch.

### ⚡ Real-Time Diagnostic Pipeline (SSE)
- **Live 4-Station Stepper:**
  1. 📥 **Fetching Reviews:** Scrapes paginated reviews from the Play Store with incremental caching.
  2. 🏷️ **Rule Tagging:** Applies a 13-theme regex classifier in milliseconds.
  3. ✨ **Gemini AI Labelling:** Dispatches ambiguous edge-cases to Google Gemini with retry backoff.
  4. 📊 **Synthesizing Report:** Calculates distributions, correlations, and priority scores.
- **Physical Progress Ball:** Smoothly rolls along the track proportional to batch completion (`current / total`), popping floating confetti particles at each completed station.

### 🧠 Dual Classification Pipeline
- **Rule-Based Engine (Fast & Offline):** 13 commute & app-health regex categories:
  `update_regression`, `app_crash_wont_open`, `login_access`, `booking_failure`, `late_or_no_cab`, `eta_tracking`, `routing_pooling`, `safety`, `ux_friction`, `support_grievance`, `notifications`, `other`, `no_detail`.
- **Gemini LLM Batch Fallback (Nuance & Polyglot):**
  Only ambiguous 1–2 star reviews that rules cannot resolve are sent in batches of 20 to Gemini. It natively understands English, Hindi, and Hinglish complaints, tagging 1–3 themes and generating a concise 5–10 word rationale.
- **MongoDB Result Caching:** AI tags are permanently cached by `reviewId` so no review is ever sent to the LLM twice.

---

## 📊 What the Report Uncovers

| Section | What It Answers | Key Metric / Insight |
| :--- | :--- | :--- |
| **Ratings Health** | *How is our app performing right now?* | Public Store Score vs. Cohort Average, 30-day & 90-day velocity. |
| **Star Distribution** | *Are opinions polarized?* | Identifies bimodal U-curves (e.g. 48.6% 1★ vs 34.8% 5★). |
| **Root-Cause Drivers** | *Why are users leaving 1-2 stars?* | Percentage breakdown (e.g., 35.5% ETA/GPS Drift, 29.7% Booking Failures). |
| **Developer Reply Gap** | *Is support ignoring critical issues?* | Reply rate on 1–2★ reviews (e.g. only 28.7% answered; 199 users left behind). |
| **Engineering Fix Matrix** | *What should we fix first in our next sprint?* | Priority Score = `Complaint Share × Severity Weight` with effort estimates. |
| **Version Regression** | *Did our latest release break something?* | Compares versions (e.g., v12.1.2 caused an 84.6% negative surge, fixed in v12.19.0). |
| **Upvoted Reviews** | *What does the community resonate with?* | Verbatim customer quotes sorted by community upvotes. |

---

## 🛠️ Architecture & Tech Stack

```
rating-analyzer/
├── client/                     # React + Vite Frontend
│   ├── src/
│   │   ├── ui/                 # Claymorphism Design System (ClayCard, ClayButton, Mascot, etc.)
│   │   ├── components/         # Stepper, HeroCard, Report Sections, Reviews Explorer
│   │   ├── pages/              # Home.jsx, ReportPage.jsx
│   │   └── services/           # Axios API client, SSE streaming listeners
│   └── tailwind.config.js      # Clay shadows, pastel tokens, custom animations
│
├── server/                     # Node.js + Express Backend
│   ├── src/
│   │   ├── scraper/            # google-play-scraper with incremental backoff & caching
│   │   ├── classifier/         # 13-theme regex engine + Gemini LLM batch classifier
│   │   ├── analysis/           # Report generation, regression detector, fix matrix
│   │   ├── models/             # Mongoose schemas: Review, Analysis, LLMCache
│   │   ├── routes/             # REST endpoints for apps, analyses, reviews, and SSE
│   │   └── services/           # Background job runner and SSE event broadcaster
│   └── tests/                  # Vitest test suite (100% passing)
│
└── python-prototype/           # Preserved original Python prototypes
```

### Stack Breakdown
- **Frontend:** React 18, Vite 6, Tailwind CSS 3.4, Framer Motion, Recharts, Lucide Icons, TanStack Query.
- **Backend:** Node.js 20+, Express 4, Mongoose 8, `google-play-scraper`, `@google/genai`, Helmet, CORS, Express Rate Limit.
- **Database:** MongoDB (Local or Atlas).
- **Testing:** Vitest (Classifier logic, report aggregator, priority scoring).

---

## 🚀 Quick Start

### 1. Prerequisites
- **Node.js:** v20.0.0 or higher
- **MongoDB:** Local instance on port `27017` or MongoDB Atlas URI

### 2. Clone & Install
```bash
git clone https://github.com/AyushAgrawal2004/Rating-Analyzer.git
cd Rating-Analyzer
npm install
```

### 3. Configure Environment Variables
Create a `.env` file inside `server/`:
```env
PORT=5001
MONGODB_URI=mongodb://127.0.0.1:27017/rating-analyzer
NODE_ENV=development

# Optional: Add your Google Gemini API key to enable AI categorization
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-2.5-flash
```

*(Note: The app runs 100% standalone with rule-based classification even without an AI key!)*

### 4. Run Development Server
```bash
npm run dev
```
- **Client:** `http://localhost:5173`
- **Server API:** `http://localhost:5001`

### 5. Seed Demo Data (Optional)
To immediately populate the database with MoveInSync's 5,000-review dataset:
```bash
npm run seed
```

### 6. Run Test Suite
```bash
npm test
```

---

## 🔌 API Endpoints

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/apps/search?term={query}` | Search apps or fetch metadata by App ID / URL |
| `POST` | `/api/analyses` | Start a new background analysis job |
| `GET` | `/api/analyses/:id` | Fetch full report data by Analysis ID |
| `GET` | `/api/analyses/:id/progress` | Server-Sent Events (SSE) live progress stream |
| `GET` | `/api/analyses/:id/reviews` | Paginated reviews with theme, star & search filters |
| `GET` | `/api/analyses/recent` | List previous saved reports with delta comparison |
| `POST` | `/api/analyses/:id/cancel` | Cancel an in-flight analysis job |

---

## 👥 Author & Acknowledgements

Developed by **[Ayush Agrawal](https://github.com/AyushAgrawal2004)**.  
Built as a modern product diagnostics tool for mobile engineering and product leadership.
