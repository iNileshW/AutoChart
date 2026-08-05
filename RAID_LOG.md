# RAID Log

Project: AutoChart
Last Updated: 2026-08-03
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
| R-003 | 2026-08-03 | Frontend and backend contracts may diverge as API evolves beyond starter endpoints. | High | Medium | Introduce versioned API schema and contract tests for `/api/chat` and future endpoints. | Backend Lead | Open | 2026-08-03 |
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
| I-001 | 2026-08-03 | Chart-comparison business logic is not yet implemented in API; `/api/chat` returns placeholder response. | Medium | Use placeholder for UI integration testing only. | Backend Lead | Open | 2026-08-10 |

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
| 2026-08-03 | Initial RAID log created with baseline entries. | AI Assistant |
