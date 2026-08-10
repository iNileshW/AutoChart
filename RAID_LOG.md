# RAID Log

Project: AutoChart
Last Updated: 2026-08-10
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
| R-010 | 2026-08-10 | Graduation report may diverge from evolving implementation details if documentation is not refreshed before submission freeze. | Medium | Medium | Tie report references to living artefacts (README, ADRs, architecture), and run a final documentation parity review before hand-in. | Project Lead | Monitoring | 2026-08-10 |
| R-009 | 2026-08-07 | SPA catch-all route could be flagged for traversal if it serves user-derived paths from dist. | High | Medium | Harden fallback to index-only + top-level allowlist, add dedicated SPA traversal tests, keep no scanner suppression. | Backend Lead | Mitigated | 2026-08-07 |
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
| A-005 | 2026-08-10 | Marker-based tables and Mermaid figures in the markdown report are acceptable to the graduation assessors as evidence visuals. | Confirm with supervisor guidance and export preview before final submission. | Project Lead | Monitoring | 2026-08-10 |
| A-004 | 2026-08-10 | The graduation report can cite internal project artefacts (README, ADRs, architecture docs) as primary references for implementation evidence. | Supervisor/assessor review of submission pack against citation expectations. | Product Owner | Open | 2026-08-10 |
| A-003 | 2026-08-03 | MCP interactions will be served via FastAPI endpoint `/mcp` in JSON-RPC 2.0 format. | Confirm protocol and tool-method design in integration testing. | Platform Lead | Open | 2026-08-03 |
| A-002 | 2026-08-03 | Frontend runs on `http://localhost:5173` and backend on `http://localhost:8000` for local development. | Verify startup scripts and Vite proxy behavior in CI and local setup docs. | Full Stack Lead | Validated | 2026-08-03 |
| A-001 | 2026-08-03 | Source shapefiles are complete and sidecar files remain together in `data_original/`. | Add pre-run data integrity checks for required shapefile components. | Data/GIS Lead | Open | 2026-08-03 |

## Issues Log

| ID | Date Raised | Issue Description | Severity | Workaround | Owner | Status | Target Resolution |
| --- | --- | --- | --- | --- | --- | --- | --- |
| I-012 | 2026-08-10 | Report review found inconsistencies in figure index/captions, section numbering, and editorial quality in newly added text. | Low | Applied full consistency pass: figure numbering 0-10, heading-number fix, caption/index sync, and grammar cleanup. | Project Lead | Closed | 2026-08-10 |
| I-011 | 2026-08-10 | Graduation report was missing explicit reference coverage for UKHO design-system and CSS policy alignment used by frontend styling. | Low | Added Chapter 3.11 policy-alignment text and added UKHO design-system/CSS policy references in Chapter 10. | Project Lead | Closed | 2026-08-10 |
| I-010 | 2026-08-10 | Report section "Alignment with Project Presentation Evidence" required promotion to a standalone delivery chapter with slide-based evidence. | Low | Added Chapter 8: Project Delivery with Slide 10 and Slide 11 snapshot figures; updated chapter numbering and references. | Project Lead | Closed | 2026-08-10 |
| I-009 | 2026-08-10 | Graduation report did not explicitly document completed Docker, docker-compose, and CI/CD delivery work. | Low | Added Chapter 7.6 with implementation and evidence, plus Table 9 and appendix updates. | Project Lead | Closed | 2026-08-10 |
| I-008 | 2026-08-10 | Chapter sequence in graduation report did not match reviewer-requested narrative order. | Low | Reordered chapters and updated table of contents and numbering to match requested structure. | Project Lead | Closed | 2026-08-10 |
| I-007 | 2026-08-10 | Graduation report did not initially include attachment-aligned visual evidence and explicit presentation-to-report traceability. | Low | Added embedded report images, Chapter 8.5 presentation-alignment subsection, and Appendix F mapping matrix. | Project Lead | Closed | 2026-08-10 |
| I-006 | 2026-08-10 | Graduation report did not provide explicit standalone sections for REST API, MCP, and observability delivery evidence. | Medium | Added dedicated chapter with architecture, validation tables, and observability flow figure; updated chapter/figure/table indices. | Project Lead | Closed | 2026-08-10 |
| I-005 | 2026-08-10 | Documentation governance evidence (AI/RAID linkage) was incomplete in the first graduation report draft. | Medium | Added AI log completion entry, refreshed RAID metadata, and embedded RAID coverage in report chapters/appendices. | Project Lead | Closed | 2026-08-10 |
| I-004 | 2026-08-06 | `Panel_ID` in the new dataset is not unique — MCP/UI matching uses name-based joins instead. | Low | Documented; downstream code uses `PANEL_MAIN`/`Panel_Name`. | Data/GIS Lead | Mitigated | 2026-08-06 |
| I-003 | 2026-08-06 | FastAPI default `/docs` fetched an absolute `/openapi.json` and broke behind the proxy. | Low | Custom `/docs` route with relative `openapi.json`. | Backend Lead | Closed | 2026-08-06 |
| I-002 | 2026-08-06 | CodeQL autofix on PR #5 dedented the `overlap_geojson` return block, breaking module import. | High | Restored indentation; CI now runs ruff/mypy/pytest on PRs. | Backend Lead | Closed | 2026-08-06 |
| I-001 | 2026-08-03 | Chart-comparison business logic is not yet implemented in API; `/api/chat` returns placeholder response. | Medium | `/api/chat` now invokes `data.lookup`; MCP has `chart.answer`; map paints `old ∩ new` polygons. | Backend Lead | Closed | 2026-08-06 |

