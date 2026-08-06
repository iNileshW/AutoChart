from __future__ import annotations

import json
import re
from datetime import date, datetime
from functools import lru_cache
from pathlib import Path
from typing import Any

import geopandas as gpd
import pandas as pd

REPO_ROOT = Path(__file__).resolve().parents[3]
OLD_PATH = REPO_ROOT / "my_file_gdf_old.geojson"
NEW_PATH = REPO_ROOT / "my_file_gdf_new.geojson"

MAX_SCALE = 30000

OLD_NAME_COL = "PANEL_MAIN"
OLD_PANEL_ID_COL = "PANEL_IDEN"
OLD_SCALE_COL = "SCALE"

NEW_NAME_COL = "Panel_Name"
NEW_PANEL_ID_COL = "Panel_ID"
NEW_CHART_COL = "Chart"
NEW_SCALE_COL = "Pan_Scale"

CHART_ID_PATTERN = re.compile(r"(\d+)")


@lru_cache(maxsize=1)
def load_old() -> gpd.GeoDataFrame:
    return gpd.read_file(OLD_PATH)


@lru_cache(maxsize=1)
def load_new() -> gpd.GeoDataFrame:
    return gpd.read_file(NEW_PATH)


def _extract_chart_id(panel_iden: Any) -> str | None:
    if panel_iden is None or pd.isna(panel_iden):
        return None
    m = CHART_ID_PATTERN.search(str(panel_iden))
    return m.group(1) if m else None


def _norm(value: Any) -> str:
    if value is None or (isinstance(value, float) and pd.isna(value)):
        return ""
    return str(value).strip().casefold()


def _sanitize(value: Any) -> Any:
    if value is None:
        return None
    if isinstance(value, float) and pd.isna(value):
        return None
    if isinstance(value, (pd.Timestamp, datetime, date)):
        return value.isoformat()
    if hasattr(value, "item"):
        try:
            return value.item()
        except (ValueError, TypeError):
            return str(value)
    return value


def _row_to_record(row: pd.Series, source: str) -> dict[str, Any]:
    record: dict[str, Any] = {"source": source}
    for key, value in row.items():
        if key == "geometry":
            continue
        record[key] = _sanitize(value)
    return record


def _filter_scale(gdf: gpd.GeoDataFrame, scale_col: str, max_scale: int | None) -> gpd.GeoDataFrame:
    if max_scale is None or scale_col not in gdf.columns:
        return gdf
    scale = pd.to_numeric(gdf[scale_col], errors="coerce")
    return gdf[scale.notna() & (scale <= max_scale)]


def lookup(mode: str, value: str) -> dict[str, Any]:
    """
    mode: chart_number | chart_name | chart_title | panel_id
    Returns matches from old and new dfs plus new_chart_available flag.
    """
    old = load_old()
    new = load_new()
    q = _norm(value)
    if not q:
        return {"mode": mode, "value": value, "old_matches": [], "new_matches": [], "new_chart_available": False}

    old_mask = pd.Series(False, index=old.index)
    new_mask = pd.Series(False, index=new.index)

    if mode == "chart_number":
        digits_q = re.sub(r"\D", "", q) or q
        old_ids = old[OLD_PANEL_ID_COL].map(_extract_chart_id).fillna("").str.casefold()
        old_mask = old_ids.str.contains(re.escape(digits_q), na=False)
        new_ids = new[NEW_CHART_COL].map(_extract_chart_id).fillna("").str.casefold()
        raw_match = new[NEW_CHART_COL].astype(str).str.casefold().str.contains(re.escape(q), na=False)
        digit_match = new_ids.str.contains(re.escape(digits_q), na=False)
        new_mask = raw_match | digit_match
    elif mode in {"chart_name", "chart_title"}:
        old_names = old[OLD_NAME_COL].astype(str).str.casefold()
        new_names = new[NEW_NAME_COL].astype(str).str.casefold()
        old_mask = old_names.str.contains(re.escape(q), na=False)
        new_mask = new_names.str.contains(re.escape(q), na=False)
    elif mode == "panel_id":
        old_mask = old[OLD_PANEL_ID_COL].astype(str).str.casefold().str.contains(re.escape(q), na=False)
        new_mask = new[NEW_PANEL_ID_COL].astype(str).str.casefold() == q
    else:
        raise ValueError(f"Unknown lookup mode: {mode}")

    old_matches = [_row_to_record(r, "old") for _, r in old[old_mask].iterrows()]
    new_matches = [_row_to_record(r, "new") for _, r in new[new_mask].iterrows()]

    return {
        "mode": mode,
        "value": value,
        "old_matches": old_matches,
        "new_matches": new_matches,
        "new_chart_available": len(new_matches) > 0,
    }


