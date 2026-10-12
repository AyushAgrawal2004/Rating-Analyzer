"""
classify_llm.py - Second pass: use a free Gemini model to label the 1-2 star reviews
that the keyword rules could not explain (vague_negative / other_unclassified).

Setup:
    pip install google-genai pandas
    export GEMINI_API_KEY="your-new-key"      # never paste the key into this file

Usage:
    python3 classify_llm.py --limit 20        # small test first
    python3 classify_llm.py                   # all unlabelled low reviews

Order of the pipeline:  scrape.py -> classify.py -> classify_llm.py -> analyze.py
Results are cached in data/llm_cache.json, so each review is sent to the API only once.
"""
import argparse
import json
import os
import sys
import time

import pandas as pd

PATH = "data/classified.csv"
CACHE_PATH = "data/llm_cache.json"
DEFAULT_MODEL = os.environ.get("GEMINI_MODEL", "gemini-3.5-flash")
TARGET_THEMES = {"vague_negative", "other_unclassified"}

ALLOWED = [
    "update_regression", "app_crash_wont_open", "login_access", "booking_failure",
    "late_or_no_cab", "eta_tracking", "routing_pooling", "safety", "ux_friction",
    "support_grievance", "notifications", "other", "no_detail",
]

PROMPT = """You label Play Store reviews of an employee commute app (employees book office cabs/shuttles,
get a pickup time, track the vehicle, verify with OTP, and raise issues to support).
Reviews may be English, Hindi, or mixed Hinglish.

For each review, choose 1-3 themes from this exact list:
{themes}

Theme meanings:
- update_regression: complaint about a new version/update making things worse
- app_crash_wont_open: crashes, freezes, won't open, loading forever
- login_access: cannot log in, account/verification problems
- booking_failure: cannot book/schedule, waitlist, slot or roster problems
- late_or_no_cab: cab late, did not arrive, trip cancelled, driver issues
- eta_tracking: wrong ETA, wrong live location, GPS/map problems
- routing_pooling: bad routes, long detours, pooling too many people
- safety: safety, SOS, women's safety, seatbelt, unsafe driving
- ux_friction: confusing or annoying UI, too many steps, forced actions
- support_grievance: support did not respond, complaints not resolved
- notifications: missing or wrong notifications
- other: a real complaint that fits none of the above
- no_detail: negative but gives no reason (e.g. "worst app")

Return ONLY a JSON array, one object per review, in this form:
[{{"id": 1, "themes": ["eta_tracking"], "reason": "5-10 word summary"}}]

Reviews:
{reviews}
"""


def load_cache():
    if os.path.exists(CACHE_PATH):
        with open(CACHE_PATH, encoding="utf-8") as f:
            return json.load(f)
    return {}


def save_cache(cache):
    with open(CACHE_PATH, "w", encoding="utf-8") as f:
        json.dump(cache, f, ensure_ascii=False, indent=1)


def call_model(client, model, batch, retries=4):
    from google.genai import types

    reviews_text = "\n".join(f'{i}. {str(t)[:500]!r}' for i, (_, t) in enumerate(batch, 1))
    prompt = PROMPT.format(themes=", ".join(ALLOWED), reviews=reviews_text)
    for attempt in range(retries):
        try:
            resp = client.models.generate_content(
                model=model,
                contents=prompt,
                config=types.GenerateContentConfig(
                    response_mime_type="application/json", temperature=0),
            )
            data = json.loads(resp.text)
            return {int(d["id"]): d for d in data}
        except Exception as e:  # rate limit (429), bad JSON, network, etc.
            if "404" in str(e) or "NOT_FOUND" in str(e):
                sys.exit(f"Model '{model}' is not available to your key. "
                         "Run: python3 classify_llm.py --list-models  and pick one with --model <name>")
            wait = 10 * (2 ** attempt)
            print(f"  attempt {attempt + 1} failed ({type(e).__name__}: {str(e)[:120]}); retrying in {wait}s")
            time.sleep(wait)
    return {}


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--limit", type=int, default=None, help="max reviews to send this run")
    ap.add_argument("--batch-size", type=int, default=20)
    ap.add_argument("--model", default=DEFAULT_MODEL)
    ap.add_argument("--sleep", type=float, default=5.0, help="seconds between requests")
    ap.add_argument("--list-models", action="store_true", help="print models your key can use, then exit")
    args = ap.parse_args()

    key = os.environ.get("GEMINI_API_KEY")
    if not key:
        sys.exit("Set GEMINI_API_KEY first:  export GEMINI_API_KEY=\"your-key\"")

    from google import genai
    client = genai.Client(api_key=key)

    if args.list_models:
        for m in client.models.list():
            if "generateContent" in (getattr(m, "supported_actions", None) or []):
                print(m.name.replace("models/", ""))
        return

    df = pd.read_csv(PATH)
    df["themes"] = df["themes"].fillna("")
    cache = load_cache()

    is_target = (df["score"] <= 2) & df["themes"].isin(TARGET_THEMES)
    todo = df[is_target & ~df["reviewId"].isin(cache.keys())]
    if args.limit:
        todo = todo.head(args.limit)
    print(f"{int(is_target.sum())} low reviews need LLM labels; {len(todo)} not yet cached -> sending now")

    rows = list(zip(todo["reviewId"], todo["content"]))
    try:
        for start in range(0, len(rows), args.batch_size):
            batch = rows[start:start + args.batch_size]
            result = call_model(client, args.model, batch)
            for i, (rid, _) in enumerate(batch, 1):
                r = result.get(i)
                if not r:
                    continue
                themes = [t for t in r.get("themes", []) if t in ALLOWED]
                if themes:
                    cache[rid] = {"themes": themes, "reason": r.get("reason", "")}
            save_cache(cache)
            print(f"  done {min(start + args.batch_size, len(rows))}/{len(rows)}")
            time.sleep(args.sleep)
    except KeyboardInterrupt:
        print("\nStopped early. Saving what we have and merging it into the file...")
        save_cache(cache)

    # Apply cached labels to the classified file
    applied = 0
    for idx, row in df[is_target].iterrows():
        c = cache.get(row["reviewId"])
        if c:
            df.at[idx, "themes"] = "|".join(c["themes"])
            applied += 1
    df.to_csv(PATH, index=False)
    print(f"Applied LLM labels to {applied} reviews -> {PATH}")


if __name__ == "__main__":
    main()