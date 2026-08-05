from __future__ import annotations

import re

from fastapi import APIRouter, HTTPException, Query

from autochart.backend import data as data_service
from autochart.backend.overlap import plot_panel_overlap
from autochart.backend.schemas import (
    ChatRequest,
    ChatResponse,
    GetDataResponse,
    LookupMode,
    LookupRequest,
    LookupResponse,
    OverlapRequest,
    OverlapResponse,
    PanelListItem,
)

router = APIRouter(prefix="/api", tags=["api"])


@router.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@router.post("/lookup", response_model=LookupResponse)
def lookup(payload: LookupRequest) -> LookupResponse:
    try:
        result = data_service.lookup(payload.mode, payload.value)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    return LookupResponse(**result)


@router.get("/data", response_model=GetDataResponse)
def get_data(
    max_scale: int | None = Query(default=data_service.MAX_SCALE, ge=0),
) -> GetDataResponse:
    return GetDataResponse(**data_service.get_data(max_scale=max_scale))


@router.get("/panels", response_model=list[PanelListItem])
def panels(
    max_scale: int | None = Query(default=data_service.MAX_SCALE, ge=0),
) -> list[PanelListItem]:
    return [PanelListItem(**p) for p in data_service.list_panels(max_scale=max_scale)]


@router.post("/overlap", response_model=OverlapResponse)
def overlap(payload: OverlapRequest) -> OverlapResponse:
    try:
        result = plot_panel_overlap(payload.panel_main, max_scale=payload.max_scale)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except KeyError as e:
        raise HTTPException(status_code=500, detail=str(e))
    return OverlapResponse(**result)


CHAT_INTENT = re.compile(
    r"\b(chart\s*(?:number|no|num)|chart\s*name|chart\s*title|panel\s*id|panel)\b[^A-Za-z0-9]*([A-Za-z0-9_\-]+)?",
    re.IGNORECASE,
)


def _infer_intent(message: str) -> tuple[LookupMode, str] | None:
    m = CHAT_INTENT.search(message)
    if not m:
        return None
    kind = m.group(1).lower()
    value = (m.group(2) or "").strip()
    if not value:
        tail = message[m.end():].strip().split()
        value = tail[0] if tail else ""
    if not value:
        return None
    if "number" in kind or "no" in kind or "num" in kind:
        return ("chart_number", value)
    if "title" in kind:
        return ("chart_title", value)
    if "name" in kind:
        return ("chart_name", value)
    if "panel" in kind and "id" in kind:
        return ("panel_id", value)
    return ("chart_name", value)


@router.post("/chat", response_model=ChatResponse)
def chat(payload: ChatRequest) -> ChatResponse:
    mode: LookupMode | None = payload.mode
    value: str | None = payload.value

    if not (mode and value):
        inferred = _infer_intent(payload.message)
        if inferred:
            mode, value = inferred

    if not (mode and value):
        return ChatResponse(
            reply=(
                "Tell me what to look up. Examples:\n"
                "  chart number 1013\n"
                "  chart name Looe\n"
                "  chart title Helford\n"
                "  panel id 0147_6"
            )
        )

    result = data_service.lookup(mode, value)
    lookup_resp = LookupResponse(**result)
    if lookup_resp.new_chart_available:
        reply = (
            f"Yes — new chart available for {mode}='{value}'. "
            f"Matched {len(lookup_resp.new_matches)} new panel(s) and "
            f"{len(lookup_resp.old_matches)} old panel(s)."
        )
    else:
        reply = (
            f"No new chart available for {mode}='{value}'. "
            f"Old matches: {len(lookup_resp.old_matches)}."
        )
    return ChatResponse(reply=reply, lookup=lookup_resp)
