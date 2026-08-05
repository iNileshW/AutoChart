from __future__ import annotations

from typing import Any, Literal

from pydantic import BaseModel, Field

LookupMode = Literal["chart_number", "chart_name", "chart_title", "panel_id"]


class ChatRequest(BaseModel):
    message: str
    mode: LookupMode | None = None
    value: str | None = None


class ChatResponse(BaseModel):
    reply: str
    lookup: "LookupResponse | None" = None


class LookupRequest(BaseModel):
    mode: LookupMode
    value: str


class LookupResponse(BaseModel):
    mode: LookupMode
    value: str
    old_matches: list[dict[str, Any]]
    new_matches: list[dict[str, Any]]
    new_chart_available: bool


class PanelListItem(BaseModel):
    panel_main: str
    panel_iden: str | None = None
    scale: float | None = None


class OverlapRequest(BaseModel):
    panel_main: str
    max_scale: int | None = Field(default=30000, ge=0)


class OverlapMetrics(BaseModel):
    old_area_m2: float
    new_overlap_area_m2: float
    overlap_pct_old: float
    new_polygons_intersecting: int


class OverlapResponse(BaseModel):
    panel_main: str
    max_scale: int | None
    png_base64: str
    metrics: OverlapMetrics


class GetDataResponse(BaseModel):
    old: dict[str, Any]
    new: dict[str, Any]
    max_scale: int | None


ChatResponse.model_rebuild()
