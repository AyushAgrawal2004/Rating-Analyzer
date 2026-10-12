"""
analyze.py - Answer "How are our Play Store ratings?" from data/classified.csv

Usage:
    python analyze.py        # prints report and saves reports/summary.md
"""
import os

import pandas as pd

IN_PATH = "data/classified.csv"
OUT_PATH = "reports/summary.md"
MIN_VERSION_REVIEWS = 10  # ignore versions with fewer reviews than this


def main():
    df = pd.read_csv(IN_PATH, parse_dates=["at"])
    df["themes"] = df["themes"].fillna("")
    out = []
    p = out.append

    latest = df["at"].max()
    p(f"# Play Store ratings summary\n")
    p(f"Data: {len(df)} reviews, {df['at'].min():%Y-%m-%d} to {latest:%Y-%m-%d}\n")

    # 1. Headline numbers
    p("## Headline (from reviews we collected, not the store's all-time rating)")
    p(f"- Average score, all collected reviews: **{df['score'].mean():.2f}**")
    for days in (30, 90):
        recent = df[df["at"] >= latest - pd.Timedelta(days=days)]
        if len(recent):
            p(f"- Last {days} days: **{recent['score'].mean():.2f}** ({len(recent)} reviews)")
    dist = df["score"].value_counts(normalize=True).sort_index()
    p("- Star mix: " + ", ".join(f"{int(k)}★ {v:.0%}" for k, v in dist.items()))

    # 2. Why low ratings happen
    low = df[df["score"] <= 2]
    p(f"\n## What 1-2 star reviews complain about ({len(low)} reviews)")
    if len(low):
        exploded = low.assign(theme=low["themes"].str.split("|")).explode("theme")
        t = exploded.groupby("theme").size().sort_values(ascending=False)
        for theme, n in t.items():
            p(f"- {theme}: {n} ({n / len(low):.0%} of low reviews)")

    # 3. Trend by month
    p("\n## Monthly trend")
    m = df.groupby(df["at"].dt.to_period("M")).agg(reviews=("score", "size"), avg=("score", "mean"),
                                                   pct_low=("score", lambda s: (s <= 2).mean()))
    for period, r in m.tail(12).iterrows():
        p(f"- {period}: avg {r['avg']:.2f}, {r['pct_low']:.0%} low, {int(r['reviews'])} reviews")

    # 4. Version impact (catches a bad release)
    p(f"\n## By app version (versions with {MIN_VERSION_REVIEWS}+ reviews)")
    v = df.dropna(subset=["reviewCreatedVersion"]).groupby("reviewCreatedVersion").agg(
        reviews=("score", "size"), avg=("score", "mean"), pct_low=("score", lambda s: (s <= 2).mean()),
        first_seen=("at", "min"))
    v = v[v["reviews"] >= MIN_VERSION_REVIEWS].sort_values("first_seen", ascending=False)
    for ver, r in v.head(10).iterrows():
        p(f"- {ver}: avg {r['avg']:.2f}, {r['pct_low']:.0%} low, {int(r['reviews'])} reviews")
    if v.empty:
        p("- (not enough reviews per version yet)")

    # 5. Developer replies
    replied = df["replyContent"].notna()
    p("\n## Developer replies")
    p(f"- Reply rate, all reviews: {replied.mean():.1%}")
    if len(low):
        p(f"- Reply rate, 1-2 star reviews: {replied[low.index].mean():.1%}")

    # 6. Reviews worth reading
    p("\n## Most upvoted low reviews (all time)")
    top = low.sort_values(["thumbsUpCount", "at"], ascending=False).head(5)
    for _, r in top.iterrows():
        p(f"- [{r['score']}★, {r['thumbsUpCount']} 👍, v{r['reviewCreatedVersion']}] {str(r['content'])[:200]}")

    text = "\n".join(out)
    os.makedirs("reports", exist_ok=True)
    with open(OUT_PATH, "w", encoding="utf-8") as f:
        f.write(text)
    print(text)
    print(f"\nSaved to {OUT_PATH}")


if __name__ == "__main__":
    main()