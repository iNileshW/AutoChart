# AutoChart

AutoChart compares old and new geospatial navigation chart polygons and helps identify upgrade recommendations for customers.

## Architecture

- Frontend: React + Vite in `frontend/`
- Backend API: FastAPI in `src/autochart/backend/`
- MCP endpoint: JSON-RPC style endpoint served by the same FastAPI app at `/mcp`

## Tech Stack

- Python (UV-managed project)
- FastAPI + Uvicorn
- Geopandas + Pandas
- React + Vite
- QGIS (validation and visualization)

## Backend Endpoints

- `GET /` : service status
- `GET /api/health` : API health check
- `POST /api/chat` : starter chatbot endpoint
- `POST /mcp` : MCP-compatible JSON-RPC starter endpoint

## Run Locally

### 1. Start backend

From the repository root:

```powershell
uv sync
uv run autochart-api
```

Backend runs on `http://localhost:8000`.

### 2. Start frontend

From `frontend/`:

```powershell
npm install
npm run dev
```

Frontend runs on `http://localhost:5173` and proxies `/api` and `/mcp` to the backend.

## Notes

- Keep shapefile sidecar files together (`.shp`, `.dbf`, `.shx`, `.prj`, etc.).
- Add chart comparison logic to the backend and replace the placeholder `/api/chat` implementation.
- Expand `/mcp` handlers with your MCP tools and methods.