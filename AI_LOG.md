# AI Change Log

This file tracks code and configuration changes made by AI in this repository.

## 2026-08-03

### Summary
- Scaffolded a full-stack baseline with React (Vite) frontend and FastAPI backend.
- Added a starter MCP-compatible JSON-RPC endpoint on the backend.
- Wired local development integration between frontend and backend.

### Added Files
- frontend/.gitignore
- frontend/index.html
- frontend/package.json
- frontend/src/App.jsx
- frontend/src/main.jsx
- frontend/src/styles.css
- frontend/vite.config.js
- src/autochart/backend/__init__.py
- src/autochart/backend/api/__init__.py
- src/autochart/backend/api/routes.py
- src/autochart/backend/mcp_server.py
- src/autochart/backend/main.py
- src/autochart/backend/schemas.py
- src/autochart/backend_runner.py
- src/autochart/cli.py

### Updated Files
- pyproject.toml
  - Added backend dependencies: fastapi, uvicorn.
  - Added script entry points: autochart-api and updated autochart CLI binding.
- README.md
  - Replaced with architecture overview and run instructions for frontend/backend.
- uv.lock
  - Refreshed dependency lock after adding backend packages.

### Backend Endpoints Added
- GET /
- GET /api/health
- POST /api/chat
- POST /mcp

### Notes
- Frontend dev server proxies /api and /mcp to http://localhost:8000.
- CORS is enabled for http://localhost:5173 in the FastAPI app.
- Existing unrelated change present in workspace: .github/copilot-instructions.md (not modified by AI in this task).

## 2026-08-03 (RAID Documentation Update)

### Summary
- Added project RAID tracking document.

### Added Files
- RAID_LOG.md

### Updated Files
- AI_LOG.md
  - Added this entry to track RAID documentation changes.

### Validation
- Confirmed RAID log file exists at repository root.

### Notes
- RAID log includes seeded sections for Risks, Assumptions, Issues, and Dependencies.

## 2026-08-05

### Summary
- Delivered the working chart-lookup application on top of the earlier scaffold: backend service layer, REST + MCP endpoints, SPA (chatbot + Leaflet map + panel overlap), reverse-proxy compatibility, pytest suite, and frontend ESLint/Prettier tooling.
- Merged PR #2 (`feat: wire chart lookup, map, and overlap through backend + MCP`); PR #3 is open with the follow-up fixes.

### Added Files
- src/autochart/backend/data.py — data service (loads `my_file_gdf_old.geojson` + `my_file_gdf_new.geojson`, `lookup(mode, value)`, `get_data(max_scale)`, `list_panels(max_scale)`, JSON sanitisation).
- src/autochart/backend/overlap.py — ported `plot_panel_overlap` from the notebook onto a matplotlib Agg backend, returns base64 PNG + metrics, enforces `Scale <= max_scale`.
- tests/__init__.py
- tests/conftest.py — FastAPI TestClient session fixture.
- tests/test_data.py — lookup semantics per mode, scale filter, GeoJSON shape.
- tests/test_overlap.py — PNG magic bytes and overlap metrics.
- tests/test_api.py — REST endpoints via TestClient.
- tests/test_mcp.py — JSON-RPC `tools/list`, `tools/call`, notification, unknown method/tool paths.
- frontend/.prettierignore
- frontend/.prettierrc.json
- frontend/eslint.config.js — ESLint flat config: `@eslint/js` recommended + React / React Hooks / React Refresh + `eslint-config-prettier`.

### Updated Files
- src/autochart/backend/main.py
  - Mounts the built SPA at `/`, serves hashed assets from `/app-assets/`, adds SPA fallback for client-side routing.
  - Disables FastAPI's default `/docs`, adds a custom `/docs` route calling `get_swagger_ui_html(openapi_url="openapi.json", ...)` so Swagger UI works behind a path-stripping reverse proxy.
  - Adds `/favicon.ico`, `/sw.js` (self-unregistering worker), and an optional `Clear-Site-Data` response for `/?nuke=1`.
  - `Cache-Control: no-store` on HTML responses to keep hashed asset references fresh.
