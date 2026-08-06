from __future__ import annotations

import pytest
from fastapi.testclient import TestClient

from autochart.backend import config
from autochart.backend.main import app


@pytest.fixture()
def with_api_key(monkeypatch):
    monkeypatch.setattr(config, "API_KEY", "s3cret")
    monkeypatch.setattr(config, "API_KEY_HEADER", "X-API-Key")
    yield


def test_public_paths_bypass_api_key(with_api_key) -> None:
    with TestClient(app) as client:
        assert client.get("/api/health").status_code == 200
        assert client.get("/api/v1/health").status_code == 200
        assert client.get("/health").status_code == 200


def test_protected_path_rejects_without_key(with_api_key) -> None:
    with TestClient(app) as client:
        r = client.post("/api/lookup", json={"mode": "chart_name", "value": "looe"})
        assert r.status_code == 401


def test_protected_path_accepts_with_key(with_api_key) -> None:
    with TestClient(app) as client:
        r = client.post(
            "/api/lookup",
            json={"mode": "chart_name", "value": "looe"},
            headers={"X-API-Key": "s3cret"},
        )
        assert r.status_code == 200


def test_v1_alias_serves_same_response(client: TestClient) -> None:
    a = client.get("/api/panels").json()
    b = client.get("/api/v1/panels").json()
    assert isinstance(a, list) and isinstance(b, list)
    assert len(a) == len(b)


def test_request_id_header_present(client: TestClient) -> None:
    r = client.get("/api/health")
    assert r.headers.get("X-Request-ID")


def test_request_id_echoed_when_supplied(client: TestClient) -> None:
    r = client.get("/api/health", headers={"X-Request-ID": "abc-123"})
    assert r.headers.get("X-Request-ID") == "abc-123"
