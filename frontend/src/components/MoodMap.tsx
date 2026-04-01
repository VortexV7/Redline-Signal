"use client";
// src/components/MoodMap.tsx
// Dynamic Leaflet map — must be imported with { ssr: false } in Next.js.

import { useEffect, useRef } from "react";
import type { MoodPost } from "@/lib/api";
import { sentimentColor, sentimentBorder } from "@/lib/api";

interface MoodMapProps {
  posts:    MoodPost[];
  selected: MoodPost | null;
}

function sourceDotColor(source?: string): { fill: string; border: string } {
  const s = (source || "").toLowerCase();
  if (s === "reddit") return { fill: "#ff7a00", border: "#b65600" };
  if (s === "twitter") return { fill: "#1d9bf0", border: "#136aa8" };
  if (s === "hackernews") return { fill: "#ff6600", border: "#b54800" };
  return { fill: "#f5f5f5", border: "#aaaaaa" };
}

export default function MoodMap({ posts, selected }: MoodMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef       = useRef<any>(null);
  const markersRef   = useRef<any[]>([]);
  const popupRefs    = useRef<Map<string, any>>(new Map());

  // ── Init map once ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (typeof window === "undefined" || mapRef.current) return;

    import("leaflet").then((L) => {
      if (!containerRef.current || mapRef.current) return;

      const map = L.map(containerRef.current, {
        center:             [20, 0],
        zoom:               2,
        minZoom:            2,
        maxZoom:            10,
        zoomControl:        true,
        attributionControl: true,
        worldCopyJump:      true,
      });

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map);

      mapRef.current = map;
    });

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // ── Update markers when posts change ──────────────────────────────────────
  useEffect(() => {
    if (!mapRef.current || posts.length === 0) return;

    import("leaflet").then((L) => {
      // Clear old markers
      markersRef.current.forEach((m) => m.remove());
      markersRef.current = [];
      popupRefs.current.clear();

      posts.forEach((post) => {
        const sentimentTextColor = sentimentColor(post.sentiment);
        const sourceDot = sourceDotColor(post.source);
        const size   = post.sentiment === "negative" ? 10 : 8;

        const icon = L.divIcon({
          className: "",
          iconSize:  [size, size],
          iconAnchor:[size / 2, size / 2],
          html: `<div style="
            width:${size}px;
            height:${size}px;
            border-radius:50%;
            background:${sourceDot.fill};
            border:1.5px solid ${sourceDot.border};
            opacity:0.85;
            transition: transform 0.2s;
          "></div>`,
        });

        const scoreStr =
          post.score > 0
            ? `+${post.score.toFixed(3)}`
            : post.score.toFixed(3);

        const scoreColor =
          post.score > 0.05
            ? "#888"
            : post.score < -0.05
            ? "#e63329"
            : "#f5f5f5";

        const popupContent = `
          <div style="font-family:var(--font-mono,'Courier New',monospace);padding:4px 2px">
            <div style="
              display:flex;
              justify-content:space-between;
              align-items:center;
              margin-bottom:8px;
              padding-bottom:6px;
              border-bottom:1px solid #2a2a2a
            ">
              <span style="color:${sentimentTextColor};font-weight:700;letter-spacing:0.1em;font-size:10px">
                ${post.sentiment.toUpperCase()}
              </span>
              <span style="color:${sourceDot.fill};font-size:10px;letter-spacing:0.05em">
                ${(post.source || "source").toUpperCase()}
              </span>
            </div>
            <p style="
              color:#aaa;
              font-size:11px;
              line-height:1.55;
              margin-bottom:8px;
              max-width:220px
            ">${post.text.length > 120 ? post.text.slice(0, 120) + "…" : post.text}</p>
            <div style="
              display:flex;
              justify-content:space-between;
              align-items:center;
              padding-top:6px;
              border-top:1px solid #1a1a1a
            ">
              <span style="color:#333;font-size:10px">
                score: <span style="color:${scoreColor}">${scoreStr}</span>
              </span>
              <a
                href="${post.url}"
                target="_blank"
                rel="noreferrer"
                style="color:#555;font-size:10px;text-decoration:none;letter-spacing:0.05em"
              >VIEW →</a>
            </div>
          </div>
        `;

        const popup = L.popup({ className: "mood-popup", maxWidth: 280 })
          .setContent(popupContent);

        const marker = L.marker([post.lat, post.lng], { icon })
          .bindPopup(popup)
          .addTo(mapRef.current);

        markersRef.current.push(marker);
        popupRefs.current.set(post.id, marker);
      });
    });
  }, [posts]);

  // ── Pan to selected post ───────────────────────────────────────────────────
  useEffect(() => {
    if (!selected || !mapRef.current) return;
    const marker = popupRefs.current.get(selected.id);
    if (marker) {
      mapRef.current.setView([selected.lat, selected.lng], 5, {
        animate: true,
        duration: 0.8,
      });
      marker.openPopup();
    }
  }, [selected]);

  return (
    <div
      ref={containerRef}
      className="w-full h-full"
      style={{ background: "#111" }}
    />
  );
}
