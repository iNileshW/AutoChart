# AI Change Log

This file tracks code and configuration changes made by AI in this repository.

## 2026-08-10 (Report cleanup pass: figure numbering 0-10 + content consistency)

### Timestamp
- 2026-08-10 11:40:34 +01:00

### Summary
- Resolved all reported report issues in one pass.
- Normalized figure references and index to a strict `Figure 0` to `Figure 10` scheme.
- Fixed heading-number gap in Chapter 7 and corrected mismatched section title/content in Chapter 8.
- Corrected grammar and pronoun consistency in Acknowledgements and Project Delivery text.

### Updated Files
- docs/graduation-report.md
  - Updated List of Figures to match in-text figure captions and numbering.
  - Renumbered figure captions in body content for architecture/RAID/observability and screenshots.
  - Changed `7.6 Docker, docker-compose, and CI/CD Delivery` to `7.5 ...`.
  - Renamed `8.3` section to align with actual Grafana content.
  - Improved wording and corrected typos in added narrative text.

### Why Changed
- User requested all identified review issues to be fixed and confirmed figure numbering preference (`0` to `10`).

### Validation
- Markdown diagnostics check passed with no file errors.

### Changed By
- GitHub Copilot (GPT-5.3-Codex)

## 2026-08-10 (Report update: TOC sync + UKHO design system references)

### Timestamp
- 2026-08-10 11:18:02 +01:00

### Summary
- Rechecked and synchronised the graduation report table of contents against current chapter headings.
- Added explicit chapter text describing UKHO design-system and CSS-policy alignment in frontend styling decisions.
- Added missing references for Admiralty Design System, UKHO CSS Coding Standards, and UKHO Front End Policy.

### Updated Files
- docs/graduation-report.md
  - Added `3.11 UKHO Design System and CSS Policy Alignment`.
  - Expanded references list with UKHO policy/design-system sources.

### Why Changed
- User identified missing design-system/policy reference coverage after report edits.

### Validation
- Verified chapter headings and contents alignment.
- Markdown diagnostics check passed after update.

### Changed By
- GitHub Copilot (GPT-5.3-Codex)

## 2026-08-10 (Report restructure: new Project Delivery chapter with slide snapshots)

### Timestamp
- 2026-08-10 11:04:08 +01:00

### Summary
- Converted the former "Alignment with Project Presentation Evidence" subsection into a standalone chapter: **Project Delivery**.
- Added two slide-based delivery snapshots (Slide 10 deployment and Slide 11 delivery outcomes) to support chapter evidence.
- Renumbered subsequent chapters and updated table of contents and figure index accordingly.

### Updated Files
- docs/graduation-report.md
  - Added `Chapter 8: Project Delivery`.
  - Added Figure 7 and Figure 8 image embeds using new assets.
  - Shifted chapter numbering:
    - Conclusion -> Chapter 9
    - References -> Chapter 10
    - Appendices -> Chapter 11
  - Updated appendix mapping references to new chapter numbers.
- docs/assets/figures/slide10-project-delivery.png
- docs/assets/figures/slide11-project-delivery.png

### Why Changed
- User requested promotion of the alignment subsection to a new chapter and inclusion of project-delivery screenshots from Slides 10 and 11.

### Validation
- Verified chapter headings, table of contents, and figure references after renumbering.

### Changed By
- GitHub Copilot (GPT-5.3-Codex)

## 2026-08-10 (Report completion: Docker, docker-compose, CI/CD coverage)

### Timestamp
- 2026-08-10 11:04:08 +01:00

### Summary
- Added explicit graduation-report coverage for Docker, docker-compose, and CI/CD work already delivered in the project.
- Added a dedicated subsection in Chapter 7 and a new evidence table for containerisation and pipeline delivery.
- Updated appendix compliance snapshot to reflect these operational delivery artefacts.

### Updated Files
- docs/graduation-report.md
  - Added `7.6 Docker, docker-compose, and CI/CD Delivery`.
  - Added **Table 9**: Containerisation and CI/CD delivery evidence.
  - Updated List of Tables to include Table 9.
  - Updated Appendix C to explicitly include container and CI/CD coverage.

