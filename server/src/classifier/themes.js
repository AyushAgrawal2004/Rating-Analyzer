/**
 * themes.js - Editable, app-agnostic complaint theme definitions and regex classifier.
 *
 * NOTE: The default themes suit commute and booking apps, but this file is designed
 * to be extended or customized for any domain (fintech, e-commerce, gaming, social).
 */

export const THEME_DEFINITIONS = {
  update_regression: {
    label: "Update Regression",
    description: "New update made app worse, broken features after update",
    patterns: [
      /\bupdate[ds]?\b/i,
      /new version/i,
      /latest version/i,
      /old version/i,
      /previous version/i,
      /bring (back|the old)/i,
      /worse (after|now)/i,
      /downgrade/i,
      /was better (before|earlier)/i,
    ],
  },
  app_crash_wont_open: {
    label: "App Crash / Won't Open",
    description: "Crashes, freezing, stuck screen, force closing, won't launch",
    patterns: [
      /crash/i,
      /not (able to )?open/i,
      /won'?t open/i,
      /doesn'?t open/i,
      /not opening/i,
      /force close/i,
      /keeps? (closing|stopping)/i,
      /stuck/i,
      /hang/i,
      /freez/i,
      /black screen/i,
      /white screen/i,
      /uninstall/i,
      /reinstall/i,
      /not loading/i,
      /loading/i,
      /chal nahi/i,
      /khulta nahi/i,
    ],
  },
  login_access: {
    label: "Login & Access",
    description: "Cannot sign in, SSO errors, OTP/password issues, blocked account",
    patterns: [
      /log ?in/i,
      /sign ?in/i,
      /password/i,
      /register/i,
      /verification/i,
      /\bsso\b/i,
      /can'?t (access|enter)/i,
      /account/i,
    ],
  },
  booking_failure: {
    label: "Booking Failure",
    description: "Cannot book, waitlisted, schedule or roster issues, no slots",
    patterns: [
      /book/i,
      /waitlist/i,
      /wait list/i,
      /slot/i,
      /schedul/i,
      /no (cab|seat|vehicle)s? available/i,
      /unable to (book|request)/i,
      /not able to (book|request)/i,
      /roster/i,
      /shift/i,
    ],
  },
  late_or_no_cab: {
    label: "Late or No Cab",
    description: "Vehicle delay, no-show, driver canceled, missed pickup",
    patterns: [
      /\blate\b/i,
      /delay/i,
      /waiting/i,
      /no ?show/i,
      /didn'?t (come|arrive|show)/i,
      /not (come|arrive|reach|show)/i,
      /cab (not|never)/i,
      /driver (not|never)/i,
      /cancel/i,
      /missed/i,
      /time pe nahi/i,
      /nahi aaya/i,
      /nahi aayi/i,
    ],
  },
  eta_tracking: {
    label: "ETA & Tracking",
    description: "Inaccurate ETA, GPS map drift, vehicle location wrong",
    patterns: [
      /\beta\b/i,
      /track/i,
      /live location/i,
      /\bgps\b/i,
      /location/i,
      /google maps?/i,
      /where is (my|the) (cab|driver)/i,
      /vehicle location/i,
    ],
  },
  routing_pooling: {
    label: "Routing & Pooling",
    description: "Unreasonable detours, zigzag routes, too many passengers or stops",
    patterns: [
      /\broute/i,
      /routing/i,
      /detour/i,
      /pick ?-?up time/i,
      /long (way|route|ride)/i,
      /club(s|bed)?\b/i,
      /pool/i,
      /zig ?zag/i,
      /circuit/i,
      /too many (stops|people|pickups)/i,
    ],
  },
  safety: {
    label: "Safety & Security",
    description: "Rash driving, SOS alerts, night escort, harassment, seatbelt",
    patterns: [
      /safety/i,
      /safe\b/i,
      /unsafe/i,
      /seat ?belt/i,
      /\bsos\b/i,
      /panic/i,
      /rash/i,
      /harass/i,
      /women/i,
      /female/i,
      /escort/i,
      /night/i,
    ],
  },
  ux_friction: {
    label: "UX Friction",
    description: "Mandatory popups, confusing interface, extra clicks, annoying design",
    patterns: [
      /forc(e|ing|ed)/i,
      /mandatory/i,
      /no skip/i,
      /skip/i,
      /one more click/i,
      /extra (click|step)/i,
      /annoying/i,
      /confus/i,
      /complicated/i,
      /cumbersome/i,
      /\bui\b/i,
      /interface/i,
      /design/i,
      /layout/i,
      /too many (clicks|steps|screens)/i,
      /pop ?-?up/i,
    ],
  },
  support_grievance: {
    label: "Support Grievance",
    description: "No reply from helpdesk, unresolved complaints, poor customer care",
    patterns: [
      /support/i,
      /customer care/i,
      /helpdesk/i,
      /help desk/i,
      /no (response|reply)/i,
      /complaint/i,
      /grievance/i,
      /nobody (responds|replies)/i,
      /not resolved/i,
      /escalat/i,
    ],
  },
  notifications: {
    label: "Notifications",
    description: "Missing or delayed SMS, alerts, reminders, push notifications",
    patterns: [
      /notification/i,
      /alert/i,
      /reminder/i,
      /sms/i,
    ],
  },
};

export const ALL_THEME_KEYS = [
  "update_regression",
  "app_crash_wont_open",
  "login_access",
  "booking_failure",
  "late_or_no_cab",
  "eta_tracking",
  "routing_pooling",
  "safety",
  "ux_friction",
  "support_grievance",
  "notifications",
  "other",
  "no_detail",
];

/**
 * Classifies review text into themes based on regex rules.
 * Supports multi-label matching.
 *
 * @param {string} text - Review body text
 * @param {number} score - Star rating (1-5)
 * @returns {string[]} Array of assigned theme keys
 */
export function classifyText(text, score = 1) {
  const clean = (text || "").toString().trim();
  const hits = [];

  for (const [themeKey, def] of Object.entries(THEME_DEFINITIONS)) {
    for (const pattern of def.patterns) {
      if (pattern.test(clean)) {
        hits.push(themeKey);
        break; // matched this theme, continue to next theme
      }
    }
  }

  if (hits.length > 0) {
    return hits;
  }

  // Fallback when no keywords matched
  const words = clean ? clean.split(/\s+/).filter(Boolean).length : 0;
  if (score <= 2) {
    return words <= 6 ? ["no_detail"] : ["other"];
  }
  if (score >= 4) {
    return ["positive"];
  }
  return ["other"];
}
