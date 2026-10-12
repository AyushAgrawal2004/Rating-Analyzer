import { describe, it, expect } from "vitest";
import { generateReport } from "../src/analysis/report.js";

describe("Report Analytics Calculations", () => {
  const mockAppInfo = {
    appId: "com.test.app",
    title: "Test App",
    score: 4.1,
    ratingsCount: 1200,
  };

  const fixtureReviews = [
    {
      reviewId: "r1",
      score: 1,
      content: "Crashed immediately on launch",
      themes: ["app_crash_wont_open"],
      version: "2.1.0",
      at: new Date("2026-09-01T10:00:00Z"),
      replyContent: "Sorry to hear that, fixing in next patch.",
      thumbsUpCount: 12,
    },
    {
      reviewId: "r2",
      score: 2,
      content: "Late driver and GPS wrong",
      themes: ["late_or_no_cab", "eta_tracking"],
      version: "2.1.0",
      at: new Date("2026-09-05T10:00:00Z"),
      replyContent: null,
      thumbsUpCount: 5,
    },
    {
      reviewId: "r3",
      score: 5,
      content: "Great service",
      themes: ["positive"],
      version: "2.1.0",
      at: new Date("2026-09-10T10:00:00Z"),
      replyContent: null,
      thumbsUpCount: 0,
    },
    {
      reviewId: "r4",
      score: 4,
      content: "Works smoothly",
      themes: ["positive"],
      version: "2.0.0",
      at: new Date("2026-08-01T10:00:00Z"),
      replyContent: "Thank you!",
      thumbsUpCount: 1,
    },
  ];

  it("calculates average score and low-rating percentages accurately", () => {
    const report = generateReport({ reviews: fixtureReviews, appInfo: mockAppInfo });
    // Avg score: (1 + 2 + 5 + 4) / 4 = 3.0
    expect(report.headline.collectedAverage).toBe(3.0);
    expect(report.headline.collectedCount).toBe(4);
    // Low reviews: 2 out of 4 = 50.0%
    expect(report.headline.pctLow).toBe(50.0);
  });

  it("calculates developer reply rate correctly", () => {
    const report = generateReport({ reviews: fixtureReviews, appInfo: mockAppInfo });
    // Total replied: r1 and r4 = 2 out of 4 (50%)
    expect(report.developerReplies.overallReplyRate).toBe(50.0);
    // 1-2 star reviews: r1 (replied), r2 (not replied) = 1 out of 2 (50%)
    expect(report.developerReplies.lowReplyRate).toBe(50.0);
  });

  it("ranks priority fixes weighted by severity", () => {
    const report = generateReport({ reviews: fixtureReviews, appInfo: mockAppInfo });
    expect(report.priorityFixes.items.length).toBeGreaterThan(0);
    const topFix = report.priorityFixes.items[0];
    // app_crash_wont_open has weight 1.5 and 50% share of low -> priorityScore 75
    expect(topFix.themeKey).toBe("app_crash_wont_open");
    expect(topFix.priorityScore).toBe(75);
    expect(topFix.effortEstimate).toBe("Medium");
  });

  it("computes version impact for versions with 10+ reviews", () => {
    // Generate 12 reviews for version 2.1.0
    const manyReviews = Array.from({ length: 12 }, (_, i) => ({
      reviewId: `r-v21-${i}`,
      score: i % 2 === 0 ? 1 : 5,
      content: "Review " + i,
      themes: i % 2 === 0 ? ["app_crash_wont_open"] : ["positive"],
      version: "2.1.0",
      at: new Date("2026-09-01"),
      replyContent: null,
      thumbsUpCount: 0,
    }));

    const report = generateReport({ reviews: manyReviews, appInfo: mockAppInfo });
    expect(report.versionImpact.versions.length).toBe(1);
    expect(report.versionImpact.versions[0].version).toBe("2.1.0");
    expect(report.versionImpact.versions[0].reviewCount).toBe(12);
    expect(report.versionImpact.versions[0].isSmallSample).toBe(true); // <50 reviews
  });
});