### Why Changed
- User identified missing explicit documentation of Docker, docker-compose, and CI/CD tasks in the report.

### Validation
- Markdown diagnostics check completed after updates (no file errors).

### Changed By
- GitHub Copilot (GPT-5.3-Codex)

## 2026-08-10 (Report structure reorder per reviewer request)

### Timestamp
- 2026-08-10 10:03:28 +01:00

### Summary
- Reordered graduation report chapters per user review comments.
- Moved Business Case content to Chapter 2.
- Moved RAID and REST/MCP/Observability chapters to appear before Conclusion.
- Updated chapter numbering and table of contents accordingly.

### Updated Files
- docs/graduation-report.md
  - New chapter order:
    1. Introduction
    2. Business Case
    3. Architecture
    4. Methodology
    5. Data Handling
    6. RAID Register for Graduation Governance
    7. REST API, MCP, and Observability Delivery
    8. Conclusion
    9. References
    10. Appendices

### Why Changed
- User requested chapter order changes for submission flow and readability.

### Validation
- Verified all chapter headings are present and in requested order.

### Changed By
- GitHub Copilot (GPT-5.3-Codex)

## 2026-08-10 (Attachment-driven report revision: PPTX alignment + images)

### Timestamp
- 2026-08-10 09:36:53 +01:00

### Summary
- Reviewed the attached presentation (`AutoChart_Overview final_copy.pptx`) and extracted slide themes to cross-check report coverage.
- Added concrete images to the graduation report using available project assets.
- Modified Chapter 8 to explicitly align report narrative with the presentation evidence.

### Updated Files
- docs/graduation-report.md
  - Added image on title page using UKHO logo asset.
  - Added presentation thumbnail image and new subsection: "8.5 Alignment with Project Presentation Evidence".
  - Added Appendix F mapping presentation themes to report chapters.
- docs/assets/figures/pptx-overview-thumbnail.jpeg
  - Added extracted presentation thumbnail image for report embedding.
- docs/assets/figures/ukho-logo.svg
  - Added copied project logo asset for report embedding.

### Why Changed
- User requested that the attached presentation be considered and that images and section modifications be included in the graduation report.

### Validation
- Confirmed markdown diagnostics for updated files showed no errors.

### Changed By
- GitHub Copilot (GPT-5.3-Codex)

## 2026-08-10 (Report gap closure: Observability, MCP, REST API coverage)

### Timestamp
- 2026-08-10 09:36:53 +01:00

### Summary
- Addressed a documented content gap in the graduation report where Observability, MCP, and REST API delivery detail was not explicit enough.
- Added a dedicated chapter covering architecture, delivery evidence, and validation outcomes for these three workstreams.
- Updated figure and table indices to include new governance-quality evidence artefacts.

### Updated Files
- docs/graduation-report.md
  - Added explicit Chapter 8: REST API, MCP, and Observability Delivery.
  - Added sections for:
    - REST API contract and endpoint delivery evidence.
    - MCP tooling architecture and JSON-RPC validation evidence.
    - Observability signal pipeline and operational outcomes.
  - Added Figure 5 (observability pipeline) and Tables 6-8 (REST/MCP/observability evidence).
  - Updated chapter numbering to keep references and appendices aligned.

### Why Changed
- User reported missing coverage for observability and interface-delivery work in the report.

### Validation
- Markdown diagnostics check completed after edits (no file errors).

### Changed By
- GitHub Copilot (GPT-5.3-Codex)

## 2026-08-10 (Documentation completeness pass: AI log, RAID alignment, report reformat)

### Timestamp
- 2026-08-10 09:25:46 +01:00

### Summary
- Reviewed AI and RAID logs for completeness and consistency with project documentation policy.
- Added a full documentation-change log entry with explicit reason, scope, and validation.
- Reformatted the graduation report for missing submission areas and added a dedicated RAID section.

### Updated Files
- AI_LOG.md
  - Added this completion entry to capture the follow-up documentation work and audit trace.
- RAID_LOG.md
  - Updated header metadata and appended RAID records related to graduation-report governance.
- docs/graduation-report.md
  - Reworked front matter and chapter structure for clearer graduation-report readability.
  - Added an explicit RAID chapter section with tabled risks, assumptions, issues, and dependencies.
  - Expanded references and appendices formatting for submission clarity.