- src/autochart/backend/api/routes.py
  - New endpoints: `POST /api/lookup`, `GET /api/data`, `GET /api/panels`, `POST /api/overlap`.
  - `POST /api/chat` now infers `{mode, value}` from natural sentences (falls back to explicit fields) and returns the underlying `LookupResponse`.
- src/autochart/backend/mcp_server.py
  - Implements `initialize`, `tools/list`, `tools/call`, and JSON-RPC notification (`id=None` → 204).
  - Advertises `chart.lookup`, `chart.get_data`, `chart.list_panels`, `chart.overlap`, and `chart.compare` (alias); shares the same service layer as REST.
- src/autochart/backend/schemas.py
  - Added `LookupMode`, `LookupRequest/Response`, `PanelListItem`, `OverlapRequest`, `OverlapMetrics`, `OverlapResponse`, `GetDataResponse`. Extended `ChatRequest`/`ChatResponse`.
- src/autochart/backend_runner.py
  - Env-var driven uvicorn (`AUTOCHART_HOST`, `AUTOCHART_PORT`, `AUTOCHART_RELOAD`); removed the unused `matchData` helper (merged from `origin/main`).
- frontend/index.html
  - Inline script that unregisters stale service workers left over from prior apps on the same origin; `Cache-Control` meta tags.
- frontend/vite.config.js
  - `base: "./"` and `build.assetsDir: "app-assets"` so the SPA works behind a prefix-stripping reverse proxy and dodges caches that key on the old `/assets/` path.
- frontend/package.json
  - Added `leaflet` and `react-leaflet` runtime deps.
  - Added dev deps: `eslint@^9`, `@eslint/js@^9`, `globals`, `eslint-plugin-react`, `eslint-plugin-react-hooks`, `eslint-plugin-react-refresh`, `eslint-config-prettier`, `prettier`.
  - New scripts: `lint`, `lint:fix`, `format`, `format:check`.
- frontend/package-lock.json — regenerated for the new deps.
- frontend/src/App.jsx
  - Replaced the placeholder chat form with three components:
    - `ChatBot`: mode selector (`chart_number`, `chart_name`, `chart_title`, `panel_id`) + value input → `POST api/chat` → matches table.
    - `MapView`: `GET api/data?max_scale=30000` → react-leaflet OSM base with old (navy) + new (orange) GeoJSON layers, popups from `properties`.
    - `OverlapView`: `GET api/panels?max_scale=30000` populates a dropdown, `POST api/overlap` renders the returned PNG + metrics.
  - All fetch calls use path-relative URLs (`api/...`) so the SPA works behind the reverse proxy.
  - Popups on old panels use `document.createElement + textContent` (XSS-safe) after CodeQL feedback.
- frontend/src/styles.css
  - New rules for `.row`, form inputs, `.match-cols`, `.map-wrap`, `.overlap-out`, `.error`, and panel `h2` styling.
- frontend/src/main.jsx — reformatted by Prettier.
- pyproject.toml
  - Added `[dependency-groups.dev]` block with `pytest`, `httpx`, `ipykernel`, `jupyter`, `nbconvert`.
  - Added `[tool.pytest.ini_options]` with `testpaths = ["tests"]`.
- uv.lock — refreshed for the new dev deps.
- notebook.ipynb — re-executed to refresh outputs after fixing a stale `PANEL_IDEN` selection cell.
- README.md — rewrote to cover the full REST + MCP surface, uv/npm run steps, reverse-proxy notes, pytest command, and lint/format scripts.

### Backend Endpoints Added
- GET /api/panels
- GET /api/data
- POST /api/lookup
- POST /api/overlap
- POST /api/chat (now backed by lookup / intent inference)
- POST /mcp (initialize, tools/list, tools/call, notifications)

### Frontend Additions
- Leaflet map with old + new panel overlays and popups.
- Chatbot component driving `/api/chat` → `/api/lookup`.
- Overlap viewer rendering `plot_panel_overlap` PNG output filtered to `Scale <= 30000`.
- Reverse-proxy compatibility: relative asset URLs (`vite base: "./"`) and relative fetches.

### Tooling & Tests
- pytest suite: 24 tests, all passing (`uv run pytest`).
- ESLint (flat) + Prettier: 0 lint findings, `prettier --check` clean.
- Vite production build: clean.

### Pull Requests
- PR #2 — `feat: wire chart lookup, map, and overlap through backend + MCP` — merged. Includes the initial backend/frontend build, tests, and README refresh.
- PR #3 — `fix: /docs relative openapi URL + repair broken OverlapView fetch` — open. Adds the Swagger-UI reverse-proxy fix, restores the `OverlapView` fetch chain, and layers on ESLint + Prettier.

### Validation
- `uv run pytest` → 24 passed.
- `cd frontend && npm run lint && npm run format:check && npm run build` → clean.
- `curl` against `/api/health`, `/api/lookup`, `/api/data`, `/api/panels`, `/api/overlap`, `/mcp tools/list|tools/call` → 200 with expected payloads.
- SPA loads through `https://code-lab8102.labs.decoded.com/proxy/8000/` with a trailing slash.

### Notes
- Backend still loads GeoJSON exports at repo root (`my_file_gdf_*.geojson`) rather than reading `data_original/*.shp` directly, as suggested by CLAUDE.md. Left as a follow-up.
- Overlap service uses matplotlib's Agg backend, so the plotting works headlessly on the server.
- The reverse proxy (`.../proxy/<port>/`) strips its prefix; all client-facing URLs must be path-relative and the URL must have a trailing slash.
- FastAPI's `/docs` was replaced with a custom route because the default Swagger UI hardcodes an absolute `/openapi.json`.

## 2026-08-05 (Frontend tests)

### Summary
- Added Vitest + React Testing Library to the frontend and wrote component tests for the three main views.

### Added Files
- frontend/src/test/setup.js — imports jest-dom matchers, cleans up between tests.
- frontend/src/test/ChatBot.test.jsx — 4 tests (render, POST body, API error, blank-value disable).
- frontend/src/test/OverlapView.test.jsx — 3 tests (panel dropdown, overlap request + PNG render, error surface).
- frontend/src/test/MapView.test.jsx — 3 tests (loading state, GeoJSON layer counts, error banner); mocks `react-leaflet` so tests run without a canvas-capable DOM.

### Updated Files
- frontend/vite.config.js — Vitest `test` block: `jsdom` env, `globals: true`, `setupFiles`, `css: false`.
- frontend/package.json — added dev deps `vitest`, `jsdom`, `@testing-library/react`, `@testing-library/jest-dom`, `@testing-library/user-event`; new scripts `test` and `test:watch`.
- frontend/package-lock.json — refreshed lockfile.
- frontend/src/App.jsx — exported `ChatBot`, `MapView`, `OverlapView` as named exports so tests can render them in isolation.
- frontend/eslint.config.js — override block for test files (relaxes `react/display-name`, `react-refresh/only-export-components`, `no-undef`).
- README.md — new "Frontend tests" section documenting the Vitest commands and coverage.

### Validation
- `npm test` → 10 passed (3 files).
- `npm run lint` → 0 issues.
- `npm run format:check` → clean.
- `npm run build` → clean.

### Notes
- Full react-leaflet render fails under jsdom (no canvas). Tests mock it via `vi.mock("react-leaflet", ...)` and assert on the passthrough elements plus data attributes.

## 2026-08-06

### Summary
- Trim the SPA per stakeholder feedback: drop the initial "Ask about a chart." placeholder inside the ChatBot and remove the Panel-overlap section entirely from the UI. Backend `/api/overlap` and MCP `chart.overlap` remain in place for programmatic callers.

### Updated Files
- frontend/src/App.jsx
  - `ChatBot`: initial `reply` state is empty and the `<pre>` is only rendered when there is text.
  - `OverlapView` component removed along with its render in `App`; hero copy updated to "chatbot and map".
- frontend/src/test/OverlapView.test.jsx — deleted (component no longer exists).
- README.md — architecture bullet reflects "chatbot and map"; frontend-tests list drops the OverlapView entry.

### Validation
- `npm test` → 7 passed (2 files).
- `npm run lint` → 0 issues.
- `npm run format:check` → clean.
- `npm run build` → clean.

### Notes
- Backend/MCP overlap functionality and its pytest coverage are untouched; only the UI surface was removed.

## Ongoing Tracking Format
Use this format for future entries:

### YYYY-MM-DD
- Summary:
- Added:
- Updated:
- Removed:
- Validation:
- Notes:
