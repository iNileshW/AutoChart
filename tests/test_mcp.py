from __future__ import annotations

import json

from fastapi.testclient import TestClient


def _rpc(client: TestClient, method: str, params: dict | None = None, req_id: int = 1) -> dict:
    payload = {"jsonrpc": "2.0", "id": req_id, "method": method}
    if params is not None:
        payload["params"] = params
    r = client.post("/mcp", json=payload)
    assert r.status_code == 200
    return r.json()


def test_tools_list_advertises_expected_tools(client: TestClient) -> None:
    body = _rpc(client, "tools/list")
    names = {t["name"] for t in body["result"]["tools"]}
    for expected in {
        "chart.lookup",
        "chart.get_data",
        "chart.overlap",
        "chart.overlap_geojson",
        "chart.list_panels",
        "chart.compare",
    }:
        assert expected in names


def test_tools_call_lookup_returns_json_payload(client: TestClient) -> None:
    body = _rpc(
        client,
        "tools/call",
        params={"name": "chart.lookup", "arguments": {"mode": "chart_name", "value": "looe"}},
    )
    content = body["result"]["content"]
    assert content[0]["type"] == "text"
    payload = json.loads(content[0]["text"])
    assert payload["mode"] == "chart_name"


def test_tools_call_overlap_geojson_returns_intersection(client: TestClient) -> None:
    body = _rpc(
        client,
        "tools/call",
        params={
            "name": "chart.overlap_geojson",
            "arguments": {"panel_names": ["Looe", "F Looe", "Looe Bay"], "max_scale": 30000},
        },
    )
    content = body["result"]["content"]
    assert content[0]["type"] == "text"
    payload = json.loads(content[0]["text"])
    assert payload["type"] == "FeatureCollection"
    assert payload["bounds_4326"] is not None
    assert len(payload["features"]) >= 1


def test_tools_call_overlap_returns_image(client: TestClient) -> None:
    body = _rpc(
        client,
        "tools/call",
        params={
            "name": "chart.overlap",
            "arguments": {"panel_main": "Isles of Scilly Northern Part", "max_scale": 30000},
        },
    )
    content = body["result"]["content"]
    types = [c["type"] for c in content]
    assert "text" in types and "image" in types


def test_unknown_method_returns_error(client: TestClient) -> None:
    body = _rpc(client, "does/not/exist")
    assert body["error"]["code"] == -32601


def test_notification_returns_no_content(client: TestClient) -> None:
    r = client.post(
        "/mcp",
        json={"jsonrpc": "2.0", "method": "notifications/initialized"},
    )
    assert r.status_code == 204


def test_unknown_tool_returns_error(client: TestClient) -> None:
    body = _rpc(client, "tools/call", params={"name": "chart.nope", "arguments": {}})
    assert body["error"]["code"] == -32602
