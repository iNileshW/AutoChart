# AI Change Log

This file tracks code and configuration changes made by AI in this repository.

## 2026-08-07

### Summary
- Added a one-step VS Code startup flow to run backend and frontend together.

### Added Files
- .vscode/tasks.json
  - Added three tasks:
    - `dev:backend` runs `uv run autochart-api`
    - `dev:frontend` runs `npm run dev` from `frontend/`
    - `dev:all` compound task starts both in parallel

### Updated Files
- README.md
  - Added a "One-step startup in VS Code" section with `dev:all` usage and stop instructions.

### Validation
- Verified backend health endpoint returns 200 at `http://127.0.0.1:8000/api/health`.
- Verified frontend dev server returns 200 at `http://localhost:5173/`.

### Notes
- The one-step flow is task-based (VS Code Tasks) and does not replace existing CLI commands.
- Updated `dev:frontend` task to call `npx vite --host 127.0.0.1 --port 5173 --strictPort` directly, because npm argument forwarding in PowerShell dropped option flags and caused unstable startup behavior.

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

## 2026-08-06 (Map zoom + overlap on chat lookup)

### Summary
- The ChatBot now drives the map: submitting a lookup zooms the map onto the matched panels, highlights them, and paints the old ∩ new intersection.

### Added Files
- (backend logic added in-place — no new source files)

### Updated Files
- src/autochart/backend/data.py — new `overlap_geojson(panel_names, max_scale)` returning a GeoJSON FeatureCollection with the old ∩ new intersection polygons (EPSG:4326), plus `bounds_4326`, `old_selected_4326`, `new_selected_4326`. `_select_by_names` helper for case-insensitive name filtering.
- src/autochart/backend/overlap.py — replaced deprecated `unary_union` with `union_all()`.
- src/autochart/backend/schemas.py — added `OverlapGeoJSONRequest`.
- src/autochart/backend/api/routes.py — added `POST /api/overlap-geojson`.
- tests/test_data.py — coverage for `overlap_geojson` (populated + empty).
- tests/test_api.py — coverage for `/api/overlap-geojson`.
- frontend/src/App.jsx
  - `ChatBot` now accepts `onLookup(lookup)`, called with the returned lookup on success and `null` on failure.
  - `MapView` accepts `focus` (a lookup response). It fetches `/api/overlap-geojson`, highlights matched features (thicker border, higher fill), and adds a green intersection overlay layer.
  - `FocusController` (inner component, uses `useMap`) calls `map.fitBounds` when the overlap bounds arrive.
  - `App` holds the lookup state and wires `ChatBot` ↔ `MapView`.
- frontend/src/test/ChatBot.test.jsx — new test asserting `onLookup` is called with the returned payload.
- frontend/src/test/MapView.test.jsx — new test asserting `/api/overlap-geojson` is called with the collected panel names when `focus` is provided; `useMap` stubbed in the `react-leaflet` mock.
- README.md — endpoint table updated with `/api/overlap-geojson`.

### Validation
- `uv run pytest` → 27 passed, 1 warning (only starlette TestClient deprecation).
- `cd frontend && npm test` → 9 passed.
- `npm run lint` → 0 issues.
- `npm run format:check` → clean.
- `npm run build` → clean.

### Notes
- Frontend matching is done by panel name (`PANEL_MAIN` for old, `Panel_Name` for new). `Panel_ID` is not unique in the new dataset, so name matching is more stable.
- The backend keeps the existing `/api/overlap` (PNG) endpoint for the MCP tool and for programmatic consumers; the map path uses the new GeoJSON endpoint.

## 2026-08-06 (Parity pass: MCP tool + missing tests)

### Summary
- Expose the new intersection endpoint over MCP so both transports are at feature parity.
- Cover the empty-input branch of `/api/overlap-geojson` and the new MCP tool.

### Updated Files
- src/autochart/backend/mcp_server.py — new `chart.overlap_geojson` tool advertised in `tools/list` and dispatched in `_call_tool`.
- tests/test_api.py — added `test_overlap_geojson_empty_input`.
- tests/test_mcp.py — `tools/list` now asserts on `chart.overlap_geojson`; new `test_tools_call_overlap_geojson_returns_intersection`.
- README.md — MCP tool list includes `chart.overlap_geojson`.

### Validation
- `uv run pytest` → 29 passed, 1 warning.
- Live `POST /mcp tools/list` → `['chart.lookup', 'chart.get_data', 'chart.overlap', 'chart.overlap_geojson', 'chart.list_panels', 'chart.compare']`.
- Live `chart.overlap_geojson` call for `["Looe", "F Looe", "Looe Bay"]` returns 1 intersection polygon + bounds.

## 2026-08-06 (MCP chatbot page)

### Summary
- Add a second UI view: an MCP chatbot that talks JSON-RPC directly to `/mcp`. Reached from a new top-nav link ("MCP chatbot"). Home view is unchanged.

### Added Files
- frontend/src/test/MCPChat.test.jsx — coverage for tool-list load, `tools/call` body, invalid-JSON guard, JSON-RPC error surfacing.

### Updated Files
- frontend/src/App.jsx
  - `mcpCall(method, params)` helper (path-relative `mcp` fetch).
  - `MCPChat` component: fetches `tools/list`, renders a tool selector + textarea prefilled from the tool's `inputSchema` sample, calls `tools/call` with parsed args, renders each content chunk (text → `<pre>` with pretty-printed JSON when parseable; image → base64 `<img>`).
  - `App` gains a `view` state and a top nav with "Home" and "MCP chatbot" buttons; existing Home wiring (`ChatBot` + `MapView`) untouched.
  - Extracted a pure `sampleArgsFor(tool)` helper so tool-change resets happen in the `<select>` `onChange` handler instead of a setState-in-effect chain.
