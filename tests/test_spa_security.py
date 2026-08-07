from __future__ import annotations

from pathlib import Path

from fastapi import FastAPI
from fastapi.testclient import TestClient

from autochart.backend.main import mount_spa_routes


def _build_spa_client(tmp_path: Path) -> TestClient:
    dist = tmp_path / "dist"
    assets = dist / "app-assets"
    assets.mkdir(parents=True)
    (dist / "index.html").write_text("<html><body>SPA</body></html>", encoding="utf-8")
    (dist / "robots.txt").write_text("User-agent: *", encoding="utf-8")

    app = FastAPI()
    mount_spa_routes(app, dist)
    return TestClient(app)


def test_spa_root_nuke_sets_clear_site_data(tmp_path: Path) -> None:
    client = _build_spa_client(tmp_path)
    response = client.get("/", params={"nuke": "1"})

    assert response.status_code == 200
    assert "cache" in response.headers.get("clear-site-data", "")


def test_sw_js_is_unregister_script_with_no_store(tmp_path: Path) -> None:
    client = _build_spa_client(tmp_path)
    response = client.get("/sw.js")

    assert response.status_code == 200
    assert response.headers["content-type"].startswith("application/javascript")
    assert "no-store" in response.headers.get("cache-control", "")
    assert "registration.unregister" in response.text


def test_spa_fallback_rejects_traversal_payloads(tmp_path: Path) -> None:
    client = _build_spa_client(tmp_path)

    traversal_paths = [
        "/..%2F..%2FWindows%2Fwin.ini",
        "/../../etc/passwd",
        "/..\\..\\Windows\\win.ini",
        "/%2e%2e/%2e%2e/etc/passwd",
    ]

    for path in traversal_paths:
        response = client.get(path)
        assert response.status_code == 200
        assert "SPA" in response.text


def test_spa_fallback_serves_only_allowlisted_top_level_files(tmp_path: Path) -> None:
    client = _build_spa_client(tmp_path)

    allowed = client.get("/robots.txt")
    blocked = client.get("/secrets.txt")

    assert allowed.status_code == 200
    assert "User-agent" in allowed.text
    assert blocked.status_code == 200
    assert "SPA" in blocked.text
