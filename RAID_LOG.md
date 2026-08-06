# RAID Log

Project: AutoChart
Last Updated: 2026-08-06
Owner: Engineering Team

This document tracks Risks, Assumptions, Issues, and Dependencies for project delivery.

## How To Use

- Add new entries at the top of each section.
- Keep status current: Open, Monitoring, Mitigated, Closed.
- Update "Last Reviewed" when an item changes.
- Link related tickets/PRs where available.

## Risk Log

| ID | Date Raised | Risk Description | Impact | Likelihood | Mitigation Plan | Owner | Status | Last Reviewed |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| R-008 | 2026-08-06 | Reverse-proxy (`/proxy/<port>/`) usage in the dev VM makes any absolute path break assets/fetches. | Medium | High | Vite `base: "./"`, path-relative fetches, and a custom `/docs` route. Documented in README. | Frontend Lead | Mitigated | 2026-08-06 |
| R-007 | 2026-08-06 | Wide-open CORS + no auth would expose the API if deployed publicly as-is. | High | Medium | CORS allow-list env var (`AUTOCHART_ALLOWED_ORIGINS`), optional API-key middleware (`AUTOCHART_API_KEY`), Clear-Site-Data on `/?nuke=1`. | Backend Lead | Mitigated | 2026-08-06 |
| R-006 | 2026-08-06 | Absent CI could allow lint/test regressions to reach main (a CodeQL autofix briefly broke `data.py`). | High | Medium | GitHub Actions workflow gates ruff/mypy/pytest+cov, eslint/vitest, Docker build. | Platform Lead | Mitigated | 2026-08-06 |
| R-005 | 2026-08-06 | Notebook outputs cause noisy diffs and can leak sensitive data. | Low | Medium | `nbstripout` wired via pre-commit; notebook excluded from ruff. | Data/GIS Lead | Mitigated | 2026-08-06 |
| R-004 | 2026-08-06 | Backend loads GeoJSON exports at repo root instead of `data_original/*.shp` per CLAUDE.md. | Low | High | Accepted deviation; scheduled follow-up to load shp directly once schema stabilises. | Backend Lead | Accepted | 2026-08-06 |
| R-003 | 2026-08-03 | Frontend and backend contracts may diverge as API evolves beyond starter endpoints. | High | Medium | `/api/v1` alias in place; Pydantic response models pinned; OpenAPI served at `/openapi.json`. Contract tests still to add. | Backend Lead | Monitoring | 2026-08-06 |
| R-002 | 2026-08-03 | Shapefile CRS differences between old and new charts can produce false comparison results. | High | Medium | Enforce CRS normalization before geometry comparisons and validate in QGIS. | Data/GIS Lead | Monitoring | 2026-08-03 |
| R-001 | 2026-08-03 | Large polygon datasets may cause slow comparison and API timeouts. | High | Medium | Add spatial indexing, chunking, and async/background processing for heavy jobs. | Backend Lead | Open | 2026-08-03 |

## Assumptions Log

| ID | Date Logged | Assumption | Validation Method | Owner | Status | Last Reviewed |
| --- | --- | --- | --- | --- | --- | --- |
| A-003 | 2026-08-03 | MCP interactions will be served via FastAPI endpoint `/mcp` in JSON-RPC 2.0 format. | Confirm protocol and tool-method design in integration testing. | Platform Lead | Open | 2026-08-03 |
| A-002 | 2026-08-03 | Frontend runs on `http://localhost:5173` and backend on `http://localhost:8000` for local development. | Verify startup scripts and Vite proxy behavior in CI and local setup docs. | Full Stack Lead | Validated | 2026-08-03 |
| A-001 | 2026-08-03 | Source shapefiles are complete and sidecar files remain together in `data_original/`. | Add pre-run data integrity checks for required shapefile components. | Data/GIS Lead | Open | 2026-08-03 |

## Issues Log

| ID | Date Raised | Issue Description | Severity | Workaround | Owner | Status | Target Resolution |
| --- | --- | --- | --- | --- | --- | --- | --- |
| I-004 | 2026-08-06 | `Panel_ID` in the new dataset is not unique — MCP/UI matching uses name-based joins instead. | Low | Documented; downstream code uses `PANEL_MAIN`/`Panel_Name`. | Data/GIS Lead | Mitigated | 2026-08-06 |
| I-003 | 2026-08-06 | FastAPI default `/docs` fetched an absolute `/openapi.json` and broke behind the proxy. | Low | Custom `/docs` route with relative `openapi.json`. | Backend Lead | Closed | 2026-08-06 |
| I-002 | 2026-08-06 | CodeQL autofix on PR #5 dedented the `overlap_geojson` return block, breaking module import. | High | Restored indentation; CI now runs ruff/mypy/pytest on PRs. | Backend Lead | Closed | 2026-08-06 |
| I-001 | 2026-08-03 | Chart-comparison business logic is not yet implemented in API; `/api/chat` returns placeholder response. | Medium | `/api/chat` now invokes `data.lookup`; MCP has `chart.answer`; map paints `old ∩ new` polygons. | Backend Lead | Closed | 2026-08-06 |

## Dependencies Log

| ID | Date Logged | Dependency | Type | Needed For | Owner | Status | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- |
| D-005 | 2026-08-03 | Vite + React toolchain | Technical | Frontend chatbot UI | Frontend Lead | In Use | Defined in `frontend/package.json`. |
| D-004 | 2026-08-03 | FastAPI + Uvicorn | Technical | Backend API and MCP endpoint hosting | Backend Lead | In Use | Defined in `pyproject.toml`. |
| D-003 | 2026-08-03 | Geopandas and Pandas | Technical | Geospatial and tabular processing | Data/GIS Lead | In Use | Required for chart comparisons. |
| D-002 | 2026-08-03 | QGIS validation workflow | Process | Visual verification of geometry changes | Data/GIS Lead | Planned | Needed before production recommendations. |
| D-001 | 2026-08-03 | Stakeholder definition of "upgrade-worthy" polygon change | Business | Final recommendation rules | Product Owner | Open | Needed to finalize decision logic. |

## Change History

| Date | Change | Author |
| --- | --- | --- |
| 2026-08-06 | Added risks around reverse proxy, CORS/auth, CI absence, notebook noise, and CLAUDE.md deviation. Closed I-001/I-002/I-003; added I-004. | AI Assistant |
| 2026-08-03 | Initial RAID log created with baseline entries. | AI Assistant |