def _json_default(value: Any) -> Any:
    if isinstance(value, (pd.Timestamp, datetime, date)):
        return value.isoformat()
    if hasattr(value, "item"):
        try:
            return value.item()
        except (ValueError, TypeError):
            pass
    return str(value)


def _gdf_to_geojson(gdf: gpd.GeoDataFrame) -> dict[str, Any]:
    if gdf.crs is not None and str(gdf.crs).upper() != "EPSG:4326":
        gdf = gdf.to_crs("EPSG:4326")
    return json.loads(gdf.to_json(default=_json_default))


def get_data(max_scale: int | None = MAX_SCALE) -> dict[str, Any]:
    old = _filter_scale(load_old(), OLD_SCALE_COL, max_scale)
    new = _filter_scale(load_new(), NEW_SCALE_COL, max_scale)
    return {
        "old": _gdf_to_geojson(old),
        "new": _gdf_to_geojson(new),
        "max_scale": max_scale,
    }


def _select_by_names(
    gdf: gpd.GeoDataFrame, col: str, names: list[Any]
) -> gpd.GeoDataFrame:
    if not names:
        return gdf.iloc[0:0]
    wanted = {str(x).strip().casefold() for x in names if x is not None and str(x).strip()}
    if not wanted:
        return gdf.iloc[0:0]
    key = gdf[col].astype(str).str.strip().str.casefold()
    return gdf[key.isin(wanted)]


def overlap_geojson(
    panel_names: list[Any] | None,
    max_scale: int | None = MAX_SCALE,
) -> dict[str, Any]:
    """Intersection of old panels (by PANEL_MAIN) and new panels (by Panel_Name) matching
    the supplied names, returned as GeoJSON in EPSG:4326.

    Bounds are computed in EPSG:4326 for map consumption. The intersection itself
    is computed in EPSG:27700 (metric) then projected back to WGS84.
    """
    old = _filter_scale(load_old(), OLD_SCALE_COL, max_scale)
    new = _filter_scale(load_new(), NEW_SCALE_COL, max_scale)

    names = panel_names or []
    old_sel = _select_by_names(old, OLD_NAME_COL, names)
    new_sel = _select_by_names(new, NEW_NAME_COL, names)

    empty: dict[str, Any] = {
        "type": "FeatureCollection",
        "features": [],
        "bounds_4326": None,
        "old_selected_4326": {"type": "FeatureCollection", "features": []},
        "new_selected_4326": {"type": "FeatureCollection", "features": []},
    }
    if old_sel.empty and new_sel.empty:
        return empty

    old_4326 = old_sel.to_crs("EPSG:4326") if not old_sel.empty else old_sel
    new_4326 = new_sel.to_crs("EPSG:4326") if not new_sel.empty else new_sel

    bounds: tuple[float, float, float, float] | None = None
    if not old_4326.empty or not new_4326.empty:
        parts = []
        if not old_4326.empty:
            parts.append(old_4326.total_bounds)
        if not new_4326.empty:
            parts.append(new_4326.total_bounds)
        minx = min(p[0] for p in parts)
        miny = min(p[1] for p in parts)
        maxx = max(p[2] for p in parts)
        maxy = max(p[3] for p in parts)
        bounds = (float(minx), float(miny), float(maxx), float(maxy))

    intersection_fc: dict[str, Any] = {"type": "FeatureCollection", "features": []}
    if not old_sel.empty and not new_sel.empty:
        old_m = old_sel.to_crs("EPSG:27700")
        new_m = new_sel.to_crs("EPSG:27700")
        old_geom = old_m.geometry.union_all()
        new_geom = new_m.geometry.union_all()
        inter = old_geom.intersection(new_geom)
        if not inter.is_empty:
            inter_gdf = gpd.GeoDataFrame(geometry=[inter], crs="EPSG:27700").to_crs("EPSG:4326")
            intersection_fc = json.loads(inter_gdf.to_json(default=_json_default))

