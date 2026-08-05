from __future__ import annotations

import pytest

from autochart.backend import data


def test_lookup_chart_name_returns_matches() -> None:
    result = data.lookup("chart_name", "looe")
    assert isinstance(result["old_matches"], list)
    assert isinstance(result["new_matches"], list)
    assert result["mode"] == "chart_name"
    assert result["value"] == "looe"


def test_lookup_chart_title_alias_of_name() -> None:
    by_name = data.lookup("chart_name", "helford")
    by_title = data.lookup("chart_title", "helford")
    assert len(by_name["new_matches"]) == len(by_title["new_matches"])


def test_lookup_chart_number_matches_gb_prefixed_new_chart() -> None:
    result = data.lookup("chart_number", "1013")
    assert result["new_chart_available"] is True
    assert any("GB" in str(m.get("Chart", "")) for m in result["new_matches"])


def test_lookup_panel_id_exact() -> None:
    result = data.lookup("panel_id", "0147_6")
    assert len(result["old_matches"]) >= 1
    assert result["old_matches"][0]["PANEL_IDEN"] == "0147_6"


def test_lookup_unknown_mode_raises() -> None:
    with pytest.raises(ValueError):
        data.lookup("nonsense", "x")


def test_list_panels_respects_scale_filter() -> None:
    all_panels = data.list_panels(max_scale=None)
    filtered = data.list_panels(max_scale=30000)
    assert len(filtered) <= len(all_panels)
    for p in filtered:
        assert p["scale"] is None or p["scale"] <= 30000


def test_get_data_returns_geojson_feature_collections() -> None:
    payload = data.get_data(max_scale=30000)
    for key in ("old", "new"):
        collection = payload[key]
        assert collection["type"] == "FeatureCollection"
        assert isinstance(collection["features"], list)
    assert payload["max_scale"] == 30000
