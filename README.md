# Redline Signal

Redline Signal is a real-time risk and sentiment intelligence dashboard that maps public conversations from multiple open sources onto a global interface.

> Source-available for viewing only. Reuse, modification, redistribution, or derivative works are not permitted without written permission.

## GitHub Setup

**Repository name**
`redline-signal`

**Repository description**
`Live global sentiment and risk map powered by Reddit, HackerNews, and public X/Twitter feeds.`

**Suggested repository topics**
`fastapi`, `nextjs`, `typescript`, `sentiment-analysis`, `leaflet`, `openstreetmap`, `dashboard`, `osint`, `reddit`, `hackernews`, `twitter`

## What It Does

- Aggregates live posts from public platforms
- Scores sentiment using VADER (`positive`, `neutral`, `negative`)
- Tags risk-related topics (`security`, `pandemic`)
- Projects events to map coordinates for regional visualization
- Supports feed filtering by platform, country, state, city, and topic

## Core Features

- Multi-source ingestion: Reddit, HackerNews, optional X/Twitter RSS fallback
- Priority-based ranking for high-signal stories
- India-focused weighting with global coverage
- Source-aware visual encoding across feed and map
- Monitoring-style UI with live feed + geospatial map

## Tech Stack

- Frontend: Next.js 14, TypeScript, Tailwind, Leaflet
- Backend: FastAPI, HTTPX, VADER sentiment
- Map tiles: OpenStreetMap
- Deployment: Vercel (frontend), Render (backend)

## Repository Structure

```text
internet-mood-map-v2/
├── backend/                 FastAPI API, source ingestion, sentiment engine
├── frontend/                Next.js dashboard UI
└── README.md                Project overview and deployment guide
```

## Quick Start

### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

Health check:
`http://localhost:8000/health`

### Frontend

```bash
cd frontend
npm install
```

Create `frontend/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
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
| Backend | `FRONTEND_URL` | Yes (deploy) | CORS origin for deployed frontend |
| Backend | `NITTER_INSTANCE` | No | Single Nitter instance for X/Twitter fallback |
| Backend | `NITTER_INSTANCES` | No | Comma-separated Nitter instances (recommended fallback chain) |
| Frontend | `NEXT_PUBLIC_API_URL` | Yes | Base URL of backend API |

## API Reference

| Method | Endpoint | Purpose |
|---|---|---|
| `GET` | `/` | API metadata |
| `GET` | `/health` | Service health check |
| `GET` | `/api/mood` | Blended live posts with sentiment + geo + tags |
| `GET` | `/api/mood/stats` | Aggregate sentiment summary |

## Deployment (Recommended)

### Backend on Render

- Root directory: `backend`
- Build command: `pip install -r requirements.txt`
- Start command: `uvicorn main:app --host 0.0.0.0 --port $PORT`
- Environment:
  - `FRONTEND_URL=https://<your-vercel-domain>`
  - optional `NITTER_INSTANCES=https://nitter.poast.org,https://nitter.privacydev.net,https://nitter.1d4.us`

### Frontend on Vercel

- Root directory: `frontend`
- Environment:
  - `NEXT_PUBLIC_API_URL=https://<your-render-service>.onrender.com`

## Notes

- Twitter/X support depends on public RSS/Nitter availability and can be intermittent.
- The app is designed for intelligence-style situational awareness, not forensic or legal attribution.

## License

This repository is **not open source**.

- License: **All Rights Reserved** (see [`LICENSE`](/LICENSE))
- Permission model: View-only
- Not allowed without written permission:
  - Copying code or logic
  - Modifying or creating derivatives
  - Redistributing any part of the project
  - Commercial or production reuse
