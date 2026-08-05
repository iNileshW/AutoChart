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

## Ongoing Tracking Format
Use this format for future entries:

### YYYY-MM-DD
- Summary:
- Added:
- Updated:
- Removed:
- Validation:
- Notes:
