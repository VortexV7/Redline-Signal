// src/lib/api.ts
// All types and API functions for the Internet Mood Map

export interface MoodPost {
  id:        string;
  text:      string;
  source?:   "reddit" | "hackernews" | "twitter" | string;
  subreddit: string;
  country?:  string;
  state?:    string;
  city?:     string;
  security?: boolean;
  pandemic?: boolean;
  sentiment: "positive" | "negative" | "neutral";
  score:     number;
  upvotes:   number;
  lat:       number;
  lng:       number;
  url:       string;
}

export interface MoodStats {
  total:         number;
  positive:      number;
  negative:      number;
  neutral:       number;
  average_score: number;
  mood:          "positive" | "negative" | "neutral";
}

const BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
const REQUEST_TIMEOUT_MS = 12000;

async function fetchJson<T>(path: string): Promise<T> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const res = await fetch(`${BASE}${path}`, {
      cache: "no-store",
      signal: controller.signal,
    });

    if (!res.ok) {
      let detail = "";
      try {
        const body = await res.json();
        if (typeof body?.detail === "string") detail = ` - ${body.detail}`;
      } catch {
        // Ignore non-JSON response bodies.
      }
      throw new Error(`API error: ${res.status}${detail}`);
    }

    return res.json();
  } catch (error: unknown) {
    if (error instanceof DOMException && error.name === "AbortError") {
      throw new Error(`Request timed out after ${REQUEST_TIMEOUT_MS / 1000}s`);
    }
    if (error instanceof TypeError) {
      throw new Error(`Cannot reach backend at ${BASE}`);
    }
    throw error;
  } finally {
    clearTimeout(timeout);
  }
}

export async function fetchMoodData(): Promise<MoodPost[]> {
  return fetchJson<MoodPost[]>("/api/mood");
}

export async function fetchMoodStats(): Promise<MoodStats> {
  return fetchJson<MoodStats>("/api/mood/stats");
}

export function deriveMoodStats(posts: MoodPost[]): MoodStats {
  const total = posts.length;
  if (total === 0) {
    return {
      total: 0,
      positive: 0,
      negative: 0,
      neutral: 0,
      average_score: 0.0,
      mood: "neutral",
    };
  }

  const positive = posts.filter((p) => p.sentiment === "positive").length;
  const negative = posts.filter((p) => p.sentiment === "negative").length;
  const neutral = total - positive - negative;
  const average_score = Number(
    (posts.reduce((sum, p) => sum + p.score, 0) / total).toFixed(4),
  );
  const mood =
    average_score > 0.05
      ? "positive"
      : average_score < -0.05
      ? "negative"
      : "neutral";

  return { total, positive, negative, neutral, average_score, mood };
}

export function sentimentColor(sentiment: MoodPost["sentiment"]): string {
  switch (sentiment) {
    case "positive": return "#888888";   // grey
    case "negative": return "#e63329";   // red
    default:         return "#f5f5f5";   // white
  }
}

export function sentimentBorder(sentiment: MoodPost["sentiment"]): string {
  switch (sentiment) {
    case "positive": return "#555555";
    case "negative": return "#9b1c17";
    default:         return "#aaaaaa";
  }
}
