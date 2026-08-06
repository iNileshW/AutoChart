# AutoChart

[![CI](https://github.com/iNileshW/AutoChart/actions/workflows/ci.yml/badge.svg)](https://github.com/iNileshW/AutoChart/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Python 3.13](https://img.shields.io/badge/python-3.13-blue.svg)](pyproject.toml)
[![Node 22](https://img.shields.io/badge/node-22-brightgreen.svg)](frontend/package.json)

AutoChart compares old and new UKHO geospatial navigation chart polygons and helps identify upgrade recommendations for customers. A single FastAPI process serves the REST API, an MCP JSON-RPC endpoint, and the built React SPA.

## Architecture

- **Frontend**: React + Vite in `frontend/`. Two views selected from a top nav: **Home** (chatbot + Leaflet map with old ∩ new overlay) and **MCP chatbot** (natural-language chat that calls `chart.answer` over MCP and shows a prose reply — no raw JSON). The `/api/overlap` REST endpoint and the `chart.overlap` MCP tool remain available for programmatic use.
- **Backend API**: FastAPI in `src/autochart/backend/` (data + overlap service layer, REST routes).
- **MCP endpoint**: JSON-RPC 2.0 tools mounted at `/mcp`, sharing the same service layer as the REST API.
- **Data**: chart polygons loaded from GeoJSON exports of `data_original/*.shp` (see `src/autochart/backend/data.py`).

## Tech Stack

- Python 3.13 (UV-managed project)
- FastAPI + Uvicorn
- Geopandas + Pandas + Shapely
- Matplotlib (headless Agg backend for server-side overlap rendering)
- React 18 + Vite 5, react-leaflet + Leaflet 1.9

## REST Endpoints

Everything lives under `/api`:

| Method | Path | Purpose |
|--------|------|---------|
| `GET`  | `/api/health` | Liveness probe |
| `GET`  | `/api/panels?max_scale=30000` | List old panels (`PANEL_MAIN`) at or below `max_scale` |
| `GET`  | `/api/data?max_scale=30000` | Return old + new panel geometry as GeoJSON `FeatureCollection`s |
| `POST` | `/api/lookup` | `{mode, value}` — modes: `chart_number`, `chart_name`, `chart_title`, `panel_id` |
| `POST` | `/api/overlap` | `{panel_main, max_scale}` — returns base64 PNG + metrics from `plot_panel_overlap` |
| `POST` | `/api/overlap-geojson` | `{panel_names[], max_scale}` — intersection polygons + bounds in EPSG:4326 for map consumers |
| `POST` | `/api/chat` | Chatbot that infers `mode`/`value` from a natural sentence or explicit fields |

Overlap and panel listing enforce `Scale <= 30000` by default.

## MCP Endpoint

`POST /mcp` speaks JSON-RPC 2.0. Supported methods: `initialize`, `tools/list`, `tools/call`.

Tools:
- `chart.lookup` — same semantics as `/api/lookup`
- `chart.get_data` — same as `/api/data`
- `chart.list_panels` — same as `/api/panels`
- `chart.overlap` — returns a `text` + `image/png` content pair
- `chart.overlap_geojson` — same semantics as `/api/overlap-geojson` (intersection polygons + bounds)
- `chart.answer` — conversational summary for a free-text query about a chart (number, name, title, or panel id). Returns a single prose string, no raw JSON.
- `chart.compare` — alias for `chart.overlap`

Example:

```bash
curl -s -X POST http://localhost:8000/mcp \
  -H 'content-type: application/json' \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/list"}'
```

## Run Locally

### 1. Install dependencies

```bash
uv sync                       # Python deps
(cd frontend && npm install)  # Frontend deps
```

### 2. Build frontend (production SPA served by the backend)

```bash
cd frontend && npm run build
```

Outputs `frontend/dist/`, which the backend mounts at `/` (and `/app-assets/`).

### 3. Start backend

From the repo root:

```bash
uv run autochart-api
# or:
.venv/bin/python -m uvicorn autochart.backend.main:app --host 0.0.0.0 --port 8000
```

Open http://localhost:8000/ for the SPA. API docs: http://localhost:8000/docs.

### Dev mode with hot reload

If you prefer Vite's dev server:

```bash
cd frontend && npm run dev
```

Runs on `http://localhost:5173` and proxies `/api` + `/mcp` to `http://localhost:8000`. Start the backend as in step 3.

## Behind a reverse proxy

The build uses `vite base: "./"` and all client fetches are path-relative (`api/...`, not `/api/...`), so the app works behind a prefix-stripping proxy (e.g. `https://<host>/proxy/8000/`). Always visit the proxied URL **with a trailing slash** so relative paths resolve correctly.

## Testing

```bash
uv run pytest
```

## Lint & format (frontend)

```bash
cd frontend
npm run lint          # ESLint check
npm run lint:fix      # ESLint auto-fix
npm run format        # Prettier write
npm run format:check  # Prettier check
```

ESLint uses the flat config in `frontend/eslint.config.js` with React, React Hooks, and React Refresh rules; `eslint-config-prettier` disables stylistic rules that overlap with Prettier. Prettier config lives in `frontend/.prettierrc.json`.

## Frontend tests

```bash
cd frontend
npm test              # Vitest one-shot
npm run test:watch    # Vitest watch mode
```

Vitest runs under jsdom with React Testing Library. Test files live in `frontend/src/test/`:
- `ChatBot.test.jsx` — form + fetch + reply rendering + error handling
- `MapView.test.jsx` — loading/error states + GeoJSON layer counts (react-leaflet is mocked so tests run without a canvas-capable DOM)
- `MCPChat.test.jsx` — MCP tool catalogue load, `tools/call` request body, invalid-JSON guard, JSON-RPC error rendering

Test coverage:
- `tests/test_data.py` — lookup semantics per mode, scale filter, GeoJSON shape
- `tests/test_overlap.py` — `plot_panel_overlap` PNG magic bytes + metrics
- `tests/test_api.py` — REST endpoints via `TestClient`
- `tests/test_mcp.py` — JSON-RPC `tools/list` and `tools/call`

## Docker

```bash
docker build -t autochart:local .
docker compose up
```

The image is multi-stage: Node 22 builds the SPA, Python 3.13 serves it via `uvicorn`. It runs as a non-root user, mounts `/tmp` read-write only, and ships a `curl` health check. Configure via `.env` (see `.env.example`).

## E2E tests (Playwright)

Playwright is scaffolded but browsers are not downloaded by default.

```bash
cd frontend
npm run e2e:install     # one-time, downloads chromium
npm run e2e             # runs against AUTOCHART_E2E_BASE_URL (default http://127.0.0.1:8000)
```

The specs live in `frontend/e2e/`. CI wires `e2e:install` when needed.

## Pre-commit

```bash
uv run pre-commit install
uv run pre-commit run --all-files
```

The config runs ruff (lint + format), Prettier, ESLint on staged frontend files, and `nbstripout` to keep notebook diffs clean.

## Environment

See `.env.example` for the full list. Highlights:

| Variable | Default | Purpose |
| --- | --- | --- |
| `AUTOCHART_HOST` / `AUTOCHART_PORT` | `127.0.0.1` / `8000` | Uvicorn binding |
| `AUTOCHART_ALLOWED_ORIGINS` | dev origins | CORS allow-list |
| `AUTOCHART_API_KEY` | *(unset)* | Optional `X-API-Key` gate on `/api/*` and `/mcp` |
| `AUTOCHART_LOG_LEVEL` / `AUTOCHART_LOG_JSON` | `INFO` / `1` | Structured logging via structlog |

## Notebook

`notebook.ipynb` remains the exploratory workspace used to develop the comparison and overlap logic before it was promoted to `src/autochart/backend/`.

## Notes

- Keep shapefile sidecar files together (`.shp`, `.dbf`, `.shx`, `.prj`, etc.).
- The service layer (`data.py`, `overlap.py`) is the single source of truth used by both the REST routes and MCP tools — extend logic there rather than duplicating in either transport.
- Overlap rendering uses `matplotlib`'s Agg backend so it works headlessly on the server.
