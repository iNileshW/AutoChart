from __future__ import annotations

from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, Response
from fastapi.staticfiles import StaticFiles

from autochart.backend.api.routes import router as api_router
from autochart.backend.mcp_server import router as mcp_router

REPO_ROOT = Path(__file__).resolve().parents[3]
FRONTEND_DIST = REPO_ROOT / "frontend" / "dist"

app = FastAPI(title="AutoChart Backend", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router)
app.include_router(mcp_router)


@app.get("/health")
def health_root() -> dict[str, str]:
    return {"status": "ok"}


@app.get("/favicon.ico", include_in_schema=False, response_model=None)
def favicon():
    ico = FRONTEND_DIST / "favicon.ico"
    if ico.is_file():
        return FileResponse(ico)
    return Response(status_code=204)


NO_STORE = {"Cache-Control": "no-store, no-cache, must-revalidate, max-age=0"}
CLEAR_ALL = {
    **NO_STORE,
    "Clear-Site-Data": '"cache", "cookies", "storage", "executionContexts"',
}


if FRONTEND_DIST.is_dir():
    assets_dir = FRONTEND_DIST / "assets"
    if assets_dir.is_dir():
        app.mount("/app-assets", StaticFiles(directory=assets_dir), name="assets")

    @app.get("/", include_in_schema=False)
    def spa_index(nuke: str | None = None) -> FileResponse:
        headers = CLEAR_ALL if nuke == "1" else NO_STORE
        return FileResponse(FRONTEND_DIST / "index.html", headers=headers)

    @app.get("/sw.js", include_in_schema=False, response_model=None)
    def kill_sw():
        # Return an empty SW that immediately unregisters itself in case a client
        # requests /sw.js from a prior app registration.
        js = (
            "self.addEventListener('install', () => self.skipWaiting());"
            "self.addEventListener('activate', (e) => e.waitUntil("
            "  self.registration.unregister().then(() => self.clients.matchAll())"
            "  .then((cs) => cs.forEach((c) => c.navigate(c.url)))"
            "));"
        )
        return Response(js, media_type="application/javascript", headers=NO_STORE)

    @app.get("/{full_path:path}", include_in_schema=False)
    def spa_fallback(full_path: str) -> FileResponse:
        candidate = FRONTEND_DIST / full_path
        if candidate.is_file():
            return FileResponse(candidate)
        return FileResponse(FRONTEND_DIST / "index.html", headers=NO_STORE)
else:
    @app.get("/")
    def root() -> dict[str, str]:
        return {"service": "AutoChart backend", "status": "running", "note": "frontend/dist not built"}
