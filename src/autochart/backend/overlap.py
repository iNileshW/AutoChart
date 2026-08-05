from __future__ import annotations

import base64
import io
from typing import Any

import matplotlib

matplotlib.use("Agg")

import geopandas as gpd
import matplotlib.pyplot as plt
import pandas as pd
from matplotlib.lines import Line2D
from matplotlib.patches import Patch

from autochart.backend.data import (
    MAX_SCALE,
    NEW_SCALE_COL,
    OLD_NAME_COL,
    OLD_SCALE_COL,
    load_new,
    load_old,
)


def _filter_by_scale(gdf: gpd.GeoDataFrame, scale_col: str, max_scale: int | None) -> gpd.GeoDataFrame:
    if max_scale is None or scale_col not in gdf.columns:
        return gdf
    scale = pd.to_numeric(gdf[scale_col], errors="coerce")
    return gdf[scale.notna() & (scale <= max_scale)]


def plot_panel_overlap(
    panel_main: str,
    max_scale: int | None = MAX_SCALE,
    metric_crs: str = "EPSG:27700",
    figsize: tuple[float, float] = (9, 9),
) -> dict[str, Any]:
    """
    Ported from notebook. Filters to Scale <= max_scale on both dfs.
    Returns dict with base64-encoded PNG and metrics.
    """
    old_df = _filter_by_scale(load_old(), OLD_SCALE_COL, max_scale)
    new_df = _filter_by_scale(load_new(), NEW_SCALE_COL, max_scale)

    if OLD_NAME_COL not in old_df.columns:
        raise KeyError(f"old_df must contain '{OLD_NAME_COL}'")

    panel_value = str(panel_main).strip()
    old_mask = old_df[OLD_NAME_COL].astype(str).str.strip().str.casefold() == panel_value.casefold()
    old_selected = old_df.loc[old_mask].copy()

    if old_selected.empty:
        raise ValueError(f"No old polygons found for PANEL_MAIN='{panel_main}' within Scale<={max_scale}")

    if old_df.crs != new_df.crs:
        new_df = new_df.to_crs(old_df.crs)

    old_target = gpd.GeoDataFrame(
        {OLD_NAME_COL: [panel_value]},
        geometry=[old_selected.geometry.unary_union],
        crs=old_df.crs,
    )

    old_m = old_target.to_crs(metric_crs)
    new_m = new_df.to_crs(metric_crs).copy()

    target_geom = old_m.geometry.iloc[0]
    new_hits = new_m[new_m.intersects(target_geom)].copy()

    fig, ax = plt.subplots(figsize=figsize)
    old_area = float(old_m.geometry.area.iloc[0])
    overlap_area = 0.0

    if new_hits.empty:
        old_m.boundary.plot(ax=ax, color="navy", linewidth=2)
        ax.set_title(f"{panel_value}: no intersecting new polygons found")
    else:
        overlap = gpd.overlay(
            old_m[[OLD_NAME_COL, "geometry"]],
            new_hits[["geometry"]],
            how="intersection",
        )
        overlap_area = float(overlap.geometry.area.sum()) if not overlap.empty else 0.0

        old_m.boundary.plot(ax=ax, color="navy", linewidth=2)
        new_hits.boundary.plot(ax=ax, color="darkorange", linewidth=1.2, alpha=0.9)
        if not overlap.empty:
            overlap.plot(ax=ax, color="limegreen", alpha=0.55, edgecolor="none")

        legend_items = [
            Line2D([0], [0], color="navy", lw=2, label="Old panel boundary"),
            Line2D([0], [0], color="darkorange", lw=1.2, label="Intersecting new boundaries"),
            Patch(facecolor="limegreen", alpha=0.55, label="Overlap area"),
        ]
        ax.legend(handles=legend_items, loc="best")
        overlap_pct = (100.0 * overlap_area / old_area) if old_area > 0 else 0.0
        ax.set_title(
            f"Overlap for PANEL_MAIN='{panel_value}'\n"
            f"Overlap area: {overlap_area:,.0f} m^2 ({overlap_pct:.2f}% of old area)"
        )

    ax.set_axis_off()
    plt.tight_layout()

    buf = io.BytesIO()
    fig.savefig(buf, format="png", dpi=110, bbox_inches="tight")
    plt.close(fig)
    buf.seek(0)
    png_b64 = base64.b64encode(buf.read()).decode("ascii")

    overlap_pct_old = (100.0 * overlap_area / old_area) if old_area > 0 else 0.0

    return {
        "panel_main": panel_value,
        "max_scale": max_scale,
        "png_base64": png_b64,
        "metrics": {
            "old_area_m2": old_area,
            "new_overlap_area_m2": overlap_area,
            "overlap_pct_old": overlap_pct_old,
            "new_polygons_intersecting": int(len(new_hits)),
        },
    }
