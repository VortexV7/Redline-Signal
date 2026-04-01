# Redline Signal

> Real-time sentiment and risk intelligence dashboard — visualizing public internet signals on a live map and feed.

![Stack](https://img.shields.io/badge/Frontend-Next.js%2014-black?logo=next.js)
![Stack](https://img.shields.io/badge/Backend-FastAPI-009688?logo=fastapi)
![Stack](https://img.shields.io/badge/Sentiment-VADER-blueviolet)
![License](https://img.shields.io/badge/License-All%20Rights%20Reserved-red)

---

## Overview

**Redline Signal** is a monitoring-style intelligence dashboard that aggregates and scores public internet content in real time. It blends posts from Reddit, HackerNews, Google News, and optional X/Twitter RSS feeds — enriching each post with sentiment scores, geolocation metadata, and risk tags — then surfaces them on an interactive map and live feed.

**India-priority blending** ensures regional relevance while maintaining global coverage.

---

## Features

- 🗺️ **Live Map** — geo-tagged markers colored by source platform
- 📡 **Blended Feed** — ranked by importance, risk level, and regional weighting
- 🧠 **Sentiment Analysis** — VADER-based scoring (`positive`, `neutral`, `negative`)
- 🏷️ **Risk Tagging** — automatic classification for `security` and `pandemic` topics
- 🔎 **Filters** — by platform, country/state/city, and topic
- 🐦 **X/Twitter UX State** — graceful "Coming Soon" handling for unstable RSS availability

---

## Data Sources

| Source | Method | Reliability |
|---|---|---|
| Reddit | Public JSON + RSS fallback | May return 403 on some hosts |
| HackerNews | Firebase REST API | Stable — primary fallback |
| Google News | Public RSS (India-first + global) | Resilient hosted fallback |
| X / Twitter | Public RSS via Nitter instances | Optional / intermittent |

---

## Tech Stack

| Layer | Technologies |
|---|---|
| Frontend | Next.js 14, TypeScript, Tailwind CSS, Leaflet |
| Backend | FastAPI, HTTPX, VADER Sentiment |
| Map Tiles | OpenStreetMap |
| Hosting | Vercel (frontend), Render (backend) |

---

## Project Structure

```
redline-signal/
├── backend/      # FastAPI — ingestion, enrichment, scoring, blending
├── frontend/     # Next.js — App Router, map UI, live feed
└── README.md
```

---

## Local Development

### Prerequisites

- Python 3.9+
- Node.js 18+

### 1. Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate       # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

Health check: `http://localhost:8000/health`

### 2. Frontend

```bash
cd frontend
npm install
```

Create `frontend/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

```bash
npm run dev
```

Open: `http://localhost:3000`

---

## Environment Variables

### Backend

| Variable | Required | Description |
|---|---|---|
| `FRONTEND_URL` | Yes (deploy) | Allowed CORS origin for the frontend |
| `NITTER_INSTANCE` | No | Single Nitter instance URL |
| `NITTER_INSTANCES` | No | Comma-separated list of Nitter instances |

### Frontend

| Variable | Required | Description |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | Yes | Backend base URL |
| `NEXT_PUBLIC_SITE_URL` | Recommended | Canonical site URL for metadata |

---

## API Reference

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/` | API metadata and active sources |
| `GET` | `/health` | Health status |
| `GET` | `/api/mood` | Blended live posts with sentiment, geo, and tags |
| `GET` | `/api/mood/stats` | Aggregate sentiment statistics |
| `GET` | `/api/debug/sources` | Source diagnostics — raw and blended counts |

---

## Deployment

### Backend — Render

| Setting | Value |
|---|---|
| Service Type | Web Service |
| Root Directory | `backend` |
| Build Command | `pip install -r requirements.txt` |
| Start Command | `uvicorn main:app --host 0.0.0.0 --port $PORT` |

**Environment variables:**

```
FRONTEND_URL=https://<your-frontend-domain>
NITTER_INSTANCES=https://nitter.poast.org,https://nitter.privacydev.net,https://nitter.1d4.us
```

### Frontend — Vercel

| Setting | Value |
|---|---|
| Root Directory | `frontend` |

**Environment variables:**

```
NEXT_PUBLIC_API_URL=https://<your-render-backend>.onrender.com
NEXT_PUBLIC_SITE_URL=https://<your-vercel-domain>
```

---

## Post-Deployment Checklist

- [ ] `/api/debug/sources` returns non-zero source counts
- [ ] CORS passes — `FRONTEND_URL` matches the deployed frontend domain exactly
- [ ] Platform filters return the expected source segments
- [ ] Hard refresh (`Cmd+Shift+R`) after favicon/metadata changes to clear browser cache

> **Note:** Browsers and social platforms cache favicons and OG cards aggressively. Use platform card validators (e.g., Twitter Card Validator, Facebook Debugger) to force a refresh after metadata updates.

---

## .gitignore Essentials

Ensure these are excluded before pushing:

```gitignore
# Python
.venv/
venv/
__pycache__/
*.pyc
.env

# Node
node_modules/
.next/
.env.local

# OS / Editor
.DS_Store
.vscode/
```

---

## GitHub Metadata

**Repository name:** `redline-signal`

**Description:** `Real-time sentiment and risk intelligence map with India-priority blending across Reddit, HackerNews, Google News RSS, and optional X/Twitter RSS.`

**Topics:** `fastapi` `nextjs` `typescript` `sentiment-analysis` `leaflet` `openstreetmap` `osint` `dashboard` `reddit` `hackernews` `google-news` `rss` `india`

---

## License

**All Rights Reserved.**

This repository is source-available for viewing purposes only. The following are **not permitted** without explicit written permission from the author:

- Copying or reusing code or core logic
- Modifying or creating derivative works
- Redistributing any portion of this project
- Commercial or production use

See [`LICENSE`](LICENSE) for full terms.