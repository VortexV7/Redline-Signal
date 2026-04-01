# Redline Signal

Redline Signal is a real-time sentiment and risk intelligence dashboard that visualizes public internet signals on a live map and feed.

> Source-available for viewing only. Reuse, modification, redistribution, or derivative works are not permitted without written permission.

## Project Snapshot

- Monitoring-style UI: map + live feed + filters
- Sentiment scoring via VADER (`positive`, `neutral`, `negative`)
- Risk tags for `security` and `pandemic`
- India-priority blending with global coverage
- Multi-source ingestion with hosted-environment fallbacks

## Current Data Sources

| Source | Method | Status |
|---|---|---|
| Reddit | Public JSON + RSS fallback | Can be blocked (403) on some hosts |
| HackerNews | Firebase REST API | Stable primary fallback |
| X/Twitter | Public RSS via Nitter instances | Optional/intermittent |
| Google News | Public RSS (India-first + global backup) | Added as resilient hosted fallback |

## Features

- Live blended feed ranked by priority (importance + risk + regional weighting)
- Map markers colored by source
- Feed filters:
  - Platform (`All`, `Reddit`, `Twitter/X`, `HackerNews`, `Google News`)
  - Country, state, city
  - Topic (`All`, `General`, `Security`, `Pandemic`)
- Twitter/X "Coming Soon" UX state when feed availability is unstable

## Architecture

```text
internet-mood-map-v2/
├── backend/                 FastAPI ingestion, enrichment, scoring, blending
├── frontend/                Next.js UI (App Router), map and live feed
└── README.md                Root docs
```

## Tech Stack

- Frontend: Next.js 14, TypeScript, Tailwind, Leaflet
- Backend: FastAPI, HTTPX, VADER Sentiment
- Map tiles: OpenStreetMap
- Hosting: Vercel (frontend), Render (backend)

## Local Development

### 1) Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

Health check:
`http://localhost:8000/health`

### 2) Frontend

```bash
cd frontend
npm install
```

Create `frontend/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

Run:

```bash
npm run dev
```

Open:
`http://localhost:3000`

## Environment Variables

| Scope | Variable | Required | Description |
|---|---|---|---|
| Backend | `FRONTEND_URL` | Yes (deploy) | Allowed CORS origin for frontend |
| Backend | `NITTER_INSTANCE` | No | Single Nitter instance fallback |
| Backend | `NITTER_INSTANCES` | No | Comma-separated Nitter instances |
| Frontend | `NEXT_PUBLIC_API_URL` | Yes | Backend base URL |
| Frontend | `NEXT_PUBLIC_SITE_URL` | Recommended | Canonical site URL for metadata |

## API Endpoints

| Method | Endpoint | Purpose |
|---|---|---|
| `GET` | `/` | API metadata + sources |
| `GET` | `/health` | Health status |
| `GET` | `/api/mood` | Blended live posts (sentiment + geo + tags) |
| `GET` | `/api/mood/stats` | Aggregate sentiment stats |
| `GET` | `/api/debug/sources` | Source diagnostics (raw/blended counts + fetch stats) |

## Deployment Guide

### Backend (Render)

- Service type: Web Service
- Root directory: `backend`
- Build command: `pip install -r requirements.txt`
- Start command: `uvicorn main:app --host 0.0.0.0 --port $PORT`
- Environment variables:
  - `FRONTEND_URL=https://<your-frontend-domain>`
  - Optional `NITTER_INSTANCES=https://nitter.poast.org,https://nitter.privacydev.net,https://nitter.1d4.us`

### Frontend (Vercel)

- Root directory: `frontend`
- Environment variables:
  - `NEXT_PUBLIC_API_URL=https://<your-render-backend>.onrender.com`
  - `NEXT_PUBLIC_SITE_URL=https://<your-vercel-domain>`

## Production Verification Checklist

1. Open backend `/api/debug/sources` and verify non-zero source counts.
2. Confirm CORS works (`FRONTEND_URL` matches deployed frontend URL).
3. Verify frontend platform filters return expected source segments.
4. Hard refresh after metadata/icon changes (`Cmd+Shift+R`) to clear favicon cache.

## Notes on Icons and Social Thumbnail

- Desktop browsers cache favicons aggressively.
- Metadata/icon updates may require redeploy + hard refresh.
- Social previews (OG/Twitter) may keep cached cards; use platform card validators to force refresh.

## Git Ignore Essentials

Make sure these are ignored before pushing:

- Python: `.venv/`, `venv/`, `__pycache__/`, `*.pyc`, `.env`
- Node: `node_modules/`, `.next/`, `.env.local`
- OS/editor: `.DS_Store`, `.vscode/` (optional)

## Suggested GitHub Metadata

**Repository name**
`redline-signal`

**Description**
`Real-time sentiment and risk intelligence map with India-priority blending across Reddit, HackerNews, Google News RSS, and optional X/Twitter RSS.`

**Topics**
`fastapi`, `nextjs`, `typescript`, `sentiment-analysis`, `leaflet`, `openstreetmap`, `osint`, `dashboard`, `reddit`, `hackernews`, `google-news`, `rss`, `india`

## License

This repository is **not open source**.

- License: **All Rights Reserved** (see [`LICENSE`](LICENSE))
- Permission model: View-only
- Not allowed without written permission:
  - Copying code or core logic
  - Modifying or creating derivative works
  - Redistributing any portion of this project
  - Commercial or production reuse
