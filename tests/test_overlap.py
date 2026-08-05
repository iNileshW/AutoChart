from __future__ import annotations

import base64

import pytest

from autochart.backend.overlap import plot_panel_overlap


def test_plot_panel_overlap_returns_png_and_metrics() -> None:
    result = plot_panel_overlap("Isles of Scilly Northern Part", max_scale=30000)
    assert result["panel_main"] == "Isles of Scilly Northern Part"
    assert result["max_scale"] == 30000

    png = base64.b64decode(result["png_base64"])
    assert png[:8] == b"\x89PNG\r\n\x1a\n"

    metrics = result["metrics"]
    assert metrics["old_area_m2"] > 0
    assert metrics["new_polygons_intersecting"] >= 1
    assert metrics["overlap_pct_old"] > 0


def test_plot_panel_overlap_missing_panel_raises() -> None:
    with pytest.raises(ValueError):
        plot_panel_overlap("__does_not_exist__", max_scale=30000)
