/**
 * priorities.js - Severity weights, estimated efforts, and recommended actions
 * for complaint themes.
 *
 * Score = share of low reviews * severityWeight
 * Editable mapping file for engineering and product triage.
 */

export const THEME_PRIORITIES = {
  app_crash_wont_open: {
    severityWeight: 1.5,
    effortEstimate: "Medium",
    suggestedAction: "Audit Crashlytics logs for top fatal crashes, startup ANRs, and memory leaks on cold launch.",
  },
  login_access: {
    severityWeight: 1.4,
    effortEstimate: "Medium",
    suggestedAction: "Resolve SSO auth session drops, increase OTP retry grace period, and improve error messaging on auth failure.",
  },
  booking_failure: {
    severityWeight: 1.3,
    effortEstimate: "High",
    suggestedAction: "Optimize roster scheduling lock timeouts and provide clearer queue/waitlist visibility to prevent failed bookings.",
  },
  late_or_no_cab: {
    severityWeight: 1.25,
    effortEstimate: "High",
    suggestedAction: "Enforce vendor SLA alerts 20 mins prior to shift and add automatic fallback dispatch for no-show drivers.",
  },
  safety: {
    severityWeight: 1.35,
    effortEstimate: "Medium",
    suggestedAction: "Streamline SOS emergency triggers, monitor speeding alerts, and verify female night escort protocols.",
  },
  update_regression: {
    severityWeight: 1.2,
    effortEstimate: "Low",
    suggestedAction: "Run canary releases with staged rollouts (5% -> 25%) and monitor release-specific crash spikes.",
  },
  eta_tracking: {
    severityWeight: 1.1,
    effortEstimate: "Medium",
    suggestedAction: "Improve driver GPS ping frequency and calibrate ETA calculation using historical traffic profiles.",
  },
  routing_pooling: {
    severityWeight: 1.0,
    effortEstimate: "High",
    suggestedAction: "Cap maximum detour minutes per passenger and constrain route zigzag algorithms in high-density corridors.",
  },
  ux_friction: {
    severityWeight: 0.9,
    effortEstimate: "Low",
    suggestedAction: "Remove non-critical forced confirmation dialogues, consolidate clicks for OTP/check-in, and modernize flow.",
  },
  support_grievance: {
    severityWeight: 0.85,
    effortEstimate: "Low",
    suggestedAction: "Introduce in-app ticket status tracker and automated acknowledgment with SLA response timers.",
  },
  notifications: {
    severityWeight: 0.8,
    effortEstimate: "Low",
    suggestedAction: "Audit background push notification channels and add fallback SMS delivery for critical ride updates.",
  },
  other: {
    severityWeight: 0.6,
    effortEstimate: "Medium",
    suggestedAction: "Inspect unclassified review samples to discover emerging edge cases or product requests.",
  },
  no_detail: {
    severityWeight: 0.4,
    effortEstimate: "Low",
    suggestedAction: "Prompt 1-star reviewers with quick structured chips ('Driver', 'App', 'Timing') to capture actionable root causes.",
  },
};
