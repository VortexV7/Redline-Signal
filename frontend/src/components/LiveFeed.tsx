"use client";
// src/components/LiveFeed.tsx

import { useEffect, useMemo, useRef, useState } from "react";
import type { MoodPost } from "@/lib/api";

interface LiveFeedProps {
  posts:    MoodPost[];
  loading:  boolean;
  onSelect: (post: MoodPost) => void;
}

function sentimentStyle(s: MoodPost["sentiment"]): { color: string; label: string } {
  switch (s) {
    case "positive": return { color: "#888", label: "POS" };
    case "negative": return { color: "#e63329", label: "NEG" };
    default:         return { color: "#f5f5f5", label: "NEU" };
  }
}

function isSecurityPost(text: string): boolean {
  const securityRegex =
    /\b(terror|terrorism|attack|blast|bomb|bombing|militant|insurgent|extremist|violence|shooting)\b/i;
  return securityRegex.test(text);
}

function isPandemicPost(text: string): boolean {
  const pandemicRegex =
    /\b(pandemic|epidemic|outbreak|virus|flu|influenza|covid|covid-19|covid19|sars|h5n1|quarantine|lockdown)\b/i;
  return pandemicRegex.test(text);
}

function sourceBarColor(source?: string): string {
  const s = (source || "").toLowerCase();
  if (s === "reddit") return "#ff7a00";
  if (s === "twitter") return "#1d9bf0";
  if (s === "hackernews") return "#ff6600";
  return "#333";
}

