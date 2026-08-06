from __future__ import annotations

import time
import uuid
from pathlib import Path

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.openapi.docs import get_swagger_ui_html
from fastapi.responses import FileResponse, HTMLResponse, Response
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel

from autochart.backend.api.routes import router as api_router
from autochart.backend.config import ALLOWED_ORIGINS
from autochart.backend.grafana_proxy import is_enabled as grafana_enabled
from autochart.backend.grafana_proxy import router as grafana_router
from autochart.backend.logging_setup import get_logger
from autochart.backend.mcp_server import router as mcp_router
from autochart.backend.observability import install as install_observability
from autochart.backend.observability import log_web_vital
from autochart.backend.security import api_key_middleware

REPO_ROOT = Path(__file__).resolve().parents[3]
FRONTEND_DIST = REPO_ROOT / "frontend" / "dist"
PRESENTATION_DIR = REPO_ROOT / "docs" / "presentation"

log = get_logger("autochart.http")

app = FastAPI(
    title="AutoChart Backend",
    version="0.1.0",
    docs_url=None,
    redoc_url=None,
)

install_observability(app)


async def request_context(request: Request, call_next):
    request_id = request.headers.get("x-request-id") or uuid.uuid4().hex
    start = time.perf_counter()
    response = await call_next(request)
    duration_ms = round((time.perf_counter() - start) * 1000, 2)
    response.headers["X-Request-ID"] = request_id
    log.info(
        "http.request",
        method=request.method,
        path=request.url.path,
        status=response.status_code,
        duration_ms=duration_ms,
        request_id=request_id,
    )
    return response


app.middleware("http")(api_key_middleware)
app.middleware("http")(request_context)


@app.get("/docs", include_in_schema=False, response_model=None)
def swagger_ui() -> HTMLResponse:
    # Use a relative openapi URL so /docs works both directly and through a
    # path-stripping reverse proxy (e.g. /proxy/8000/docs).
    return get_swagger_ui_html(openapi_url="openapi.json", title="AutoChart Backend — docs")


app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["Content-Type", "Authorization", "X-API-Key", "X-Request-ID"],
    max_age=600,
)

# REST is exposed under both /api and /api/v1. /api/v1 is the canonical URL
# going forward; /api stays live for existing clients (SPA, MCP tools).
app.include_router(api_router, prefix="/api")
app.include_router(api_router, prefix="/api/v1")
app.include_router(mcp_router)

if grafana_enabled():
    app.include_router(grafana_router)

if PRESENTATION_DIR.is_dir():
    app.mount(
        "/presentation",
        StaticFiles(directory=PRESENTATION_DIR, html=True),
        name="presentation",
    )


@app.get("/health")
def health_root() -> dict[str, str]:
    return {"status": "ok"}


@app.get("/livez", include_in_schema=False)
def livez() -> dict[str, str]:
    """Liveness probe — always cheap, always 200 unless the process is dead."""
    return {"status": "alive"}


@app.get("/healthz")
def healthz() -> dict[str, str]:
    """Readiness probe — verifies the geodata is loadable."""
    try:
        from autochart.backend.data import load_new, load_old

        load_old()
        load_new()
    except Exception as e:  # pragma: no cover - defensive
        log.warning("readiness.failed", error=str(e))
        return {"status": "degraded"}
    return {"status": "ready"}


class WebVitalIn(BaseModel):
    name: str
    value: float
    rating: str | None = None
    id: str | None = None
    navigationType: str | None = None


@app.post("/api/telemetry", include_in_schema=False)
def telemetry(payload: WebVitalIn) -> Response:
    log_web_vital(payload.model_dump())
    return Response(status_code=204)


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
    assets_dir = FRONTEND_DIST / "app-assets"
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
        # Refuse traversal attempts before touching the filesystem.
        if ".." in full_path or full_path.startswith("/"):
            return FileResponse(FRONTEND_DIST / "index.html", headers=NO_STORE)
        candidate = (FRONTEND_DIST / full_path).resolve()
        try:
            candidate.relative_to(FRONTEND_DIST.resolve())
        except ValueError:
            return FileResponse(FRONTEND_DIST / "index.html", headers=NO_STORE)
        if candidate.is_file():
            return FileResponse(candidate)
        return FileResponse(FRONTEND_DIST / "index.html", headers=NO_STORE)
else:

    @app.get("/")
    def root() -> dict[str, str]:
        return {
            "service": "AutoChart backend",
            "status": "running",
            "note": "frontend/dist not built",
        }
