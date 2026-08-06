"""Runtime configuration read from environment variables."""

from __future__ import annotations

import os


def _split_csv(value: str | None) -> list[str]:
    if not value:
        return []
    return [item.strip() for item in value.split(",") if item.strip()]


ALLOWED_ORIGINS: list[str] = _split_csv(
    os.getenv("AUTOCHART_ALLOWED_ORIGINS", "http://localhost:5173,http://127.0.0.1:5173")
)

API_KEY: str | None = os.getenv("AUTOCHART_API_KEY") or None
API_KEY_HEADER: str = os.getenv("AUTOCHART_API_KEY_HEADER", "X-API-Key")

LOG_LEVEL: str = os.getenv("AUTOCHART_LOG_LEVEL", "INFO").upper()
LOG_JSON: bool = os.getenv("AUTOCHART_LOG_JSON", "1").lower() in {"1", "true", "yes"}

# Observability toggles. Metrics default to on (opt-out via AUTOCHART_METRICS=0);
# tracing and Sentry are opt-in via their respective environment variables.
METRICS_ENABLED: bool = os.getenv("AUTOCHART_METRICS", "1").lower() in {"1", "true", "yes"}
OTEL_ENDPOINT: str | None = os.getenv("OTEL_EXPORTER_OTLP_ENDPOINT") or None
OTEL_SERVICE_NAME: str = os.getenv("OTEL_SERVICE_NAME", "autochart")
SENTRY_DSN: str | None = os.getenv("SENTRY_DSN") or None
SENTRY_ENVIRONMENT: str = os.getenv("SENTRY_ENVIRONMENT", "development")
SENTRY_TRACES_SAMPLE_RATE: float = float(os.getenv("SENTRY_TRACES_SAMPLE_RATE", "0.0"))
