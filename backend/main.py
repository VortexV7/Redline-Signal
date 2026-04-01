"""
Internet Mood Map — FastAPI Backend v2
NO API KEYS REQUIRED. Zero signup. Zero credentials.

Data sources:
  1. Reddit public JSON API  — https://www.reddit.com/r/{sub}.json
     Works without any account. Reddit allows public read-only access.
  2. HackerNews Firebase API — https://hacker-news.firebaseio.com
     Fully open, no auth ever.

Sentiment: VADER (runs locally, no external API)
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import httpx
import asyncio
import os
import random
import time
from urllib.parse import quote_plus
import xml.etree.ElementTree as ET
import hashlib
from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer
from dotenv import load_dotenv
from typing import List, Dict, Any, Optional

load_dotenv()

app = FastAPI(title="Internet Mood Map API", version="2.0.0")

# ─── CORS ─────────────────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        os.getenv("FRONTEND_URL", "https://your-app.vercel.app"),
    ],
    allow_credentials=True,
    allow_methods=["GET"],
    allow_headers=["*"],
)

# ─── VADER (local, no API key) ────────────────────────────────────────────────
analyzer = SentimentIntensityAnalyzer()

# ─── Simple in-memory cache — avoids hammering public APIs ───────────────────
_cache: Dict[str, Any] = {"data": [], "timestamp": 0.0}
CACHE_TTL_SECONDS = 300  # 5 minutes


# ─── Geo table ────────────────────────────────────────────────────────────────
SUBREDDIT_LOCATIONS: Dict[str, List[Dict[str, Any]]] = {
    "india":       [{"country": "India", "state": "Delhi",          "city": "New Delhi", "lat": 28.6139, "lng": 77.2090},
                    {"country": "India", "state": "Maharashtra",    "city": "Mumbai",    "lat": 19.0760, "lng": 72.8777},
                    {"country": "India", "state": "Karnataka",      "city": "Bengaluru", "lat": 12.9716, "lng": 77.5946},
                    {"country": "India", "state": "West Bengal",    "city": "Kolkata",   "lat": 22.5726, "lng": 88.3639},
                    {"country": "India", "state": "Telangana",      "city": "Hyderabad", "lat": 17.3850, "lng": 78.4867}],
    "indiaspeaks": [{"country": "India", "state": "Rajasthan",      "city": "Jaipur",    "lat": 26.9124, "lng": 75.7873},
                    {"country": "India", "state": "Gujarat",        "city": "Ahmedabad", "lat": 23.0225, "lng": 72.5714},
                    {"country": "India", "state": "Goa",            "city": "Panaji",    "lat": 15.2993, "lng": 74.1240},
                    {"country": "India", "state": "Chandigarh",     "city": "Chandigarh","lat": 30.7333, "lng": 76.7794},
                    {"country": "India", "state": "Tamil Nadu",     "city": "Chennai",   "lat": 13.0827, "lng": 80.2707}],
    "indianews":   [{"country": "India", "state": "Delhi",          "city": "New Delhi", "lat": 28.6139, "lng": 77.2090},
                    {"country": "India", "state": "Maharashtra",    "city": "Pune",      "lat": 18.5204, "lng": 73.8567},
                    {"country": "India", "state": "Tamil Nadu",     "city": "Coimbatore","lat": 11.0168, "lng": 76.9558},
                    {"country": "India", "state": "Uttar Pradesh",  "city": "Lucknow",   "lat": 26.8467, "lng": 80.9462},
                    {"country": "India", "state": "Maharashtra",    "city": "Nagpur",    "lat": 21.1458, "lng": 79.0882}],
    "indiafinance":[{"country": "India", "state": "Maharashtra",    "city": "Mumbai",    "lat": 19.0760, "lng": 72.8777},
                    {"country": "India", "state": "Karnataka",      "city": "Bengaluru", "lat": 12.9716, "lng": 77.5946},
                    {"country": "India", "state": "Delhi",          "city": "New Delhi", "lat": 28.6139, "lng": 77.2090},
                    {"country": "India", "state": "Madhya Pradesh", "city": "Indore",    "lat": 22.7196, "lng": 75.8577},
                    {"country": "India", "state": "Tamil Nadu",     "city": "Chennai",   "lat": 13.0827, "lng": 80.2707}],
    "bollywood":   [{"country": "India", "state": "Maharashtra",    "city": "Mumbai",    "lat": 19.0760, "lng": 72.8777},
                    {"country": "India", "state": "Delhi",          "city": "Delhi",     "lat": 28.7041, "lng": 77.1025},
                    {"country": "India", "state": "Madhya Pradesh", "city": "Bhopal",    "lat": 23.2599, "lng": 77.4126},
                    {"country": "India", "state": "West Bengal",    "city": "Kolkata",   "lat": 22.5726, "lng": 88.3639},
                    {"country": "India", "state": "Maharashtra",    "city": "Pune",      "lat": 18.5204, "lng": 73.8567}],
    "cricket":     [{"country": "India", "state": "Maharashtra",    "city": "Mumbai",    "lat": 19.0760, "lng": 72.8777},
                    {"country": "India", "state": "Tamil Nadu",     "city": "Chennai",   "lat": 13.0827, "lng": 80.2707},
                    {"country": "India", "state": "Telangana",      "city": "Hyderabad", "lat": 17.3850, "lng": 78.4867},
                    {"country": "India", "state": "Delhi",          "city": "Delhi",     "lat": 28.7041, "lng": 77.1025},
                    {"country": "India", "state": "Rajasthan",      "city": "Jaipur",    "lat": 26.9124, "lng": 75.7873}],
    "worldnews":   [{"country": "United Kingdom", "state": "England",            "city": "London",       "lat": 51.5074,  "lng": -0.1278},
                    {"country": "France",         "state": "Ile-de-France",      "city": "Paris",        "lat": 48.8566,  "lng": 2.3522},
                    {"country": "United States",  "state": "New York",           "city": "New York",     "lat": 40.7128,  "lng": -74.0060},
                    {"country": "Japan",          "state": "Tokyo",              "city": "Tokyo",        "lat": 35.6762,  "lng": 139.6503},
                    {"country": "Australia",      "state": "New South Wales",    "city": "Sydney",       "lat": -33.8688, "lng": 151.2093}],
    "geopolitics": [{"country": "United States",  "state": "District of Columbia","city": "Washington",  "lat": 38.9072,  "lng": -77.0369},
                    {"country": "United Kingdom", "state": "England",            "city": "London",       "lat": 51.5074,  "lng": -0.1278},
                    {"country": "France",         "state": "Ile-de-France",      "city": "Paris",        "lat": 48.8566,  "lng": 2.3522},
                    {"country": "India",          "state": "Delhi",              "city": "New Delhi",    "lat": 28.6139,  "lng": 77.2090},
                    {"country": "Japan",          "state": "Tokyo",              "city": "Tokyo",        "lat": 35.6762,  "lng": 139.6503}],
    "pakistan":    [{"country": "Pakistan",       "state": "Punjab",             "city": "Lahore",       "lat": 31.5204,  "lng": 74.3587},
                    {"country": "Pakistan",       "state": "Sindh",              "city": "Karachi",      "lat": 24.8607,  "lng": 67.0011},
                    {"country": "Pakistan",       "state": "Islamabad Capital Territory", "city": "Islamabad", "lat": 33.6844, "lng": 73.0479},
                    {"country": "Pakistan",       "state": "Khyber Pakhtunkhwa", "city": "Peshawar",     "lat": 34.0151,  "lng": 71.5249},
                    {"country": "Pakistan",       "state": "Balochistan",         "city": "Quetta",       "lat": 30.1798,  "lng": 66.9750}],
    "afghanistan": [{"country": "Afghanistan",    "state": "Kabul",              "city": "Kabul",        "lat": 34.5553,  "lng": 69.2075},
                    {"country": "Afghanistan",    "state": "Herat",              "city": "Herat",        "lat": 34.3529,  "lng": 62.2040},
                    {"country": "Afghanistan",    "state": "Kandahar",           "city": "Kandahar",     "lat": 31.6289,  "lng": 65.7372},
                    {"country": "Afghanistan",    "state": "Nangarhar",          "city": "Jalalabad",    "lat": 34.4340,  "lng": 70.4470},
                    {"country": "Afghanistan",    "state": "Balkh",              "city": "Mazar-i-Sharif","lat": 36.7090, "lng": 67.1109}],
    "news":        [{"country": "United States",  "state": "New York",           "city": "New York",     "lat": 40.7128,  "lng": -74.0060},
                    {"country": "United States",  "state": "California",         "city": "Los Angeles",  "lat": 34.0522,  "lng": -118.2437},
                    {"country": "United States",  "state": "Illinois",           "city": "Chicago",      "lat": 41.8781,  "lng": -87.6298},
                    {"country": "United Kingdom", "state": "England",            "city": "London",       "lat": 51.5074,  "lng": -0.1278},
                    {"country": "France",         "state": "Ile-de-France",      "city": "Paris",        "lat": 48.8566,  "lng": 2.3522}],
    "technology":  [{"country": "United States",  "state": "California",         "city": "Mountain View","lat": 37.3861,  "lng": -122.0839},
                    {"country": "United States",  "state": "Washington",         "city": "Seattle",      "lat": 47.6062,  "lng": -122.3321},
                    {"country": "United Kingdom", "state": "England",            "city": "London",       "lat": 51.5074,  "lng": -0.1278},
                    {"country": "Germany",        "state": "Berlin",             "city": "Berlin",       "lat": 52.5200,  "lng": 13.4050},
                    {"country": "Singapore",      "state": "Central Region",     "city": "Singapore",    "lat": 1.3521,   "lng": 103.8198}],
    "science":     [{"country": "United States",  "state": "Massachusetts",      "city": "Boston",       "lat": 42.3601,  "lng": -71.0589},
                    {"country": "United Kingdom", "state": "England",            "city": "London",       "lat": 51.5074,  "lng": -0.1278},
                    {"country": "Germany",        "state": "Bavaria",            "city": "Munich",       "lat": 48.1351,  "lng": 11.5820},
                    {"country": "United States",  "state": "California",         "city": "Palo Alto",    "lat": 37.4419,  "lng": -122.1430},
                    {"country": "Japan",          "state": "Tokyo",              "city": "Tokyo",        "lat": 35.6762,  "lng": 139.6503}],
    "politics":    [{"country": "United States",  "state": "District of Columbia","city": "Washington",  "lat": 38.9072,  "lng": -77.0369},
                    {"country": "United Kingdom", "state": "England",            "city": "London",       "lat": 51.5074,  "lng": -0.1278},
                    {"country": "France",         "state": "Ile-de-France",      "city": "Paris",        "lat": 48.8566,  "lng": 2.3522},
                    {"country": "Russia",         "state": "Moscow",             "city": "Moscow",       "lat": 55.7558,  "lng": 37.6176},
                    {"country": "China",          "state": "Beijing",            "city": "Beijing",      "lat": 39.9042,  "lng": 116.4074}],
    "environment": [{"country": "Australia",      "state": "New South Wales",    "city": "Sydney",       "lat": -33.8688, "lng": 151.2093},
                    {"country": "Iceland",        "state": "Capital Region",     "city": "Reykjavik",    "lat": 64.1265,  "lng": -21.8174},
                    {"country": "Finland",        "state": "Uusimaa",            "city": "Helsinki",     "lat": 60.1699,  "lng": 24.9384},
                    {"country": "Brazil",         "state": "Rio de Janeiro",     "city": "Rio de Janeiro","lat": -22.9068, "lng": -43.1729},
                    {"country": "Singapore",      "state": "Central Region",     "city": "Singapore",    "lat": 1.3521,   "lng": 103.8198}],
    "gaming":      [{"country": "Japan",          "state": "Tokyo",              "city": "Tokyo",        "lat": 35.6762,  "lng": 139.6503},
                    {"country": "United States",  "state": "California",         "city": "Mountain View","lat": 37.3861,  "lng": -122.0839},
                    {"country": "United Kingdom", "state": "England",            "city": "London",       "lat": 51.5074,  "lng": -0.1278},
                    {"country": "Germany",        "state": "Berlin",             "city": "Berlin",       "lat": 52.5200,  "lng": 13.4050},
                    {"country": "South Korea",    "state": "Seoul",              "city": "Seoul",        "lat": 37.5665,  "lng": 126.9780}],
    "sports":      [{"country": "United States",  "state": "New York",           "city": "New York",     "lat": 40.7128,  "lng": -74.0060},
                    {"country": "United States",  "state": "California",         "city": "Los Angeles",  "lat": 34.0522,  "lng": -118.2437},
                    {"country": "United Kingdom", "state": "England",            "city": "London",       "lat": 51.5074,  "lng": -0.1278},
                    {"country": "Argentina",      "state": "Buenos Aires",       "city": "Buenos Aires", "lat": -34.6037, "lng": -58.3816},
                    {"country": "India",          "state": "Maharashtra",        "city": "Mumbai",       "lat": 19.0760,  "lng": 72.8777}],
    "hackernews":  [{"country": "United States",  "state": "California",         "city": "Mountain View","lat": 37.3861,  "lng": -122.0839},
                    {"country": "United States",  "state": "Washington",         "city": "Seattle",      "lat": 47.6062,  "lng": -122.3321},
                    {"country": "Germany",        "state": "Berlin",             "city": "Berlin",       "lat": 52.5200,  "lng": 13.4050},
                    {"country": "United Kingdom", "state": "England",            "city": "London",       "lat": 51.5074,  "lng": -0.1278},
                    {"country": "Singapore",      "state": "Central Region",     "city": "Singapore",    "lat": 1.3521,   "lng": 103.8198}],
    "twitter":     [{"country": "India",          "state": "Delhi",              "city": "New Delhi",    "lat": 28.6139,  "lng": 77.2090},
                    {"country": "India",          "state": "Maharashtra",        "city": "Mumbai",       "lat": 19.0760,  "lng": 72.8777},
                    {"country": "United States",  "state": "New York",           "city": "New York",     "lat": 40.7128,  "lng": -74.0060},
                    {"country": "United Kingdom", "state": "England",            "city": "London",       "lat": 51.5074,  "lng": -0.1278},
                    {"country": "Pakistan",       "state": "Punjab",             "city": "Lahore",       "lat": 31.5204,  "lng": 74.3587}],
}

DEFAULT_LOCATIONS = [
    {"country": "United States", "state": "New York",        "city": "New York",  "lat": 40.7128,  "lng": -74.0060},
    {"country": "United Kingdom","state": "England",         "city": "London",    "lat": 51.5074,  "lng": -0.1278},
    {"country": "Japan",         "state": "Tokyo",           "city": "Tokyo",     "lat": 35.6762,  "lng": 139.6503},
    {"country": "France",        "state": "Ile-de-France",   "city": "Paris",     "lat": 48.8566,  "lng": 2.3522},
    {"country": "Australia",     "state": "New South Wales", "city": "Sydney",    "lat": -33.8688, "lng": 151.2093},
]

INDIA_SUBREDDITS = {
    "india", "indiaspeaks", "indianews",
    "indiafinance", "bollywood", "cricket",
}

SECURITY_KEYWORDS = [
    "terror", "terrorism", "terrorist", "attack", "blast", "bomb", "bombing",
    "militant", "insurgent", "extremist", "violence", "shooting", "hostage",
    "security alert", "counter-terror", "isis", "al-qaeda", "taliban",
    "is-k", "isis-k", "lashkar-e-taiba", "jaish-e-mohammed", "ceasefire",
    "cross-border", "border clash", "firing", "drone strike",
]

IMPORTANT_NEWS_KEYWORDS = [
    "breaking", "urgent", "major", "critical", "alert", "conflict", "war",
]

PANDEMIC_KEYWORDS = [
    "pandemic", "epidemic", "outbreak", "virus", "flu", "influenza", "covid",
    "covid-19", "covid19", "sars", "h5n1", "quarantine", "lockdown",
    "who alert", "public health emergency",
]


def get_location(source: str) -> Dict[str, Any]:
    locations = SUBREDDIT_LOCATIONS.get(source.lower(), DEFAULT_LOCATIONS)
    base = random.choice(locations)
    jitter = 0.9 if base["country"] == "India" else 3.0
    return {
        "lat": round(base["lat"] + random.uniform(-jitter, jitter), 4),
        "lng": round(base["lng"] + random.uniform(-jitter, jitter), 4),
        "country": base["country"],
        "state": base["state"],
        "city": base["city"],
    }


def analyse(text: str) -> Dict[str, Any]:
    compound = round(analyzer.polarity_scores(text)["compound"], 4)
    if compound >= 0.05:
        label = "positive"
    elif compound <= -0.05:
        label = "negative"
    else:
        label = "neutral"
    return {"score": compound, "sentiment": label}


def is_security_story(text: str) -> bool:
    lowered = text.lower()
    return any(word in lowered for word in SECURITY_KEYWORDS)


def is_pandemic_story(text: str) -> bool:
    lowered = text.lower()
    return any(word in lowered for word in PANDEMIC_KEYWORDS)


def importance_score(text: str, upvotes: int, is_india: bool) -> float:
    lowered = text.lower()
    security_hits = sum(1 for word in SECURITY_KEYWORDS if word in lowered)
    pandemic_hits = sum(1 for word in PANDEMIC_KEYWORDS if word in lowered)
    important_hits = sum(1 for word in IMPORTANT_NEWS_KEYWORDS if word in lowered)
    vote_score = min(max(upvotes, 0), 10000) / 10000.0
    india_boost = 0.75 if is_india else 0.0
    security_boost = 2.0 * security_hits
    pandemic_boost = 1.6 * pandemic_hits
    important_boost = 0.8 * important_hits
    return round(vote_score + india_boost + security_boost + pandemic_boost + important_boost, 4)


def twitter_region_hint(text: str) -> bool:
    lowered = text.lower()
    india_terms = [
        "india", "indian", "delhi", "mumbai", "bengaluru", "bangalore",
        "kolkata", "hyderabad", "chennai", "pune", "lucknow",
    ]
    return any(term in lowered for term in india_terms)


# ─── Reddit public JSON — NO credentials needed ───────────────────────────────
async def fetch_reddit(
    client: httpx.AsyncClient,
    subreddit: str,
    limit: int = 10,
) -> List[Dict[str, Any]]:
    """
    Reddit exposes every subreddit as a public JSON feed.
    No account, no OAuth, no API key — just a normal HTTP GET.
    We use a descriptive User-Agent as good etiquette.
    """
    url = f"https://www.reddit.com/r/{subreddit}/hot.json?limit={limit}"
    headers = {
        "User-Agent": (
            "Mozilla/5.0 (compatible; InternetMoodMap/2.0; "
            "educational project)"
        ),
        "Accept": "application/json",
    }

    try:
        resp = await client.get(url, headers=headers, timeout=12)

        if resp.status_code == 429:
            print(f"[WARN] Reddit rate-limited r/{subreddit} — skipping")
            return []
        if resp.status_code != 200:
            print(f"[WARN] r/{subreddit} returned HTTP {resp.status_code}")
            return []

        children = resp.json().get("data", {}).get("children", [])
        results: List[Dict[str, Any]] = []

        for child in children:
            p    = child.get("data", {})
            text = (p.get("title") or "").strip()

            # Skip stickied mod posts and empty titles
            if not text or p.get("stickied", False):
                continue

            sa  = analyse(text)
            loc = get_location(subreddit)
            is_india = (subreddit.lower() in INDIA_SUBREDDITS) or (loc["country"] == "India")
            upvotes = int(p.get("score", 0))
            security = is_security_story(text)
            pandemic = is_pandemic_story(text)

            results.append({
                "id":        p.get("id", str(random.randint(100000, 999999))),
                "text":      text[:200],
                "subreddit": subreddit,
                "source":    "reddit",
                "sentiment": sa["sentiment"],
                "score":     sa["score"],
                "upvotes":   upvotes,
                "lat":       loc["lat"],
                "lng":       loc["lng"],
                "country":   loc["country"],
                "state":     loc["state"],
                "city":      loc["city"],
                "region":    "india" if is_india else "global",
                "security":  security,
                "pandemic":  pandemic,
                "priority":  importance_score(text, upvotes, is_india),
                "url":       "https://reddit.com" + p.get("permalink", "/"),
            })

        return results

    except httpx.TimeoutException:
        print(f"[WARN] Timeout fetching r/{subreddit}")
        return []
    except Exception as exc:
        print(f"[WARN] Reddit r/{subreddit} failed: {exc}")
        return []


# ─── HackerNews Firebase API — always free, always open ──────────────────────
async def fetch_hackernews(
    client: httpx.AsyncClient,
    limit: int = 15,
) -> List[Dict[str, Any]]:
    """
    HackerNews provides a public Firebase REST API.
    Step 1: GET /v0/topstories.json  → list of story IDs
    Step 2: GET /v0/item/{id}.json   → individual story
    Both endpoints are fully open with no authentication.
    """
    try:
        ids_resp = await client.get(
            "https://hacker-news.firebaseio.com/v0/topstories.json",
            timeout=10,
        )
        if ids_resp.status_code != 200:
            print("[WARN] HackerNews top stories request failed")
            return []

        story_ids: List[int] = ids_resp.json()[:limit]

        async def fetch_one(sid: int) -> Optional[Dict[str, Any]]:
            try:
                r = await client.get(
                    f"https://hacker-news.firebaseio.com/v0/item/{sid}.json",
                    timeout=8,
                )
                if r.status_code != 200:
                    return None

                item  = r.json()
                if not item or item.get("type") != "story":
                    return None

                title = (item.get("title") or "").strip()
                if not title:
                    return None

                sa  = analyse(title)
                loc = get_location("hackernews")
                is_india = loc["country"] == "India"
                upvotes = int(item.get("score", 0))
                security = is_security_story(title)
                pandemic = is_pandemic_story(title)

                return {
                    "id":        str(item.get("id", sid)),
                    "text":      title[:200],
                    "subreddit": "hackernews",
                    "source":    "hackernews",
                    "sentiment": sa["sentiment"],
                    "score":     sa["score"],
                    "upvotes":   upvotes,
                    "lat":       loc["lat"],
                    "lng":       loc["lng"],
                    "country":   loc["country"],
                    "state":     loc["state"],
                    "city":      loc["city"],
                    "region":    "india" if is_india else "global",
                    "security":  security,
                    "pandemic":  pandemic,
                    "priority":  importance_score(title, upvotes, is_india),
                    "url":       item.get("url")
                               or f"https://news.ycombinator.com/item?id={sid}",
                }
            except Exception:
                return None

        items   = await asyncio.gather(*[fetch_one(sid) for sid in story_ids])
        return [i for i in items if i is not None]

    except Exception as exc:
        print(f"[WARN] HackerNews fetch failed: {exc}")
        return []


async def fetch_twitter_public(
    client: httpx.AsyncClient,
    limit_per_query: int = 8,
) -> List[Dict[str, Any]]:
    """
    Optional public Twitter/X fetch via Nitter RSS.
    This avoids requiring official API keys, but may be unavailable depending on instance health.
    """
    env_instances = os.getenv("NITTER_INSTANCES", "").strip()
    if env_instances:
        instances = [i.strip().rstrip("/") for i in env_instances.split(",") if i.strip()]
    else:
        instances = []
    if not instances:
        instances = [
            os.getenv("NITTER_INSTANCE", "https://nitter.net").rstrip("/"),
            "https://nitter.poast.org",
            "https://nitter.privacydev.net",
            "https://nitter.1d4.us",
        ]
    queries = [
        "india breaking news",
        "world breaking news",
        "security incident",
        "pandemic update",
    ]
    handles = [
        "Reuters",
        "BBCWorld",
        "AP",
        "ANI",
        "ndtv",
        "timesofindia",
        "AlJazeera",
    ]

    results: List[Dict[str, Any]] = []
    seen_links = set()

    def _extract_items(root: ET.Element) -> List[tuple[str, str]]:
        extracted: List[tuple[str, str]] = []
        channel = root.find("channel")
        if channel is not None:
            for item in channel.findall("item"):
                title = (item.findtext("title") or "").strip()
                link = (item.findtext("link") or "").strip()
                if title and link:
                    extracted.append((title, link))
        if extracted:
            return extracted

        # Atom fallback
        for entry in root.findall(".//{*}entry"):
            title = (entry.findtext("{*}title") or "").strip()
            link_node = entry.find("{*}link")
            link = ""
            if link_node is not None:
                link = (link_node.attrib.get("href") or "").strip()
            if title and link:
                extracted.append((title, link))
        return extracted

    for instance in instances:
        feed_urls = [f"{instance}/search/rss?f=tweets&q={quote_plus(query)}" for query in queries]
        feed_urls.extend([f"{instance}/{handle}/rss" for handle in handles])
        for url in feed_urls:
            try:
                resp = await client.get(
                    url,
                    timeout=10,
                    headers={
                        "User-Agent": (
                            "Mozilla/5.0 (compatible; InternetMoodMap/2.0; "
                            "public-rss-fetch)"
                        )
                    },
                )
                if resp.status_code != 200:
                    continue

                root = ET.fromstring(resp.text)
                items = _extract_items(root)[:limit_per_query]
                if not items:
                    continue

                for title, link in items:
                    if not title or not link or link in seen_links:
                        continue
                    seen_links.add(link)

                    # Remove author prefix if present: "username: tweet text"
                    text = title.split(":", 1)[1].strip() if ":" in title else title
                    if not text:
                        continue

                    sa = analyse(text)
                    loc = get_location("twitter")
                    is_india = twitter_region_hint(text) or (loc["country"] == "India")
                    security = is_security_story(text)
                    pandemic = is_pandemic_story(text)

                    tw_id = hashlib.sha1(link.encode("utf-8")).hexdigest()[:12]
                    results.append({
                        "id":        f"tw-{tw_id}",
                        "text":      text[:220],
                        "subreddit": "twitter",
                        "source":    "twitter",
                        "sentiment": sa["sentiment"],
                        "score":     sa["score"],
                        "upvotes":   0,
                        "lat":       loc["lat"],
                        "lng":       loc["lng"],
                        "country":   loc["country"],
                        "state":     loc["state"],
                        "city":      loc["city"],
                        "region":    "india" if is_india else "global",
                        "security":  security,
                        "pandemic":  pandemic,
                        "priority":  importance_score(text, 0, is_india),
                        "url":       link,
                    })
            except Exception:
                continue

    return results


# ─── Aggregate all sources ────────────────────────────────────────────────────
def _sort_posts(posts: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    return sorted(
        posts,
        key=lambda p: (
            float(p.get("priority", 0.0)),
            int(p.get("upvotes", 0)),
            float(abs(p.get("score", 0.0))),
        ),
        reverse=True,
    )


def _post_key(post: Dict[str, Any]) -> str:
    return f'{post.get("source", "unknown")}:{post.get("id", "")}'


def blend_priority_feed(posts: List[Dict[str, Any]], max_total: int = 140) -> List[Dict[str, Any]]:
    india_posts = [p for p in posts if p.get("region") == "india"]
    global_posts = [p for p in posts if p.get("region") != "india"]
    twitter_posts = [p for p in posts if p.get("source") == "twitter"]

    india_security = [p for p in india_posts if p.get("security")]
    global_security = [p for p in global_posts if p.get("security")]

    selected: List[Dict[str, Any]] = []
    seen = set()

    def add_posts(candidates: List[Dict[str, Any]], limit: int) -> None:
        if limit <= 0:
            return
        added = 0
        for post in _sort_posts(candidates):
            key = _post_key(post)
            if key in seen:
                continue
            selected.append(post)
            seen.add(key)
            added += 1
            if len(selected) >= max_total:
                break
            if added >= limit:
                break

    india_target = int(max_total * 0.65)
    global_target = max_total - india_target
    twitter_target = max(8, max_total // 14)
    india_security_target = max(16, india_target // 4)
    global_security_target = max(8, global_target // 4)

    # Ensure Twitter is visible when available.
    add_posts(twitter_posts, min(twitter_target, len(twitter_posts)))

    add_posts(india_security, min(india_security_target, len(india_security)))
    add_posts(global_security, min(global_security_target, len(global_security)))

    add_posts(india_posts, max(0, india_target - len([p for p in selected if p.get("region") == "india"])))
    add_posts(global_posts, max(0, global_target - len([p for p in selected if p.get("region") != "india"])))

    if len(selected) < max_total:
        add_posts(posts, max_total - len(selected))

    return selected[:max_total]


async def build_data() -> List[Dict[str, Any]]:
    global_subreddits = [
        "worldnews", "news", "geopolitics", "politics",
        "pakistan", "afghanistan",
        "technology", "science", "environment",
        "gaming", "sports",
    ]
    india_subreddits = [
        "india", "indiaspeaks", "indianews",
        "indiafinance", "bollywood", "cricket",
    ]

    async with httpx.AsyncClient() as client:
        tasks = [fetch_reddit(client, sub, limit=6) for sub in global_subreddits]
        tasks.extend([fetch_reddit(client, sub, limit=10) for sub in india_subreddits])
        tasks.append(fetch_hackernews(client, limit=15))
        tasks.append(fetch_twitter_public(client, limit_per_query=10))
        batches = await asyncio.gather(*tasks)

    posts = [p for batch in batches for p in batch]
    blended = blend_priority_feed(posts, max_total=140)
    counts: Dict[str, int] = {}
    for p in blended:
        src = str(p.get("source", "unknown"))
        counts[src] = counts.get(src, 0) + 1
    print(f"[INFO] Source counts in blended feed: {counts}")
    return blended


# ─── Routes ───────────────────────────────────────────────────────────────────

@app.get("/")
def root():
    return {
        "status":  "ok",
        "version": "2.0.0",
        "message": "Internet Mood Map API — no credentials required",
        "sources": ["reddit-public-json", "hackernews-firebase"],
    }


@app.get("/health")
def health():
    return {"status": "healthy"}


@app.get("/api/mood")
async def get_mood_data() -> List[Dict[str, Any]]:
    global _cache

    # Return cached data if still fresh
    if _cache["data"] and (time.time() - _cache["timestamp"]) < CACHE_TTL_SECONDS:
        return _cache["data"]

    try:
        data = await build_data()

        if not data:
            # Serve stale cache rather than a 503 if we have anything
            if _cache["data"]:
                print("[WARN] All sources failed — serving stale cache")
                return _cache["data"]
            raise HTTPException(
                status_code=503,
                detail=(
                    "Could not fetch data from Reddit or HackerNews. "
                    "Both sources may be temporarily unavailable. "
                    "Please try again in a minute."
                ),
            )

        _cache["data"]      = data
        _cache["timestamp"] = time.time()
        return data

    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))


@app.get("/api/mood/stats")
async def get_stats() -> Dict[str, Any]:
    data  = await get_mood_data()
    total = len(data)

    if total == 0:
        return {
            "total": 0, "positive": 0,
            "negative": 0, "neutral": 0,
            "average_score": 0.0, "mood": "neutral",
        }

    pos = sum(1 for d in data if d["sentiment"] == "positive")
    neg = sum(1 for d in data if d["sentiment"] == "negative")
    neu = total - pos - neg
    avg = round(sum(d["score"] for d in data) / total, 4)

    return {
        "total":         total,
        "positive":      pos,
        "negative":      neg,
        "neutral":       neu,
        "average_score": avg,
        "mood":          "positive" if avg > 0.05 else "negative" if avg < -0.05 else "neutral",
    }
