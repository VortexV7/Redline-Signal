"use client";
// src/components/StatsPanel.tsx

import type { MoodPost, MoodStats } from "@/lib/api";

interface StatsPanelProps {
  stats:   MoodStats | null;
  loading: boolean;
}

function Bar({ value, total, color }: { value: number; total: number; color: string }) {
  const pct = total > 0 ? Math.round((value / total) * 100) : 0;
  return (
    <div className="w-full" style={{ height: "4px", background: "#1a1a1a" }}>
      <div
        style={{
          width:      `${pct}%`,
          height:     "100%",
          background: color,
          transition: "width 0.6s ease",
        }}
      />
    </div>
  );
}

function StatRow({
  label,
  value,
  total,
  color,
}: {
  label: string;
  value: number;
  total: number;
  color: string;
}) {
  const pct = total > 0 ? Math.round((value / total) * 100) : 0;
  return (
    <div className="space-y-1">
      <div className="flex justify-between items-center text-xs">
        <span style={{ color: "#888", letterSpacing: "0.1em" }}>{label}</span>
        <span style={{ color }}>
          {value} <span style={{ color: "#555" }}>({pct}%)</span>
        </span>
      </div>
      <Bar value={value} total={total} color={color} />
    </div>
  );
}

export default function StatsPanel({ stats, loading }: StatsPanelProps) {
  const skeleton = (w: string) => (
    <div
      className="animate-pulse"
      style={{ width: w, height: "12px", background: "#1a1a1a", borderRadius: "2px" }}
    />
  );

  return (
    <aside
      className="flex flex-col gap-5 p-4 shrink-0 overflow-y-auto"
      style={{
        width:       "220px",
        background:  "#0a0a0a",
        borderRight: "1px solid #1a1a1a",
      }}
    >
      {/* Section label */}
      <div
        className="text-xs tracking-widest uppercase pb-3"
        style={{ color: "#3a3a3a", borderBottom: "1px solid #1a1a1a" }}
      >
        SYSTEM STATS
      </div>

      {loading || !stats ? (
        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="space-y-2">
              {skeleton("60%")}
              {skeleton("100%")}
            </div>
          ))}
        </div>
      ) : (
        <>
          {/* Total posts */}
          <div className="space-y-1">
            <span
              className="text-xs tracking-widest uppercase"
              style={{ color: "#3a3a3a" }}
            >
              POSTS ANALYSED
            </span>
            <div
              className="text-3xl font-bold"
              style={{ fontFamily: "var(--font-display)", color: "#f5f5f5" }}
            >
              {stats.total}
            </div>
          </div>

          {/* Sentiment bars */}
          <div className="space-y-4">
            <StatRow label="NEGATIVE" value={stats.negative} total={stats.total} color="#e63329" />
            <StatRow label="NEUTRAL"  value={stats.neutral}  total={stats.total} color="#f5f5f5" />
            <StatRow label="POSITIVE" value={stats.positive} total={stats.total} color="#888888" />
          </div>

          {/* Avg score */}
          <div
            className="space-y-2 pt-4"
            style={{ borderTop: "1px solid #1a1a1a" }}
          >
            <span
              className="text-xs tracking-widest uppercase"
              style={{ color: "#3a3a3a" }}
            >
              AVG SCORE
            </span>
            <div
              className="text-2xl font-bold"
              style={{
                fontFamily: "var(--font-display)",
                color:
                  stats.average_score > 0.05
                    ? "#888"
                    : stats.average_score < -0.05
                    ? "#e63329"
                    : "#f5f5f5",
              }}
            >
              {stats.average_score > 0 ? "+" : ""}
              {stats.average_score.toFixed(3)}
            </div>
          </div>

          {/* Global mood */}
          <div
            className="space-y-1 pt-2"
            style={{ borderTop: "1px solid #1a1a1a" }}
          >
            <span
              className="text-xs tracking-widest uppercase"
              style={{ color: "#3a3a3a" }}
            >
              GLOBAL MOOD
            </span>
            <div
              className="text-sm font-bold tracking-widest uppercase"
              style={{
                color:
                  stats.mood === "negative"
                    ? "#e63329"
                    : stats.mood === "positive"
                    ? "#888"
                    : "#f5f5f5",
              }}
            >
              [{stats.mood}]
            </div>
          </div>

          {/* Legend */}
          <div
            className="space-y-2 pt-4"
            style={{ borderTop: "1px solid #1a1a1a" }}
          >
            <span
              className="text-xs tracking-widest uppercase"
              style={{ color: "#3a3a3a" }}
            >
              LEGEND
            </span>
            {[
              { label: "NEGATIVE", color: "#e63329" },
              { label: "NEUTRAL",  color: "#f5f5f5" },
              { label: "POSITIVE", color: "#888888" },
            ].map(({ label, color }) => (
              <div key={label} className="flex items-center gap-2">
                <span
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ background: color }}
                />
                <span className="text-xs" style={{ color: "#555", letterSpacing: "0.1em" }}>
                  {label}
                </span>
              </div>
            ))}
          </div>
        </>
      )}
    </aside>
  );
}
