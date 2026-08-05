# AI Change Log

This file tracks code and configuration changes made by AI in this repository.

## 2026-08-03

### Timestamp
- 2026-08-03

### What AI Generated
- Scaffolded a full-stack baseline with React (Vite) frontend and FastAPI backend.
- Added a starter MCP-compatible JSON-RPC endpoint on the backend.
- Wired local development integration between frontend and backend.

### What Was Changed
- Added files:
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
- Updated files:
  - pyproject.toml
    - Added backend dependencies: fastapi, uvicorn.
    - Added script entry points: autochart-api and updated autochart CLI binding.
  - README.md
    - Replaced with architecture overview and run instructions for frontend/backend.
  - uv.lock
    - Refreshed dependency lock after adding backend packages.
- Backend endpoints added:
  - GET /
  - GET /api/health
  - POST /api/chat
  - POST /mcp

### Why
- Established a runnable frontend/backend foundation for the chart comparison chatbot and enabled local developer workflow.

### Notes
- Frontend dev server proxies /api and /mcp to http://localhost:8000.
- CORS is enabled for http://localhost:5173 in the FastAPI app.
- Existing unrelated change present in workspace: .github/copilot-instructions.md (not modified by AI in this task).

## 2026-08-03 (RAID Documentation Update)

### Timestamp
- 2026-08-03

### What AI Generated
- Added project RAID tracking document.

### What Was Changed
- Added files:
  - RAID_LOG.md
- Updated files:
  - AI_LOG.md
    - Added this entry to track RAID documentation changes.

### Why
- Added formal risk and dependency tracking to support project planning and governance.

### Validation
- Confirmed RAID log file exists at repository root.

### Notes
- RAID log includes seeded sections for Risks, Assumptions, Issues, and Dependencies.

## Ongoing Tracking Format
Use this required format for future entries:

### YYYY-MM-DD (Short Change Title)
- Timestamp: YYYY-MM-DD HH:MM (local time)
- What AI Generated:
  - List AI-created output (code, docs, config, tests, scripts, etc.)
- What Was Changed:
  - Added:
  - Updated:
  - Removed:
- Why:
  - Reason for the change and expected outcome
- Validation:
  - Commands run, checks performed, or observed results
- Notes:
  - Risks, assumptions, follow-ups, or constraints