### Why Changed
- User identified missing/incomplete documentation coverage in logs and report layout.
- This pass closes traceability gaps between deliverable artefacts and governance records.

### Validation
- Checked markdown diagnostics for modified documentation files (no errors).

### Changed By
- GitHub Copilot (GPT-5.3-Codex)

## 2026-08-10 (Graduation report authoring)

### Summary
- Authored a complete graduation report document in UK English with a professional academic tone.
- Included requested rhetorical devices (simile, metaphor, irony, alliteration) within appropriate narrative sections.
- Structured the report with title page, acknowledgements, abstract, contents, list of figures/tables, required chapters, references, and appendices.

### Added Files
- docs/graduation-report.md
  - Contains chapters:
    - Introduction
    - Architecture
    - Methodology
    - Data Handling
    - Business Case
    - Conclusion
  - Includes Mermaid-based figures and tabular summaries for requirements, technology, business impact, and risk posture.

### Validation
- Checked markdown file diagnostics in-editor (no file errors).

### Why Changed
- To satisfy the graduation deliverable request for a complete, structured project report suitable for submission.

### Changed By
- GitHub Copilot (GPT-5.3-Codex)

## 2026-08-07 (SPA security tests + CI security gate)

### Summary
- Added focused SPA traversal/security tests.
- Added a dedicated CI security job with explicit fail/warn policy.
- Hardened SPA fallback implementation to avoid serving user-controlled paths.

### Added Files
- tests/test_spa_security.py
  - Validates:
    - `/?nuke=1` sets `Clear-Site-Data`
    - `/sw.js` returns unregister script and `no-store`
    - traversal payloads resolve to SPA index, not arbitrary filesystem files
    - fallback serves only allowlisted top-level files

### Updated Files
- src/autochart/backend/main.py
  - Added `mount_spa_routes(app, frontend_dist)` to make SPA route behavior testable in isolation.
  - Catch-all SPA fallback now always returns `index.html`.
  - Added explicit routes for `robots.txt` and `manifest.webmanifest`.
  - Removed user-controlled path input from `FileResponse` selection in fallback flow.
- .github/workflows/ci.yml
  - Added `security` job:
    - Python runtime scan via `pip-audit` against the synced runtime environment (fail).
    - npm runtime audit high/critical via `npm audit --omit=dev --audit-level=high` (fail).
    - npm full-tree moderate+ audit via `npm audit --audit-level=moderate` (warn-only).
  - Docker job now depends on backend, frontend, and security jobs.
- README.md
  - Added CI security policy section (fail/warn behavior).
  - Added SPA traversal hardening decision note: hardened implementation, no suppression.

### Validation
- `uv run pytest`
- `uv run ruff check src tests`
- `uv run ruff format --check src tests`
- `uv run mypy`
- `uvx --from pip-audit pip-audit`
- `cd frontend && npm run lint && npm test && npm audit --omit=dev --audit-level=high`

### Follow-up fixes
- Fixed CI backend failure by applying Ruff formatting to `src/autochart/backend/main.py`.
- Fixed CI security failure by replacing `pip-audit -r requirements-runtime.txt` with direct environment scan (`uvx --from pip-audit pip-audit`) to avoid editable+hash install errors.

### Changed By
- GitHub Copilot (GPT-5.3-Codex)

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

## 2026-08-06 (Hardening pass — CI, Docker, security, a11y, coverage)

### Summary
- Comprehensive hardening pass covering backend security, frontend accessibility, DevOps, and CI.
- PR #6 merged (`chore: hardening pass — CI, Docker, security, a11y, coverage`).

