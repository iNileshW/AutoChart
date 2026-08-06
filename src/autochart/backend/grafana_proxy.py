"""Minimal reverse proxy for a local Grafana instance.

Only mounted when AUTOCHART_GRAFANA_UPSTREAM is set. Used so lab VMs
that expose one port (:8000) can still surface Grafana under
`/grafana/*` behind the FastAPI process.
"""

from __future__ import annotations

import os

import httpx
from fastapi import APIRouter, HTTPException, Request
from starlette.background import BackgroundTask
from starlette.responses import Response, StreamingResponse

UPSTREAM = os.getenv("AUTOCHART_GRAFANA_UPSTREAM") or None
PREFIX = "/grafana"
# When the client passes through a path-stripping reverse proxy (e.g. the
# lab VM's `/proxy/8000/`) Grafana still needs to see the full public
# path so serve_from_sub_path + root_url can line up. Prepend it here.
UPSTREAM_PREFIX = os.getenv("AUTOCHART_GRAFANA_UPSTREAM_PREFIX", "")

# Hop-by-hop headers to strip in both directions.
_HOP_BY_HOP = {
    "connection",
    "keep-alive",
    "proxy-authenticate",
    "proxy-authorization",
    "te",
    "trailer",
    "transfer-encoding",
    "upgrade",
    "content-length",
    "host",
}


router = APIRouter()


def is_enabled() -> bool:
    return UPSTREAM is not None


def _clean_headers(headers) -> list[tuple[str, str]]:
    raw = getattr(headers, "raw", None)
    if raw is None:
        raw = [(k.encode("latin-1"), v.encode("latin-1")) for k, v in headers.items()]

    cleaned: list[tuple[str, str]] = []
    for k_bytes, v_bytes in raw:
        k = k_bytes.decode("latin-1")
        if k.lower() in _HOP_BY_HOP:
            continue
        cleaned.append((k, v_bytes.decode("latin-1")))
    return cleaned


if is_enabled():
    assert UPSTREAM is not None
    _client = httpx.AsyncClient(base_url=UPSTREAM, timeout=30.0)

    @router.api_route(
        PREFIX,
        methods=["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS", "HEAD"],
        include_in_schema=False,
    )
    @router.api_route(
        PREFIX + "/{path:path}",
        methods=["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS", "HEAD"],
        include_in_schema=False,
    )
    async def grafana_proxy(request: Request, path: str = "") -> Response:
        base_path = f"{PREFIX}/{path}" if path else PREFIX + "/"
        upstream_path = f"{UPSTREAM_PREFIX}{base_path}" if UPSTREAM_PREFIX else base_path
        target = httpx.URL(path=upstream_path, query=request.url.query.encode())
        body = await request.body()
        proxied = _client.build_request(
            method=request.method,
            url=target,
            headers=_clean_headers(request.headers),
            content=body,
        )
        try:
            upstream = await _client.send(proxied, stream=True)
        except httpx.RequestError as exc:  # pragma: no cover - network dependent
            raise HTTPException(status_code=502, detail=f"Grafana upstream error: {exc}") from exc

        return StreamingResponse(
            upstream.aiter_raw(),
            status_code=upstream.status_code,
            headers=_clean_headers(upstream.headers),
            background=BackgroundTask(upstream.aclose),
        )
