from __future__ import annotations

import pytest
from fastapi.testclient import TestClient

from autochart.backend import config


def _auth_headers() -> dict[str, str]:
    return {config.API_KEY_HEADER: config.API_KEY} if config.API_KEY else {}


def _get(client: TestClient, path: str):
    return client.get(path, headers=_auth_headers())

def test_livez(client: TestClient) -> None:
    r = _get(client, "/livez")
    assert r.status_code == 200
    assert r.json() == {"status": "alive"}


def test_healthz_ready(client: TestClient) -> None:
    r = _get(client, "/healthz")
    assert r.status_code == 200
    body = r.json()
    assert body["status"] in {"ready", "degraded"}


@pytest.mark.skipif(not config.METRICS_ENABLED, reason="Prometheus metrics disabled")
def test_metrics_endpoint_exposes_prometheus_output(client: TestClient) -> None:
    r = _get(client, "/metrics")
    assert r.status_code == 200
    body = r.text
    assert "# HELP" in body or "# TYPE" in body


def test_web_vital_endpoint_accepts_report(client: TestClient) -> None:
    r = client.post(
        "/api/telemetry",
        json={"name": "LCP", "value": 1234.5, "rating": "good", "id": "abc"},
        headers=_AUTH_HEADERS,
    )
    assert r.status_code == 204
    assert r.content == b""


def test_web_vital_endpoint_rejects_bad_payload(client: TestClient) -> None:
    r = client.post("/api/telemetry", json={"name": "LCP"}, headers=_AUTH_HEADERS)
    assert r.status_code == 422
