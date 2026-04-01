"use client";
// src/components/Footer.tsx

import { useEffect, useState } from "react";

interface FooterProps {
  total:   number;
  loading: boolean;
}

export default function Footer({ total, loading }: FooterProps) {
  const [aboutOpen, setAboutOpen] = useState(false);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setAboutOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <>
      <footer
        className="flex items-center justify-between px-5 h-8 shrink-0 text-xs"
        style={{
          background:  "#0a0a0a",
          borderTop:   "1px solid #1a1a1a",
          color:       "#3a3a3a",
          letterSpacing: "0.08em",
        }}
      >
        <span>DATA: REDDIT JSON + HN FIREBASE + X RSS</span>
        <span>ENGINE: VADER SENTIMENT</span>
        <span>MAP: LEAFLET + OPENSTREETMAP</span>
        <span>
          {loading
            ? "FETCHING..."
            : `${total} POSTS LOADED`}
        </span>
        <button
          type="button"
          onClick={() => setAboutOpen(true)}
          className="barcode-link"
          style={{
            color: "#888",
            fontFamily: "var(--font-barcode), var(--font-mono), monospace",
            fontSize: "18px",
            letterSpacing: "0.04em",
            background: "transparent",
            border: "none",
            cursor: "pointer",
          }}
        >
          Developed by VortexV7
        </button>
      </footer>

      {aboutOpen && (
        <div
          className="fixed inset-0 z-[999] flex items-center justify-center px-4"
          style={{
            background:
              "radial-gradient(circle at 20% 20%, rgba(230,51,41,0.14), rgba(10,10,10,0.94) 42%)",
            backdropFilter: "blur(2px)",
          }}
          onClick={() => setAboutOpen(false)}
        >
          <div
            className="w-full max-w-xl border"
            style={{
              background:
                "linear-gradient(165deg, rgba(20,20,20,0.96), rgba(10,10,10,0.96))",
              borderColor: "#3a1a18",
              boxShadow:
                "0 20px 60px rgba(0,0,0,0.6), inset 0 0 0 1px rgba(230,51,41,0.14)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className="flex items-center justify-between px-5 py-4"
              style={{ borderBottom: "1px solid #2f1a19" }}
            >
              <div className="flex flex-col gap-1">
                <span
                  className="text-base tracking-[0.18em]"
                  style={{ color: "#f2f2f2", fontFamily: "var(--font-gugi), var(--font-display), sans-serif" }}
                >
                  REDLINE SIGNAL
                </span>
                <span
                  className="text-[10px] uppercase"
                  style={{ color: "#a35a56", letterSpacing: "0.18em", fontFamily: "var(--font-mono), monospace" }}
                >
                  SYSTEM OVERVIEW
                </span>
              </div>
              <button
                type="button"
                onClick={() => setAboutOpen(false)}
                className="text-xs px-3 py-1"
                style={{
                  color: "#b8b8b8",
                  border: "1px solid #3a2a2a",
                  background: "transparent",
                  fontFamily: "var(--font-mono), monospace",
                  letterSpacing: "0.08em",
                  cursor: "pointer",
                }}
              >
                CLOSE
              </button>
            </div>

            <div className="px-5 py-5 space-y-4 text-sm" style={{ color: "#a8a8a8", fontFamily: "var(--font-mono), monospace" }}>
              <p style={{ color: "#dfdfdf", letterSpacing: "0.03em", lineHeight: 1.7 }}>
                Live global sentiment intelligence from public social/news signals.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div
                  className="px-3 py-2"
                  style={{ border: "1px solid #252525", background: "rgba(16,16,16,0.85)" }}
                >
                  <div className="text-[10px] uppercase" style={{ color: "#7a7a7a", letterSpacing: "0.15em" }}>
                    Version
                  </div>
                  <div className="text-sm" style={{ color: "#f0f0f0", marginTop: "4px" }}>
                    v1.0.0
                  </div>
                </div>
                <div
                  className="px-3 py-2"
                  style={{ border: "1px solid #252525", background: "rgba(16,16,16,0.85)" }}
                >
                  <div className="text-[10px] uppercase" style={{ color: "#7a7a7a", letterSpacing: "0.15em" }}>
                    Developer
                  </div>
                  <div className="text-sm" style={{ color: "#f0f0f0", marginTop: "4px" }}>
                    Ved Sharanagate
                  </div>
                </div>
                <div
                  className="px-3 py-2"
                  style={{ border: "1px solid #252525", background: "rgba(16,16,16,0.85)" }}
                >
                  <div className="text-[10px] uppercase" style={{ color: "#7a7a7a", letterSpacing: "0.15em" }}>
                    Stack
                  </div>
                  <div className="text-sm" style={{ color: "#f0f0f0", marginTop: "4px" }}>
                    Next + FastAPI
                  </div>
                </div>
              </div>

              <div className="pt-1">
                <div
                  className="text-[10px] uppercase mb-2"
                  style={{ color: "#7a7a7a", letterSpacing: "0.15em" }}
                >
                  Social Links
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <a
                  href="https://github.com/VortexV7"
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs px-3 py-2"
                  style={{
                    border: "1px solid #333",
                    color: "#f5f5f5",
                    background: "#121212",
                    textDecoration: "none",
                    letterSpacing: "0.12em",
                    fontFamily: "var(--font-mono), monospace",
                  }}
                >
                  GITHUB
                </a>
                <a
                  href="https://x.com/VortexV7"
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs px-3 py-2"
                  style={{
                    border: "1px solid #333",
                    color: "#f5f5f5",
                    background: "#121212",
                    textDecoration: "none",
                    letterSpacing: "0.12em",
                    fontFamily: "var(--font-mono), monospace",
                  }}
                >
                  X
                </a>
                <a
                  href="https://www.linkedin.com/in/ved-sharanagate"
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs px-3 py-2"
                  style={{
                    border: "1px solid #333",
                    color: "#f5f5f5",
                    background: "#121212",
                    textDecoration: "none",
                    letterSpacing: "0.12em",
                    fontFamily: "var(--font-mono), monospace",
                  }}
                >
                  LINKEDIN
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
