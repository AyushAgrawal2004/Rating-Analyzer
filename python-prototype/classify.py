"""
classify.py - Tag each review with one or more complaint themes (rule-based, free, no model needed).

Usage:
    python classify.py                 # reads data/reviews.csv -> writes data/classified.csv
"""
import re

import pandas as pd

IN_PATH = "data/reviews.csv"
OUT_PATH = "data/classified.csv"

# theme -> regex alternatives (matched case-insensitively against review text)
THEMES = {
    "update_regression": [
        r"\bupdate[ds]?\b", r"new version", r"latest version", r"old version",
        r"previous version", r"bring (back|the old)", r"worse (after|now)", r"downgrade",
        r"was better (before|earlier)",
    ],
    "app_crash_wont_open": [
        r"crash", r"not (able to )?open", r"won'?t open", r"doesn'?t open", r"not opening",
        r"force close", r"keeps? (closing|stopping)", r"stuck", r"hang", r"freez",
        r"black screen", r"white screen", r"uninstall", r"reinstall", r"not loading",
        r"loading", r"chal nahi", r"khulta nahi",
    ],
    "login_access": [
        r"log ?in", r"sign ?in", r"password", r"register", r"verification", r"\bsso\b",
        r"can'?t (access|enter)", r"account",
    ],
    "booking_failure": [
        r"book", r"waitlist", r"wait list", r"slot", r"schedul", r"no (cab|seat|vehicle)s? available",
        r"unable to (book|request)", r"not able to (book|request)", r"roster", r"shift",
    ],
    "late_or_no_cab": [
        r"\blate\b", r"delay", r"waiting", r"no ?show", r"didn'?t (come|arrive|show)",
        r"not (come|arrive|reach|show)", r"cab (not|never)", r"driver (not|never)",
        r"cancel", r"missed", r"time pe nahi", r"nahi aaya", r"nahi aayi",
    ],
    "eta_tracking": [
        r"\beta\b", r"track", r"live location", r"\bgps\b", r"location", r"google maps?",
        r"where is (my|the) (cab|driver)", r"vehicle location",
    ],
    "routing_pooling": [
        r"\broute", r"routing", r"detour", r"pick ?-?up time", r"long (way|route|ride)",
        r"club(s|bed)?\b", r"pool", r"zig ?zag", r"circuit", r"too many (stops|people|pickups)",
    ],
    "safety": [
        r"safety", r"safe\b", r"unsafe", r"seat ?belt", r"\bsos\b", r"panic", r"rash",
        r"harass", r"women", r"female", r"escort", r"night",
    ],
    "ux_friction": [
        r"forc(e|ing|ed)", r"mandatory", r"no skip", r"skip", r"one more click", r"extra (click|step)",
        r"annoying", r"confus", r"complicated", r"cumbersome", r"\bui\b", r"interface", r"design",
        r"layout", r"too many (clicks|steps|screens)", r"pop ?-?up",
    ],
    "support_grievance": [
        r"support", r"customer care", r"helpdesk", r"help desk", r"no (response|reply)",
        r"complaint", r"grievance", r"nobody (responds|replies)", r"not resolved", r"escalat",
    ],
    "notifications": [r"notification", r"alert", r"reminder", r"sms"],
}

COMPILED = {t: re.compile("|".join(p), re.IGNORECASE) for t, p in THEMES.items()}


def classify_text(text, score):
    text = "" if pd.isna(text) else str(text)
    hits = [t for t, rx in COMPILED.items() if rx.search(text)]
    if not hits:
        words = len(text.split())
        if score <= 2:
            hits = ["vague_negative"] if words <= 6 else ["other_unclassified"]
        elif score >= 4:
            hits = ["positive"]
        else:
            hits = ["neutral_or_mixed"]
    return hits


def main():
    df = pd.read_csv(IN_PATH, parse_dates=["at"])
    df["themes"] = [
        "|".join(classify_text(c, s)) for c, s in zip(df["content"], df["score"])
    ]
    df.to_csv(OUT_PATH, index=False)

    low = df[df["score"] <= 2]
    print(f"Classified {len(df)} reviews ({len(low)} are 1-2 star) -> {OUT_PATH}")
    unclassified = low[low["themes"] == "other_unclassified"]
    print(f"1-2 star reviews needing a new rule: {len(unclassified)} "
          f"({len(unclassified) / max(len(low), 1):.0%}). Read them and extend THEMES.")


if __name__ == "__main__":
    main()