return {
    **intersection_fc,
    "bounds_4326": bounds,
    "old_selected_4326": _gdf_to_geojson(old_4326)
    if not old_4326.empty
    else {"type": "FeatureCollection", "features": []},
    "new_selected_4326": _gdf_to_geojson(new_4326)
    if not new_4326.empty
    else {"type": "FeatureCollection", "features": []},
}


def _summarise_matches(subject: str, result: dict[str, Any]) -> str:
    old = result.get("old_matches") or []
    new = result.get("new_matches") or []
    parts: list[str] = []
    if new:
        charts = sorted({str(m.get("Chart")) for m in new if m.get("Chart")})
        names = sorted({str(m.get("Panel_Name")) for m in new if m.get("Panel_Name")})
        scales = sorted(
            {int(m["Pan_Scale"]) for m in new if m.get("Pan_Scale") is not None}
        )
        parts.append(f"Yes — a new chart is available for {subject}.")
        if charts:
            parts.append(f"New chart identifier(s): {', '.join(charts)}.")
        if names:
            head = ", ".join(names[:5])
            more = f" (+{len(names) - 5} more)" if len(names) > 5 else ""
            parts.append(f"New panel(s): {head}{more}.")
        if scales:
            parts.append(f"Scale(s): {', '.join(str(s) for s in scales)}.")
    else:
        parts.append(f"No new chart is currently available for {subject}.")

    if old:
        panels = sorted({str(m.get("PANEL_MAIN")) for m in old if m.get("PANEL_MAIN")})
        idens = sorted({str(m.get("PANEL_IDEN")) for m in old if m.get("PANEL_IDEN")})
        head = ", ".join(panels[:5])
        more = f" (+{len(panels) - 5} more)" if len(panels) > 5 else ""
        parts.append(
            f"Existing old chart coverage: {len(old)} panel(s) — {head}{more}."
        )
        if len(idens) <= 8:
            parts.append(f"Panel IDs: {', '.join(idens)}.")

    return " ".join(parts)


CHART_DIGIT_RE = re.compile(r"\b(\d{3,})\b")


def answer(query: str | None) -> str:
    """Conversational summary for a user query — returns a single prose string."""
    q = (query or "").strip()
    if not q:
        return (
            "Ask about a chart by number, name, title, or panel id — for example "
            "'2345', 'Looe', or 'panel 0147_6'."
        )

    digit_match = CHART_DIGIT_RE.search(q)
    if digit_match:
        digits = digit_match.group(1)
        r = lookup("chart_number", digits)
        if r["old_matches"] or r["new_matches"]:
            return _summarise_matches(f"chart {digits}", r)

    # Look for a panel-id-like token (contains an underscore and a digit)
    for token in q.split():
        cleaned = token.strip(".,;:!?")
        if "_" in cleaned and any(c.isdigit() for c in cleaned):
            r = lookup("panel_id", cleaned)
            if r["old_matches"] or r["new_matches"]:
                return _summarise_matches(f"panel {cleaned}", r)

    # Fall back to a name/title search on the whole query
    r = lookup("chart_name", q)
    if r["old_matches"] or r["new_matches"]:
        return _summarise_matches(f"'{q}'", r)

    return (
        f"I couldn't find any charts matching '{q}'. "
        "Try a chart number like 2345, a chart name like 'Looe', or a panel id like '0147_6'."
    )


def list_panels(max_scale: int | None = MAX_SCALE) -> list[dict[str, Any]]:
    """Distinct PANEL_MAIN values available for overlap plotting."""
    old = _filter_scale(load_old(), OLD_SCALE_COL, max_scale)
    panels: dict[str, dict[str, Any]] = {}
    for _, row in old.iterrows():
        name = row.get(OLD_NAME_COL)
        if name is None or (isinstance(name, float) and pd.isna(name)):
            continue
        key = str(name).strip()
        if not key or key in panels:
            continue
        scale = row.get(OLD_SCALE_COL)
        panels[key] = {
            "panel_main": key,
            "panel_iden": row.get(OLD_PANEL_ID_COL),
            "scale": None if pd.isna(scale) else float(scale),
        }
    return sorted(panels.values(), key=lambda x: x["panel_main"].casefold())
