"use client";
// src/components/TopBar.tsx

import { useEffect, useState } from "react";

interface TopBarProps {
  loading: boolean;
  lastUpdated: Date | null;
}

export default function TopBar({ loading, lastUpdated }: TopBarProps) {
  const [time, setTime] = useState("");

  useEffect(() => {
    const tick = () =>
      setTime(new Date().toISOString().replace("T", " ").slice(0, 19) + " UTC");
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <header
      className="flex items-center justify-between px-5 h-11 shrink-0"
      style={{
        background:   "#0a0a0a",
        borderBottom: "1px solid #2a2a2a",
      }}
    >
      {/* Left — title */}
      <div className="flex items-center gap-4">
        <span
          className="uppercase"
          style={{
            color: "#e63329",
            fontFamily: "var(--font-gugi), var(--font-display), sans-serif",
            fontSize: "0.9rem",
            letterSpacing: "0.14em",
            lineHeight: 1,
          }}
        >
          REDLINE SIGNAL
        </span>
        <span
          className="hidden sm:block text-xs"
          style={{ color: "#555", letterSpacing: "0.1em" }}
        >
          / GLOBAL SENTIMENT ANALYSIS
        </span>
      </div>

      {/* Right — status */}
      <div className="flex items-center gap-5 text-xs" style={{ color: "#555" }}>
        {/* Live indicator */}
        <div className="flex items-center gap-2">
          <span
            className={`w-2 h-2 rounded-full ${loading ? "animate-pulse" : ""}`}
            style={{ background: loading ? "#888" : "#e63329" }}
          />
          <span style={{ color: loading ? "#888" : "#e63329", letterSpacing: "0.1em" }}>
            {loading ? "FETCHING" : "LIVE"}
          </span>
        </div>

        {/* Clock */}
        <span
          className="hidden md:block font-mono"
          style={{ letterSpacing: "0.05em" }}
        >
          {time}
        </span>

        {/* Last updated */}
        {lastUpdated && (
          <span className="hidden lg:block" style={{ color: "#3a3a3a" }}>
            UPD {lastUpdated.toLocaleTimeString()}
          </span>
        )}
      </div>
    </header>
  );
}
