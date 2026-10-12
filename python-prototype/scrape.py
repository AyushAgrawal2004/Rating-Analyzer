"""
scrape.py - Pull Play Store reviews and append only NEW ones to data/reviews.csv

Setup:
    pip install google-play-scraper pandas

Usage:
    python scrape.py com.package.id.one com.package.id.two
    python scrape.py com.package.id.one --count 5000
"""
import argparse
import os
import sys
import time

import pandas as pd
from google_play_scraper import Sort, app, reviews

OUT_PATH = "data/reviews.csv"
COLUMNS = [
    "reviewId", "package", "userName", "score", "content", "thumbsUpCount",
    "reviewCreatedVersion", "at", "replyContent", "repliedAt",
]


def fetch_reviews(package, max_count, lang="en", country="in"):
    """Fetch up to max_count newest reviews, in batches, for one app."""
    collected, token = [], None
    while len(collected) < max_count:
        batch, token = reviews(
            package,
            lang=lang,
            country=country,
            sort=Sort.NEWEST,
            count=min(200, max_count - len(collected)),
            continuation_token=token,
        )
        if not batch:
            break
        collected.extend(batch)
        if token is None:
            break
        time.sleep(1)  # be polite to the endpoint
    df = pd.DataFrame(collected)
    if df.empty:
        return pd.DataFrame(columns=COLUMNS)
    df["package"] = package
    return df.reindex(columns=COLUMNS)


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("packages", nargs="+", help="Play Store package IDs")
    parser.add_argument("--count", type=int, default=3000,
                        help="Max reviews per app per run (default 3000)")
    args = parser.parse_args()

    os.makedirs("data", exist_ok=True)
    existing = pd.read_csv(OUT_PATH) if os.path.exists(OUT_PATH) else pd.DataFrame(columns=COLUMNS)
    known_ids = set(existing["reviewId"])

    new_frames = []
    for pkg in args.packages:
        try:
            info = app(pkg, lang="en", country="in")
            print(f"{pkg}: '{info['title']}' | rating {info['score']} "
                  f"| {info['ratings']} ratings | version {info['version']}")
        except Exception as e:
            print(f"Could not load app info for {pkg}: {e}", file=sys.stderr)
            continue

        df = fetch_reviews(pkg, args.count)
        df = df[~df["reviewId"].isin(known_ids)]
        print(f"  fetched {len(df)} new reviews")
        new_frames.append(df)

    if not new_frames:
        print("Nothing fetched.")
        return

    combined = pd.concat([existing] + new_frames, ignore_index=True)
    combined = combined.drop_duplicates(subset="reviewId").sort_values("at", ascending=False)
    combined.to_csv(OUT_PATH, index=False)
    print(f"Saved {len(combined)} total reviews to {OUT_PATH}")


if __name__ == "__main__":
    main()
