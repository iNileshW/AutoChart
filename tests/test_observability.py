from __future__ import annotations

from fastapi.testclient import TestClient


def test_livez(client: TestClient) -> None:
    r = client.get("/livez")
    assert r.status_code == 200
    assert r.json() == {"status": "alive"}


def test_healthz_ready(client: TestClient) -> None:
    r = client.get("/healthz")
    assert r.status_code == 200
    body = r.json()
    assert body["status"] in {"ready", "degraded"}


def test_metrics_endpoint_exposes_prometheus_output(client: TestClient) -> None:
    r = client.get("/metrics")
    assert r.status_code == 200
    body = r.text
    assert "# HELP" in body or "# TYPE" in body


def test_web_vital_endpoint_accepts_report(client: TestClient) -> None:
    r = client.post(
        "/api/telemetry",
        json={"name": "LCP", "value": 1234.5, "rating": "good", "id": "abc"},
    )
    assert r.status_code == 204
    assert r.content == b""


def test_web_vital_endpoint_rejects_bad_payload(client: TestClient) -> None:
    r = client.post("/api/telemetry", json={"name": "LCP"})  # missing value
    assert r.status_code == 422
