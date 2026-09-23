from __future__ import annotations

import pytest
from fastapi.testclient import TestClient

from autochart.backend import config
from autochart.backend.main import app, rate_limiter


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


def test_rate_limit_applies_to_chat_and_mcp(monkeypatch) -> None:
    monkeypatch.setattr(rate_limiter, "limit", 1)
    monkeypatch.setattr(rate_limiter, "window_seconds", 60)
    rate_limiter.clear()
    try:
        with TestClient(app) as client:
            first = client.post("/api/chat", json={"message": "2345"})
            second = client.post("/mcp", json={"method": "initialize", "id": 1})
            assert first.status_code == 200
            assert second.status_code == 429
            assert second.headers["Retry-After"].isdigit()
    finally:
        rate_limiter.clear()


def test_rate_limit_is_scoped_by_client_ip(monkeypatch) -> None:
    monkeypatch.setattr(rate_limiter, "limit", 1)
    rate_limiter.clear()
    try:
        with TestClient(app) as client:
            first = client.post("/api/chat", json={"message": "2345"})
            second = client.post(
                "/api/chat",
                json={"message": "2345"},
                headers={"X-Forwarded-For": "203.0.113.10"},
            )
            assert first.status_code == 200
            assert second.status_code == 429
    finally:
        rate_limiter.clear()
