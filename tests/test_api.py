from __future__ import annotations

from fastapi.testclient import TestClient


def test_health(client: TestClient) -> None:
    r = client.get("/api/health")
    assert r.status_code == 200
    assert r.json() == {"status": "ok"}


def test_lookup_endpoint(client: TestClient) -> None:
    r = client.post("/api/lookup", json={"mode": "chart_name", "value": "looe"})
    assert r.status_code == 200
    body = r.json()
    assert body["mode"] == "chart_name"
    assert "new_chart_available" in body


def test_lookup_bad_mode_returns_422(client: TestClient) -> None:
    r = client.post("/api/lookup", json={"mode": "nope", "value": "x"})
    assert r.status_code == 422


def test_panels_endpoint_filters_scale(client: TestClient) -> None:
    r = client.get("/api/panels", params={"max_scale": 30000})
    assert r.status_code == 200
    panels = r.json()
    assert isinstance(panels, list)
    assert all(p["scale"] is None or p["scale"] <= 30000 for p in panels)


def test_data_endpoint(client: TestClient) -> None:
    r = client.get("/api/data", params={"max_scale": 30000})
    assert r.status_code == 200
    body = r.json()
    assert body["old"]["type"] == "FeatureCollection"
    assert body["new"]["type"] == "FeatureCollection"


def test_overlap_endpoint(client: TestClient) -> None:
    r = client.post(
        "/api/overlap",
        json={"panel_main": "Isles of Scilly Northern Part", "max_scale": 30000},
    )
    assert r.status_code == 200
    body = r.json()
    assert body["png_base64"]
    assert body["metrics"]["old_area_m2"] > 0


def test_overlap_missing_panel_returns_404(client: TestClient) -> None:
    r = client.post(
        "/api/overlap",
        json={"panel_main": "__does_not_exist__", "max_scale": 30000},
    )
    assert r.status_code == 404


def test_chat_infers_intent_from_message(client: TestClient) -> None:
    r = client.post("/api/chat", json={"message": "chart number 1013"})
    assert r.status_code == 200
    body = r.json()
    assert body["lookup"] is not None
    assert body["lookup"]["mode"] == "chart_number"
    assert body["lookup"]["value"] == "1013"


def test_chat_empty_intent_asks_for_input(client: TestClient) -> None:
    r = client.post("/api/chat", json={"message": "hello"})
    assert r.status_code == 200
    assert r.json()["lookup"] is None
