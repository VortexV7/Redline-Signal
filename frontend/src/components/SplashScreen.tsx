"use client";
// src/components/SplashScreen.tsx
// Terminal-style boot sequence shown on first load.

import { useEffect, useState } from "react";

const BOOT_LINES = [
  "> INITIALIZING INTERNET MOOD MAP v1.0.0",
  "> CONNECTING TO APIs...",
  "> LOADING VADER SENTIMENT ENGINE...",
  "> FETCHING GLOBAL POST DATA...",
  "> MAPPING GEO-COORDINATES...",
  "> RENDERING WORLD MAP...",
  "> ALL SYSTEMS OPERATIONAL.",
  "",
  "  [[ REDLINE SIGNAL ]]",
];

interface SplashScreenProps {
  onComplete: () => void;
}

export default function SplashScreen({ onComplete }: SplashScreenProps) {
  const [visibleLines, setVisibleLines] = useState<string[]>([]);
  const [done, setDone]                 = useState(false);

  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      if (i < BOOT_LINES.length) {
        const nextLine = BOOT_LINES[i];
        if (typeof nextLine === "string") {
          setVisibleLines((prev) => [...prev, nextLine]);
        }
        i++;
      } else {
        clearInterval(interval);
        setTimeout(() => {
          setDone(true);
          setTimeout(onComplete, 600);
        }, 400);
      }
    }, 220);
    return () => clearInterval(interval);
  }, [onComplete]);

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center transition-opacity duration-700 ${
        done ? "opacity-0 pointer-events-none" : "opacity-100"
      }`}
      style={{ background: "#0a0a0a" }}
    >
      {/* Scanline overlay */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.08) 2px, rgba(0,0,0,0.08) 4px)",
        }}
      />

      <div className="w-full max-w-xl px-8">
        {/* Title bar */}
        <div
          className="flex items-center gap-2 mb-6 pb-3"
          style={{ borderBottom: "1px solid #2a2a2a" }}
        >
          <div className="w-3 h-3 rounded-full" style={{ background: "#e63329" }} />
          <div className="w-3 h-3 rounded-full" style={{ background: "#3a3a3a" }} />
          <div className="w-3 h-3 rounded-full" style={{ background: "#3a3a3a" }} />
          <span
            className="ml-3 text-xs tracking-widest uppercase"
            style={{ color: "#555", fontFamily: "var(--font-mono)" }}
          >
            terminal — boot sequence
          </span>
        </div>

        {/* Lines */}
        <div className="space-y-1 min-h-[220px]">
          {visibleLines.map((line, idx) => {
            const safeLine = typeof line === "string" ? line : "";
            return (
              <div
                key={idx}
                className="text-sm leading-relaxed animate-slideUp"
                style={{
                  fontFamily: "var(--font-mono)",
                  color: safeLine.startsWith(">")
                    ? "#f5f5f5"
                    : safeLine.includes("[[")
                    ? "#e63329"
                    : "#555555",
                  letterSpacing: safeLine.includes("[[") ? "0.3em" : "0.05em",
                  fontSize: safeLine.includes("[[") ? "1.1rem" : "0.8rem",
                  fontWeight: safeLine.includes("[[") ? "700" : "400",
                }}
              >
                {safeLine || "\u00A0"}
              </div>
            );
          })}

          {/* Blinking cursor */}
          {!done && (
            <span
              className="inline-block w-2 h-4 animate-blink"
              style={{ background: "#e63329", marginLeft: "2px", verticalAlign: "middle" }}
            />
          )}
        </div>
      </div>
    </div>
  );
}
