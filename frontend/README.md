# Redline Signal - Frontend

Frontend dashboard for Redline Signal, built with Next.js, TypeScript, Tailwind, and Leaflet.

## Responsibilities

- Render global map and live feed UI
- Apply visual encoding for source/sentiment/risk tags
- Handle user filters: platform, country, state, city, topic
- Fetch backend data and display live status

## Local Development

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

## Production Build

```bash
npm run build
npm run start
```

## Environment Variable

| Variable | Required | Description | Example |
|---|---|---|---|
| `NEXT_PUBLIC_API_URL` | Yes | Backend API base URL | `https://your-backend.onrender.com` |

## UI Component Map

```text
src/app/page.tsx
├── SplashScreen.tsx
├── TopBar.tsx
├── StatsPanel.tsx
├── MoodMap.tsx
├── LiveFeed.tsx
└── Footer.tsx
```

## Implementation Notes

- `MoodMap` is dynamically imported with `ssr: false` due to Leaflet browser dependency.
- Feed and map use source-aware color conventions for cross-panel consistency.
- UI is optimized for monitoring-style, full-screen desktop usage.
