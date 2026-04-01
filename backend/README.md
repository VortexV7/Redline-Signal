# Redline Signal - Backend

FastAPI service for ingestion, enrichment, sentiment scoring, and ranking of live public signals.

## Responsibilities

- Collect posts from multiple public sources
- Compute sentiment via VADER
- Tag risk topics (`security`, `pandemic`)
- Assign geolocation metadata for map projection
- Produce ranked blended feed and aggregate stats

## Data Sources

| Source | Method | Auth Required |
|---|---|---|
| Reddit | Public subreddit JSON feeds | No |
| HackerNews | Firebase REST API | No |
| X/Twitter (optional) | Public RSS via Nitter fallback | No |

Note: X/Twitter fallback depends on public Nitter availability and may be intermittent.

## Local Setup

```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

Health:
`http://localhost:8000/health`

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/` | API metadata |
| `GET` | `/health` | Health probe |
| `GET` | `/api/mood` | Ranked blended feed |
| `GET` | `/api/mood/stats` | Aggregate sentiment metrics |

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `FRONTEND_URL` | Yes (deploy) | Allowed CORS origin |
| `NITTER_INSTANCE` | No | Single RSS mirror |
| `NITTER_INSTANCES` | No | Comma-separated RSS mirrors |

## Render Deployment

1. Create Web Service from repository
2. Set root directory to `backend`
3. Build command: `pip install -r requirements.txt`
4. Start command: `uvicorn main:app --host 0.0.0.0 --port $PORT`
5. Add env vars:
   - `FRONTEND_URL=https://<your-frontend-domain>`
   - optional `NITTER_INSTANCES=<comma-separated mirrors>`
