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


def test_overlap_geojson_returns_intersection_and_bounds() -> None:
    result = data.overlap_geojson(["Looe", "F Looe", "Looe Bay"])
    assert result["bounds_4326"] is not None
    minx, miny, maxx, maxy = result["bounds_4326"]
    assert minx < maxx and miny < maxy
    assert len(result["old_selected_4326"]["features"]) >= 1
    assert len(result["new_selected_4326"]["features"]) >= 1
    assert len(result["features"]) >= 1


def test_answer_by_chart_number() -> None:
    text = data.answer("1013")
    assert isinstance(text, str)
    assert "1013" in text
    assert "new chart" in text.lower()


def test_answer_by_name_returns_prose() -> None:
    text = data.answer("Looe")
    assert "Looe" in text
    assert "panel" in text.lower()
    # must be prose only — no JSON braces or quoted keys
    assert "{" not in text and "}" not in text


def test_answer_unknown_query_falls_back() -> None:
    text = data.answer("zzz_never_matches_anything")
    assert "couldn't find" in text.lower() or "no chart" in text.lower()


def test_answer_empty_query_gives_hint() -> None:
    text = data.answer("")
    assert "chart" in text.lower()


def test_overlap_geojson_empty_when_no_names() -> None:
    result = data.overlap_geojson([])
    assert result["bounds_4326"] is None
    assert result["features"] == []


def test_get_data_returns_geojson_feature_collections() -> None:
    payload = data.get_data(max_scale=30000)
    for key in ("old", "new"):
        collection = payload[key]
        assert collection["type"] == "FeatureCollection"
        assert isinstance(collection["features"], list)
    assert payload["max_scale"] == 30000
