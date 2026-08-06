# AutoChart

AutoChart compares old and new UKHO geospatial navigation chart polygons and helps identify upgrade recommendations for customers. A single FastAPI process serves the REST API, an MCP JSON-RPC endpoint, and the built React SPA.

## Architecture

- **Frontend**: React + Vite in `frontend/` (chatbot and Leaflet map). The `/api/overlap` REST endpoint and the `chart.overlap` MCP tool remain available for programmatic use.
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

Test coverage:
- `tests/test_data.py` — lookup semantics per mode, scale filter, GeoJSON shape
- `tests/test_overlap.py` — `plot_panel_overlap` PNG magic bytes + metrics
- `tests/test_api.py` — REST endpoints via `TestClient`
- `tests/test_mcp.py` — JSON-RPC `tools/list` and `tools/call`

## Notebook

`notebook.ipynb` remains the exploratory workspace used to develop the comparison and overlap logic before it was promoted to `src/autochart/backend/`.

## Notes

- Keep shapefile sidecar files together (`.shp`, `.dbf`, `.shx`, `.prj`, etc.).
- The service layer (`data.py`, `overlap.py`) is the single source of truth used by both the REST routes and MCP tools — extend logic there rather than duplicating in either transport.
- Overlap rendering uses `matplotlib`'s Agg backend so it works headlessly on the server.