### Added Files
- `.dockerignore` — trims Docker build context (excludes node_modules, .venv, notebooks).
- `.env.example` — documents all supported environment variables.
- `.github/workflows/ci.yml` — GitHub Actions CI: ruff + mypy + pytest-cov (backend), ESLint + Vitest + build (frontend), Docker build; all gated on PRs to main.
- `.pre-commit-config.yaml` — pre-commit hooks: ruff, ruff-format, nbstripout, Prettier, ESLint on staged files.
- `Dockerfile` — multi-stage: Node builds SPA, Python 3.13 slim serves via uvicorn; non-root user; curl-based HEALTHCHECK.
- `docker-compose.yml` — wires env vars from `.env`; tmpfs + read-only filesystem for the container.
- `LICENSE` — MIT licence.
- `src/autochart/backend/config.py` — env-var driven config: allowed origins, API key, log level/JSON toggle.
- `src/autochart/backend/logging_setup.py` — structured JSON logging via structlog; request middleware logs method/path/status/duration and injects `X-Request-ID`.
- `src/autochart/backend/security.py` — optional `X-API-Key` middleware; public routes (health, docs, `/`, favicon, sw.js, `/app-assets`) bypass the gate.
- `tests/test_security.py` — 54-line pytest suite covering API-key enforcement and public-route bypass.
- `frontend/e2e/chatbot.spec.js` — Playwright smoke test.
- `frontend/playwright.config.js` — Playwright config.

### Updated Files
- `pyproject.toml` — added `[tool.ruff]`, `[tool.mypy]`, pytest-cov gate (75% coverage floor); new dev deps: mypy, pytest-cov, nbstripout, pre-commit; structlog promoted to runtime.
- `src/autochart/backend/main.py` — calls `install_observability(app)`; CORS sourced from `AUTOCHART_ALLOWED_ORIGINS`; SPA fallback rejects `..` traversal and out-of-root paths; routes mounted at both `/api` and `/api/v1`.
- `frontend/src/App.jsx` — WCAG 2.2 fixes: skip link, `:focus-visible` ring, min 44×44 buttons, `aria-live`/`role=status`, `aria-current` on nav, `aria-labelledby` on map; `MapView` extracted to its own module and lazy-loaded via Suspense.
- `frontend/src/MapView.jsx` — extracted from App.jsx; code-split via Suspense; leaflet + react-leaflet pinned to a `map-vendor` Rollup chunk (~9 KB gzip initial JS).
- `frontend/eslint.config.js` — `eslint-plugin-jsx-a11y` wired into flat config; test/config files opt out of a11y click-key rules.
- `frontend/src/styles.css` — focus ring, reduced-motion, min-touch-target rules.
- `frontend/vite.config.js` — Vitest v8 coverage config with per-metric thresholds; `e2e/` excluded.
- `frontend/package.json` — Playwright scripts (`e2e`, `e2e:install`, `test:coverage`).
- `RAID_LOG.md` — added R-004..R-008 risks, I-002..I-004 issues, change-history entry.
- `README.md` — Docker, Playwright, pre-commit, env-var documentation; CI/License badges.

### Validation
- `uv run pytest --cov` → all passed, coverage above 75% floor.
- `uv run ruff check src tests` / `ruff format --check` → clean.
- `uv run mypy` → clean.
- `cd frontend && npm run lint && npm test && npm run build` → clean.
- Docker image builds and `HEALTHCHECK` passes.

### Changed By
- GitHub Copilot / Claude Opus 4.7 (1M context)

---

## 2026-08-06 (Admiralty brand tokens + UKHO logo + architecture docs)

### Summary
- Applied Admiralty Design System visual language to the frontend.
- Scaffolded architecture documentation and ADR framework.
- PR hardening: swapped to horizontal white UKHO logo variant after initial merge.

### Added Files
- `frontend/public/ukho-logo.svg` — horizontal blue UKHO logo (SVG).
- `docs/architecture.md` — Mermaid context, request-flow, MCP tool catalogue, and deployment diagrams.
- `docs/adr/README.md` — ADR index.
- `docs/adr/0000-adr-template.md` — gov.uk ADR template.
- `docs/adr/0001-single-fastapi-serves-spa-rest-mcp.md` — ADR: single FastAPI process.
- `docs/adr/0002-admiralty-design-tokens-and-logo.md` — ADR: Admiralty tokens + logo.

### Updated Files
- `frontend/src/styles.css` — `--admiralty-{navy,marine-blue,red,gold,ink}` CSS custom properties; buttons, panels, nav match flat Admiralty visual language; focus ring uses GDS yellow/ink for WCAG-compliant contrast; font stack falls back to Arial.
- `frontend/src/App.jsx` — navy page header with UKHO logo SVG and "AutoChart" wordmark.
- `README.md` — links to architecture doc and ADR index.