export default function LiveFeed({ posts, loading, onSelect }: LiveFeedProps) {
  const listRef = useRef<HTMLDivElement>(null);
  const [countryFilter, setCountryFilter] = useState("All");
  const [stateFilter, setStateFilter] = useState("All");
  const [cityFilter, setCityFilter] = useState("All");
  const [platformFilter, setPlatformFilter] = useState<"all" | "reddit" | "twitter" | "hackernews">("all");
  const [topicFilter, setTopicFilter] = useState<"all" | "general" | "security" | "pandemic">("all");

  const sourceOf = (p: MoodPost): string => (p.source || (p.subreddit === "twitter" ? "twitter" : "reddit")).toLowerCase();

  const countries = useMemo(
    () => ["All", ...Array.from(new Set(posts.map((p) => p.country || "Unknown"))).sort()],
    [posts],
  );

  const states = useMemo(() => {
    const scoped = posts.filter((p) => countryFilter === "All" || (p.country || "Unknown") === countryFilter);
    return ["All", ...Array.from(new Set(scoped.map((p) => p.state || "Unknown"))).sort()];
  }, [posts, countryFilter]);

  const cities = useMemo(() => {
    const scoped = posts.filter((p) => {
      const pCountry = p.country || "Unknown";
      const pState = p.state || "Unknown";
      return (
        (countryFilter === "All" || pCountry === countryFilter) &&
        (stateFilter === "All" || pState === stateFilter)
      );
    });
    return ["All", ...Array.from(new Set(scoped.map((p) => p.city || "Unknown"))).sort()];
  }, [posts, countryFilter, stateFilter]);

  const filteredPosts = useMemo(() => {
    return posts.filter((p) => {
      const pCountry = p.country || "Unknown";
      const pState = p.state || "Unknown";
      const pCity = p.city || "Unknown";
      const source = sourceOf(p);
      const security = typeof p.security === "boolean" ? p.security : isSecurityPost(p.text);
      const pandemic = typeof p.pandemic === "boolean" ? p.pandemic : isPandemicPost(p.text);

      const platformMatch =
        platformFilter === "all" ||
        (platformFilter === "reddit" && source === "reddit") ||
        (platformFilter === "twitter" && source === "twitter") ||
        (platformFilter === "hackernews" && source === "hackernews");

      const locationMatch =
        (countryFilter === "All" || pCountry === countryFilter) &&
        (stateFilter === "All" || pState === stateFilter) &&
        (cityFilter === "All" || pCity === cityFilter);

      const topicMatch =
        topicFilter === "all" ||
        (topicFilter === "security" && security) ||
        (topicFilter === "pandemic" && pandemic) ||
        (topicFilter === "general" && !security && !pandemic);

      return platformMatch && locationMatch && topicMatch;
    });
  }, [posts, platformFilter, countryFilter, stateFilter, cityFilter, topicFilter]);

  // Auto-scroll to bottom when new posts arrive
  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [filteredPosts]);

  useEffect(() => {
    if (countryFilter !== "All" && !countries.includes(countryFilter)) {
      setCountryFilter("All");
    }
  }, [countries, countryFilter]);

  useEffect(() => {
    if (stateFilter !== "All" && !states.includes(stateFilter)) {
      setStateFilter("All");
    }
  }, [states, stateFilter]);

  useEffect(() => {
    if (cityFilter !== "All" && !cities.includes(cityFilter)) {
      setCityFilter("All");
    }
  }, [cities, cityFilter]);

  return (
    <aside
      className="flex flex-col shrink-0"
      style={{
        width:      "300px",
        background: "#0a0a0a",
        borderLeft: "1px solid #1a1a1a",
      }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-3 shrink-0"
        style={{ borderBottom: "1px solid #1a1a1a" }}
      >
        <span
          className="text-xs tracking-widest uppercase"
          style={{ color: "#3a3a3a" }}
        >
          LIVE FEED
        </span>
        {loading && (
          <span
            className="text-xs animate-pulse"
            style={{ color: "#555", letterSpacing: "0.1em" }}
          >
            LOADING...
          </span>
        )}
        {!loading && filteredPosts.length > 0 && (
          <span className="text-xs" style={{ color: "#3a3a3a" }}>
            {filteredPosts.length}/{posts.length}
          </span>
        )}
      </div>

      {/* Filters */}
      <div className="px-4 py-3 space-y-2 shrink-0" style={{ borderBottom: "1px solid #1a1a1a" }}>
        <div className="grid grid-cols-2 gap-2">
          <label className="flex flex-col gap-1">
            <span className="text-[10px] uppercase" style={{ color: "#666", letterSpacing: "0.1em" }}>
              Country
            </span>
            <select
              value={countryFilter}
              onChange={(e) => {
                setCountryFilter(e.target.value);
                setStateFilter("All");
                setCityFilter("All");
              }}
              className="text-xs px-2 py-1"
              style={{ background: "#111", color: "#888", border: "1px solid #222" }}
            >
              {countries.map((country) => (
                <option key={country} value={country}>
                  {country}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-[10px] uppercase" style={{ color: "#666", letterSpacing: "0.1em" }}>
              State
            </span>
            <select
              value={stateFilter}
              onChange={(e) => {
                setStateFilter(e.target.value);
                setCityFilter("All");
              }}
              className="text-xs px-2 py-1"
              style={{ background: "#111", color: "#888", border: "1px solid #222" }}
            >
              {states.map((state) => (
                <option key={state} value={state}>
                  {state}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <label className="flex flex-col gap-1">
            <span className="text-[10px] uppercase" style={{ color: "#666", letterSpacing: "0.1em" }}>
              Platform
            </span>
            <select
              value={platformFilter}
              onChange={(e) => setPlatformFilter(e.target.value as "all" | "reddit" | "twitter" | "hackernews")}
              className="text-xs px-2 py-1"
              style={{ background: "#111", color: "#888", border: "1px solid #222" }}
            >
              <option value="all">All Platforms</option>
              <option value="reddit">Reddit</option>
              <option value="twitter">Twitter/X</option>
              <option value="hackernews">HackerNews</option>
            </select>
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-[10px] uppercase" style={{ color: "#666", letterSpacing: "0.1em" }}>
              City
            </span>
            <select
              value={cityFilter}
              onChange={(e) => setCityFilter(e.target.value)}
              className="text-xs px-2 py-1"
              style={{ background: "#111", color: "#888", border: "1px solid #222" }}
            >
              {cities.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>
          </label>
        </div>

        <label className="flex flex-col gap-1">
          <span className="text-[10px] uppercase" style={{ color: "#666", letterSpacing: "0.1em" }}>
            Topic
          </span>
          <select
            value={topicFilter}
            onChange={(e) => setTopicFilter(e.target.value as "all" | "general" | "security" | "pandemic")}
            className="text-xs px-2 py-1"
            style={{ background: "#111", color: "#888", border: "1px solid #222" }}
          >
            <option value="all">All Topics</option>
            <option value="general">General</option>
            <option value="security">Security</option>
            <option value="pandemic">Pandemic</option>
          </select>
        </label>
      </div>

      {/* Feed list */}
      <div
        ref={listRef}
        className="flex-1 overflow-y-auto"
        style={{ scrollbarWidth: "thin" }}
      >
        {loading && posts.length === 0 ? (
          <div className="p-4 space-y-3">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="space-y-2 animate-pulse">
                <div style={{ height: "8px", width: "40%", background: "#1a1a1a", borderRadius: "2px" }} />
                <div style={{ height: "10px", width: "100%", background: "#1a1a1a", borderRadius: "2px" }} />
                <div style={{ height: "10px", width: "80%", background: "#1a1a1a", borderRadius: "2px" }} />
              </div>
            ))}
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="p-4 text-xs" style={{ color: "#555" }}>
            No posts found for selected filters.
          </div>
        ) : (
          filteredPosts.map((post, idx) => {
            const { color, label } = sentimentStyle(post.sentiment);
            const security = typeof post.security === "boolean" ? post.security : isSecurityPost(post.text);
            const pandemic = typeof post.pandemic === "boolean" ? post.pandemic : isPandemicPost(post.text);
            const sourceColor = sourceBarColor(post.source);
            return (
              <button
                key={post.id}
                onClick={() => onSelect(post)}
                className="w-full text-left px-4 py-3 animate-slideUp"
                style={{
                  borderLeft:      `3px solid ${sourceColor}`,
                  borderBottom:    "1px solid #111",
                  animationDelay:  `${idx * 20}ms`,
                  cursor:          "pointer",
                  background:      "transparent",
                  transition:      "background 0.15s",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.background = "#111";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.background = "transparent";
                }}
              >
                {/* Sentiment + subreddit */}
                <div className="flex items-center justify-between mb-1">
                  <span
                    className="text-xs font-bold"
                    style={{ color, letterSpacing: "0.1em" }}
                  >
                    {label}
                  </span>
                  <div className="flex items-center gap-2">
                    {security && (
                      <span className="text-[10px] px-1 py-[1px]" style={{ color: "#777", border: "1px solid #333" }}>
                        SECURITY
                      </span>
                    )}
                    {pandemic && (
                      <span className="text-[10px] px-1 py-[1px]" style={{ color: "#779", border: "1px solid #334" }}>
                        PANDEMIC
                      </span>
                    )}
                    <span
                      className="text-xs"
                      style={{ color: "#3a3a3a", letterSpacing: "0.05em" }}
                    >
                      {sourceOf(post).toUpperCase()} • {sourceOf(post) === "twitter" ? "@feed" : `r/${post.subreddit}`}
                    </span>
                  </div>
                </div>

                {/* Post text */}
                <p
                  className="text-xs leading-relaxed"
                  style={{
                    color:    "#888",
                    display:  "-webkit-box",
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                  }}
                >
                  {post.text}
                </p>

                {/* Score */}
                <div className="mt-1 flex items-center gap-2">
                  <span className="text-xs" style={{ color: "#333" }}>
                    score:{" "}
                    <span style={{ color: post.score > 0 ? "#555" : post.score < 0 ? "#9b1c17" : "#444" }}>
                      {post.score > 0 ? "+" : ""}
                      {post.score.toFixed(2)}
                    </span>
                  </span>
                  <span className="text-xs" style={{ color: "#333" }}>
                    {(post.city || "Unknown")}, {(post.state || "Unknown")}
                  </span>
                </div>
              </button>
            );
          })
        )}
      </div>
    </aside>
  );
}
