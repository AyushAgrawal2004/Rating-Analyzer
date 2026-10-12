import { describe, it, expect } from "vitest";
import { classifyText } from "../src/classifier/themes.js";

describe("Theme Classifier (Regex rules)", () => {
  it("tags multi-label review with ux_friction and safety", () => {
    const text =
      "when you click view otp it pops up the seat belt safely first, very annoying, one more click";
    const themes = classifyText(text, 2);
    expect(themes).toContain("ux_friction");
    expect(themes).toContain("safety");
  });

  it("tags review mentioning ETA and maps with eta_tracking", () => {
    const text = "ETA is wrong, google maps shows 3x";
    const themes = classifyText(text, 1);
    expect(themes).toContain("eta_tracking");
  });

  it("tags short 5-star review as positive", () => {
    const text = "good";
    const themes = classifyText(text, 5);
    expect(themes).toEqual(["positive"]);
  });

  it("tags app crash and freeze complaints correctly", () => {
    const text = "App keeps crashing and freezes on white screen. Won't open!";
    const themes = classifyText(text, 1);
    expect(themes).toContain("app_crash_wont_open");
  });

  it("tags login and SSO access issues", () => {
    const text = "Cannot sign in with corporate sso, password verification failed";
    const themes = classifyText(text, 1);
    expect(themes).toContain("login_access");
  });

  it("tags booking failure and waitlist issues", () => {
    const text = "Unable to book shift roster, all cabs are waitlisted";
    const themes = classifyText(text, 2);
    expect(themes).toContain("booking_failure");
  });

  it("tags late cab and driver no-show issues with Hinglish", () => {
    const text = "Cab late ho gaya, driver nahi aaya and call cancel kar diya";
    const themes = classifyText(text, 1);
    expect(themes).toContain("late_or_no_cab");
  });

  it("falls back to no_detail for short vague negative review", () => {
    const text = "worst app";
    const themes = classifyText(text, 1);
    expect(themes).toEqual(["no_detail"]);
  });

  it("falls back to other for long unexplained negative review", () => {
    const text = "This product completely disappointed our department repeatedly throughout this entire quarter.";
    const themes = classifyText(text, 1);
    expect(themes).toEqual(["other"]);
  });
});