### Follow-up Fix
- `fix(ui): swap UKHO logo to the horizontal white variant` — replaced initial logo with the correct horizontal white SVG variant for the navy header background.

### Validation
- `cd frontend && npm run lint && npm test && npm run build` → clean.
- Visual inspection confirmed logo renders correctly in navy header.

### Changed By
- GitHub Copilot / Claude Opus 4.7 (1M context)

---

## 2026-08-06 (Agent Chatbot rebrand)

### Summary
- Renamed the "MCP chatbot" tab to "Agent Chatbot" throughout the UI for clarity.
- No behavioural change — still calls `chart.answer` over MCP.

### Updated Files
- `frontend/src/App.jsx` — nav link, hero heading, panel title, and chat bubble role label updated from "MCP chatbot" to "Agent Chatbot" / "Agent Chat" / "Agent".

### Validation
- `cd frontend && npm test` → passed.
- `npm run lint` → 0 issues.

### Changed By
- GitHub Copilot / Claude Opus 4.7 (1M context)

---

## 2026-08-06 (Local Grafana + Prometheus stack + FastAPI proxy)

### Summary
- Added a local observability deploy stack (Prometheus + Grafana) and a FastAPI reverse-proxy route so the Grafana UI is reachable through the single exposed port.
- PR #8 merged. Follow-up fix applied: `fix(grafana_proxy): dict-ify response headers for StreamingResponse`.
- Copilot Autofix applied PR security findings to `grafana_proxy.py`, `deploy/observability/docker-compose.yml`, and `tests/test_observability.py`.

### Added Files
- `deploy/observability/docker-compose.yml` — runs Prometheus 3.1 (scrapes `/metrics` every 5 s) and Grafana 11.4 (anonymous viewer + admin/admin).
- `deploy/observability/prometheus.yml` — Prometheus scrape config.
- `deploy/observability/grafana/dashboards/autochart.json` — "AutoChart — Overview" dashboard: request rate, p50/p95 latency, status class, memory, CPU, error rate.
- `deploy/observability/grafana/provisioning/dashboards/dashboards.yml` — Grafana dashboard provisioning.
- `deploy/observability/grafana/provisioning/datasources/prometheus.yml` — Grafana datasource provisioning.
- `src/autochart/backend/grafana_proxy.py` — reverse-proxy: when `AUTOCHART_GRAFANA_UPSTREAM` is set, mounts `/grafana/*` streaming requests to local Grafana; `AUTOCHART_GRAFANA_UPSTREAM_PREFIX` re-adds any stripped URL prefix.

### Updated Files
- `src/autochart/backend/main.py` — mounts `grafana_proxy` when env var is set.
- `src/autochart/backend/security.py` — `/grafana` added to public paths so API-key gate does not block the UI.
- `.env.example` — documents `AUTOCHART_GRAFANA_UPSTREAM` and `AUTOCHART_GRAFANA_UPSTREAM_PREFIX`.
- `README.md` — documents direct-access and reverse-proxy Grafana configurations.

### Validation
- `uv run pytest` → all passed.
- Grafana UI accessible at `http://127.0.0.1:8000/grafana/` when stack is running.

### Changed By
- GitHub Copilot / Claude Opus 4.7 (1M context); Copilot Autofix (security findings)

---

## 2026-08-06 (Playwright vitals probe + CLAUDE.md)

### Summary
- Added `e2e/vitals-probe.js` Playwright script as a one-shot web-vitals probe.
- Committed `CLAUDE.md` (Claude-specific project instructions mirror of `copilot-instructions.md`).

### Added Files
- `frontend/e2e/vitals-probe.js` — standalone Playwright script that navigates to the app and reports CLS, INP, LCP, FCP, TTFB from the browser console.
- `CLAUDE.md` — project development instructions for Claude AI agents.

### Changed By
- GitHub Copilot / Claude Opus 4.7 (1M context)

---

## 2026-08-06 (Presentation — Reveal.js deck + PowerPoint + backend route)

### Summary
- Created a Reveal.js slide deck summarising the project and served it from the FastAPI backend.
- Added final PowerPoint presentation slide.