- frontend/src/styles.css — new `.topnav`, `.nav-link`, `.muted` rules; consolidated the `textarea` block.
- README.md — mentions the new top-nav view and lists the new test file.

### Validation
- `cd frontend && npm test` → 13 passed (3 files).
- `npm run lint` → 0 issues.
- `npm run format:check` → clean.
- `npm run build` → clean.
- Live backend serves the new bundle; `/mcp` unchanged.

### Notes
- User-event's `.type()` interprets `{...}` as escape sequences, so the "issues tools/call" test uses `.paste()` to insert raw JSON.
- Home flow (Chatbot → MapView zoom + overlap) is unchanged.

## 2026-08-06 (Conversational MCP chatbot)

### Summary
- Reshape the MCP chatbot: no more direct tool-call UI or raw JSON output. Users type a natural-language chart query, backend parses it and returns a single prose sentence via a new `chart.answer` MCP tool.

### Updated Files
- src/autochart/backend/data.py — new `answer(query)` helper + `_summarise_matches` prose formatter. Parses digit blocks as chart numbers, tokens containing `_` and a digit as panel IDs, otherwise falls back to name search. Returns a plain sentence.
- src/autochart/backend/mcp_server.py — new `chart.answer` MCP tool (advertised in `tools/list`, dispatched in `_call_tool`).
- tests/test_data.py — coverage for `answer` (chart number, name, unknown, empty).
- tests/test_mcp.py — `tools/list` asserts on `chart.answer`; new `test_tools_call_answer_returns_prose` verifies the returned text is prose (no `{` or `}`).
- frontend/src/App.jsx
  - `MCPChat` rewritten: chat thread with user + assistant bubbles, an input, Enter-to-send. Only calls `chart.answer` via the existing `mcpCall` helper. Removed the tool selector, JSON textarea, `sampleArgsFor`, and result-content rendering.
  - `App` view toggle unchanged; MCP tab now shows the conversational widget.
- frontend/src/styles.css — new `.chat-thread`, `.chat-msg`, `.chat-user`, `.chat-assistant`, `.chat-role`, `.sr-only`.
- frontend/src/test/MCPChat.test.jsx — rewritten to cover: empty mount, chart.answer request body + prose render, Enter submits, JSON-RPC error message surfaces, empty input disables send.
- README.md — MCP tool list mentions `chart.answer`; Home/MCP nav description updated.

### Validation
- `uv run pytest` → 34 passed, 1 warning.
- `cd frontend && npm test` → 14 passed.
- `npm run lint` → 0 issues.
- `npm run format:check` → clean.
- `npm run build` → clean.
- Live `POST /mcp chart.answer {"query": "2345"}` → prose string with panel names and scales, no raw JSON.

### Notes
- The existing programmatic MCP tools (`chart.lookup`, `chart.overlap`, `chart.overlap_geojson`, `chart.get_data`, `chart.list_panels`, `chart.compare`) remain untouched for scripting and agent use; only the frontend surface changed.

## 2026-08-06 (Observability baseline)

### Summary
- Wire a light observability stack — env-gated so nothing is required for dev — covering metrics, tracing, error reporting, health probes, and browser web-vitals.

### Added Files
- src/autochart/backend/observability.py — `install(app)` wires Prometheus, OpenTelemetry, and Sentry when their env vars are set; `log_web_vital` normalises browser reports through structlog.
- tests/test_observability.py — coverage for `/livez`, `/healthz`, `/metrics`, and the telemetry endpoint (accept + validation).
- docs/adr/0003-observability-baseline.md — decision record.
- frontend/src/telemetry.js — CLS/INP/LCP/FCP/TTFB reporter using `navigator.sendBeacon`.

### Updated Files
- pyproject.toml + uv.lock — added prometheus-fastapi-instrumentator, opentelemetry-{api,sdk,instrumentation-fastapi,exporter-otlp-proto-http}, sentry-sdk[fastapi] as runtime deps.
- src/autochart/backend/config.py — new toggles: METRICS_ENABLED, OTEL_ENDPOINT, OTEL_SERVICE_NAME, SENTRY_DSN/ENVIRONMENT/TRACES_SAMPLE_RATE.
- src/autochart/backend/main.py — calls `install_observability(app)` at construction; adds `/livez`, `/healthz`, and `POST /api/telemetry` (WebVitalIn).
- src/autochart/backend/security.py — public paths list now covers `/livez`, `/healthz`, `/metrics`.
- .env.example — documents the new env vars.
- frontend/package.json — adds `web-vitals@^4`.
- frontend/src/main.jsx — calls `reportWebVitals()` at mount.
- docs/adr/README.md, README.md — link ADR 0003 and document the new endpoints.

### Validation
- `uv run pytest` → 45 passed, 81.4% coverage (above the 75% floor).
- `uv run ruff check src tests` / `ruff format --check` — clean.
- `uv run mypy` — clean.
- `cd frontend && npm run lint && npm test && npm run build` — clean; index chunk +2 KB gzip for web-vitals.

### Notes
- All observability entry points fail silently when their libraries are absent (never blocks startup).
- `/metrics` is currently public — noted in ADR 0003 as a follow-up if scraped from an untrusted network.

## Ongoing Tracking Format
Use this format for future entries:

### YYYY-MM-DD
- Summary:
- Added:
- Updated:
- Removed:
- Validation:
- Notes:
