"use client";
// src/app/page.tsx
// Root page — orchestrates all components.

import { useEffect, useState, useCallback } from "react";
import dynamic from "next/dynamic";
import SplashScreen from "@/components/SplashScreen";
import TopBar       from "@/components/TopBar";
import StatsPanel   from "@/components/StatsPanel";
import LiveFeed     from "@/components/LiveFeed";
import Footer       from "@/components/Footer";
import { deriveMoodStats, fetchMoodData } from "@/lib/api";
import type { MoodPost, MoodStats } from "@/lib/api";

// Leaflet must not SSR
const MoodMap = dynamic(() => import("@/components/MoodMap"), { ssr: false });

const REFRESH_INTERVAL_MS = 5 * 60 * 1000; // 5 minutes

export default function HomePage() {
  const [showSplash,   setShowSplash]   = useState(true);
  const [appReady,     setAppReady]     = useState(false);
  const [posts,        setPosts]        = useState<MoodPost[]>([]);
  const [stats,        setStats]        = useState<MoodStats | null>(null);
  const [loading,      setLoading]      = useState(false);
  const [error,        setError]        = useState<string | null>(null);
  const [selected,     setSelected]     = useState<MoodPost | null>(null);
  const [lastUpdated,  setLastUpdated]  = useState<Date | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const postsData = await fetchMoodData();
      setPosts(postsData);
      setStats(deriveMoodStats(postsData));
      setLastUpdated(new Date());
    } catch (err: any) {
      setError(err.message ?? "Failed to load data.");
    } finally {
      setLoading(false);
    }
  }, []);

  // Load data once app is ready
  useEffect(() => {
    if (!appReady) return;
    loadData();
    const id = setInterval(loadData, REFRESH_INTERVAL_MS);
    return () => clearInterval(id);
  }, [appReady, loadData]);

  const handleSplashDone = useCallback(() => {
    setShowSplash(false);
    setAppReady(true);
  }, []);

  return (
    <>
      {/* Splash */}
      {showSplash && <SplashScreen onComplete={handleSplashDone} />}

      {/* Main app */}
      <div
        className="flex flex-col"
        style={{
          height:     "100dvh",
          opacity:    appReady ? 1 : 0,
          transition: "opacity 0.5s ease",
        }}
      >
        {/* Top bar */}
        <TopBar loading={loading} lastUpdated={lastUpdated} />

        {/* Body row */}
        <div className="flex flex-1 overflow-hidden">
          {/* Left — stats */}
          <StatsPanel stats={stats} loading={loading} />

          {/* Center — map */}
          <main className="flex-1 relative overflow-hidden">
            {error ? (
              <div
                className="absolute inset-0 flex flex-col items-center justify-center gap-4"
                style={{ background: "#0a0a0a" }}
              >
                <span
                  className="text-xs tracking-widest"
                  style={{ color: "#e63329" }}
                >
                  ERROR
                </span>
                <span
                  className="text-sm text-center max-w-xs"
                  style={{ color: "#555" }}
                >
                  {error}
                </span>
                <button
                  onClick={loadData}
                  className="text-xs px-4 py-2 mt-2"
                  style={{
                    border:        "1px solid #2a2a2a",
                    color:         "#888",
                    background:    "transparent",
                    letterSpacing: "0.1em",
                    cursor:        "pointer",
                  }}
                  onMouseEnter={(e) =>
                    ((e.target as HTMLButtonElement).style.borderColor = "#e63329")
                  }
                  onMouseLeave={(e) =>
                    ((e.target as HTMLButtonElement).style.borderColor = "#2a2a2a")
                  }
                >
                  RETRY
                </button>
              </div>
            ) : (
              <MoodMap posts={posts} selected={selected} />
            )}

            {/* Loading overlay on top of map */}
            {loading && posts.length === 0 && !error && (
              <div
                className="absolute inset-0 flex items-center justify-center"
                style={{ background: "rgba(10,10,10,0.85)", zIndex: 500 }}
              >
                <div className="text-center space-y-3">
                  <div
                    className="text-xs tracking-widest animate-pulse"
                    style={{ color: "#e63329" }}
                  >
                    LOADING DATA...
                  </div>
                  <div className="flex gap-1 justify-center">
                    {[0, 1, 2].map((i) => (
                      <span
                        key={i}
                        className="w-1 h-1 rounded-full animate-pulse"
                        style={{
                          background:     "#e63329",
                          animationDelay: `${i * 200}ms`,
                        }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}
          </main>

          {/* Right — live feed */}
          <LiveFeed
            posts={posts}
            loading={loading}
            onSelect={setSelected}
          />
        </div>

        {/* Footer */}
        <Footer total={posts.length} loading={loading} />
      </div>
    </>
  );
}
