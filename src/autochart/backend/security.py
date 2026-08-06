"""Optional API-key gate. Enabled only when AUTOCHART_API_KEY is set."""

from __future__ import annotations

from fastapi import Request
from fastapi.responses import JSONResponse

from autochart.backend import config

# Paths that must always be reachable even when the API key gate is on.
PUBLIC_PATHS: set[str] = {
    "/",
    "/health",
    "/api/health",
    "/api/v1/health",
    "/favicon.ico",
    "/docs",
    "/openapi.json",
    "/sw.js",
}


def _is_public(path: str) -> bool:
    if path in PUBLIC_PATHS:
        return True
    return path.startswith("/app-assets/") or path.startswith("/assets/")


async def api_key_middleware(request: Request, call_next):
    api_key = config.API_KEY
    if api_key is None:
        return await call_next(request)
    if _is_public(request.url.path):
        return await call_next(request)
    provided = request.headers.get(config.API_KEY_HEADER)
    if provided != api_key:
        return JSONResponse(status_code=401, content={"detail": "Missing or invalid API key"})
    return await call_next(request)