## Dependencies Log

| ID | Date Logged | Dependency | Type | Needed For | Owner | Status | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- |
| D-008 | 2026-08-10 | Supervisor sign-off on citation and formatting expectations | Process | Graduation report acceptance | Project Lead | Open | Needed before final export/submission format lock. |
| D-007 | 2026-08-07 | `pip-audit` (via `uvx --from pip-audit`) | Technical | Python runtime vulnerability scanning in CI | Platform Lead | In Use | Runs on exported `--no-dev` requirements in `security` job. |
| D-006 | 2026-08-07 | VS Code Tasks (`.vscode/tasks.json`) | Tooling | One-step local startup (`dev:all`) for backend + frontend | Full Stack Lead | In Use | Requires VS Code task runner support; commands remain runnable directly in terminal. |
| D-005 | 2026-08-03 | Vite + React toolchain | Technical | Frontend chatbot UI | Frontend Lead | In Use | Defined in `frontend/package.json`. |
| D-004 | 2026-08-03 | FastAPI + Uvicorn | Technical | Backend API and MCP endpoint hosting | Backend Lead | In Use | Defined in `pyproject.toml`. |
| D-003 | 2026-08-03 | Geopandas and Pandas | Technical | Geospatial and tabular processing | Data/GIS Lead | In Use | Required for chart comparisons. |
| D-002 | 2026-08-03 | QGIS validation workflow | Process | Visual verification of geometry changes | Data/GIS Lead | Planned | Needed before production recommendations. |
| D-001 | 2026-08-03 | Stakeholder definition of "upgrade-worthy" polygon change | Business | Final recommendation rules | Product Owner | Open | Needed to finalize decision logic. |

## Change History

| Date | Change | Author |
| --- | --- | --- |
| 2026-08-10 | Added I-012 to track and close figure/index/heading/editorial consistency fixes in the graduation report. | AI Assistant |
| 2026-08-10 | Added I-011 to track and close missing UKHO design-system and CSS-policy reference coverage in the graduation report. | AI Assistant |
| 2026-08-10 | Added I-010 to track and close promotion of alignment content into a standalone Project Delivery chapter with slide evidence. | AI Assistant |
| 2026-08-10 | Added I-009 to track and close missing explicit report coverage for Docker, docker-compose, and CI/CD delivery work. | AI Assistant |
| 2026-08-10 | Added I-008 to track and close chapter-order correction requested during report review. | AI Assistant |
| 2026-08-10 | Added I-007 to track and close attachment-driven visual evidence and section traceability updates in the graduation report. | AI Assistant |
| 2026-08-10 | Added I-006 to track and close missing explicit report coverage for REST API, MCP, and observability work. | AI Assistant |
| 2026-08-10 | Updated Last Updated metadata and added R-010, A-005, I-005, D-008 for graduation documentation governance and submission-readiness tracking. | AI Assistant |
| 2026-08-10 | Added A-004 to capture submission/reference assumption for graduation report evidence strategy. | AI Assistant |
| 2026-08-07 | Added R-009 for SPA traversal-alert handling and D-007 for pip-audit CI dependency scanning. | AI Assistant |
| 2026-08-06 | Added risks around reverse proxy, CORS/auth, CI absence, notebook noise, and CLAUDE.md deviation. Closed I-001/I-002/I-003; added I-004. | AI Assistant |
| 2026-08-03 | Initial RAID log created with baseline entries. | AI Assistant |