### Added Files
- `docs/presentation/index.html` — Reveal.js deck: problem statement, architecture, frontend views, chat→map→overlap sequence, Admiralty design system, WCAG 2.2 work, observability KPIs, DevOps/CI stats, ADR trail. Uses reveal.js + mermaid + highlight.js from jsDelivr; no build step.
- `docs/presentation/README.md` — instructions for serving the deck.
- `docs/presentation/ukho-logo.svg` — UKHO logo asset for the deck.

### Updated Files
- `src/autochart/backend/main.py` — mounts `docs/presentation/` as `StaticFiles` under `/presentation` (with `html=True` so `/presentation/` resolves to `index.html`).
- `src/autochart/backend/security.py` — `/presentation` added to public paths.
- `README.md` — references the presentation deck.

### Notes
- The lab VM only exposes port 8000, so mounting the deck via FastAPI makes it reachable at `https://<host>/proxy/8000/presentation/`.
- PowerPoint slide (`added the powerpoint presentation slide`, `added final presentation`) added separately to the repository.

### Changed By
- GitHub Copilot / Claude Opus 4.7 (1M context)

---

## 2026-08-06 (CI and Docker fixes)

### Summary
- Series of CI/Docker stability fixes applied after the hardening pass merged.

### Updated Files
- `frontend/package-lock.json` — regenerated in sync with `package.json` to fix CI npm install failures.
- `frontend/package.json` + `frontend/vite.config.js` — pinned Vitest 2.x and jsdom 25 to match the Vite 5 esbuild version, resolving CI test runner version conflicts.
- `.github/workflows/ci.yml` — pinned all job runners to `ubuntu-24.04` for reproducibility; Docker job runner also pinned.
- `Dockerfile` — added `COPY README.md .` so `uv sync` can build the `autochart` package (pyproject.toml `readme` field requires it).
- `src/autochart/backend/main.py` — reformatted by Ruff after Copilot autofix.

### Validation
- CI pipeline green after all fixes.

### Changed By
- GitHub Copilot; Copilot Autofix

---

## 2026-08-06 (PR security findings — hardening / observability)

### Summary
- Copilot Autofix applied fixes for GitHub pull request security findings across the hardening and observability PRs.
- Separate fixes applied to test auth helper references after helper was refactored.

### Updated Files
- `src/autochart/backend/data.py`, `src/autochart/backend/mcp_server.py`, `src/autochart/backend/main.py`, `src/autochart/backend/overlap.py`, `src/autochart/backend/schemas.py` — various security-finding autofixes.
- `tests/test_security.py`, `tests/test_observability.py` — test autofixes; updated all `_AUTH_HEADERS` references to `_auth_headers()` after helper refactor.
- `deploy/observability/docker-compose.yml` — multiple autofix passes for security findings.
- `src/autochart/backend/grafana_proxy.py` — security autofix.
- `tests/` — Ruff formatting pass after Copilot-driven helper refactor.

### Changed By
- Copilot Autofix powered by AI

---

## 2026-08-07 (README — from-scratch install instructions)

### Summary
- Expanded README with complete step-by-step install instructions for fresh Ubuntu/macOS and Windows environments.
- PR #11 (Linux/macOS) and PR #12 (Windows) merged.

### Updated Files
- `README.md` (PR #11) — replaced "Run Locally" section with full setup: OS prerequisites (GEOS, PROJ, GDAL), toolchain (uv, Node 22 via nvm), clone, `uv sync` + `npm install`, data-file regeneration via notebook, `.env` copy, frontend build, backend start, optional Grafana stack, optional pre-commit install.
- `README.md` (PR #12) — split prerequisites into Linux/macOS (step 0a) and Windows 10/11 (step 0b). Windows track: WSL2 + Ubuntu 22.04 (recommended) or native via winget (Git, uv, nvm-windows, OSGeo GDAL, Docker Desktop). Added PowerShell env-loading snippet and `curl.exe` vs alias gotcha note.

### Changed By
- GitHub Copilot / Claude Opus 4.7 (1M context)

---

## Ongoing Tracking Format
Use this format for future entries:

### YYYY-MM-DD
- Summary:
- Added:
- Updated:
- Removed:
- Validation:
- Notes:
