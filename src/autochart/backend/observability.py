"""Observability wiring: Prometheus metrics, OpenTelemetry tracing, Sentry.

All three are opt-in via environment variables. Called once from main.
"""

from __future__ import annotations

from typing import Any

from fastapi import FastAPI

from autochart.backend import config
from autochart.backend.logging_setup import get_logger

log = get_logger("autochart.observability")


def _install_metrics(app: FastAPI) -> None:
    if not config.METRICS_ENABLED:
        return
    try:
        from prometheus_fastapi_instrumentator import Instrumentator
    except ImportError:  # pragma: no cover
        log.warning("metrics.instrumentator_missing")
        return
    instrumentator = Instrumentator(
        should_group_status_codes=True,
        should_ignore_untemplated=True,
        excluded_handlers=["/metrics", "/livez", "/healthz"],
    )
    instrumentator.instrument(app).expose(
        app,
        endpoint="/metrics",
        include_in_schema=False,
        should_gzip=False,
    )
    log.info("metrics.exposed", endpoint="/metrics")


def _install_tracing(app: FastAPI) -> None:
    if not config.OTEL_ENDPOINT:
        return
    try:
        from opentelemetry import trace
        from opentelemetry.exporter.otlp.proto.http.trace_exporter import OTLPSpanExporter
        from opentelemetry.instrumentation.fastapi import FastAPIInstrumentor
        from opentelemetry.sdk.resources import SERVICE_NAME, Resource
        from opentelemetry.sdk.trace import TracerProvider
        from opentelemetry.sdk.trace.export import BatchSpanProcessor
    except ImportError:  # pragma: no cover
        log.warning("tracing.otel_missing")
        return
    provider = TracerProvider(resource=Resource.create({SERVICE_NAME: config.OTEL_SERVICE_NAME}))
    provider.add_span_processor(BatchSpanProcessor(OTLPSpanExporter(endpoint=config.OTEL_ENDPOINT)))
    trace.set_tracer_provider(provider)
    FastAPIInstrumentor.instrument_app(app)
    log.info("tracing.enabled", endpoint=config.OTEL_ENDPOINT)


def _install_sentry(app: FastAPI) -> None:
    if not config.SENTRY_DSN:
        return
    try:
        import sentry_sdk
        from sentry_sdk.integrations.fastapi import FastApiIntegration
        from sentry_sdk.integrations.starlette import StarletteIntegration
    except ImportError:  # pragma: no cover
        log.warning("sentry.sdk_missing")
        return
    sentry_sdk.init(
        dsn=config.SENTRY_DSN,
        environment=config.SENTRY_ENVIRONMENT,
        traces_sample_rate=config.SENTRY_TRACES_SAMPLE_RATE,
        integrations=[StarletteIntegration(), FastApiIntegration()],
    )
    log.info("sentry.enabled", environment=config.SENTRY_ENVIRONMENT)


def install(app: FastAPI) -> None:
    """Idempotent-ish; call once during app construction."""
    _install_sentry(app)
    _install_tracing(app)
    _install_metrics(app)


class WebVitalPayload(dict[str, Any]):
    """Loose shape — accept whatever web-vitals sends and log it."""


def log_web_vital(payload: dict[str, Any]) -> None:
    """Emit a structured record from a browser web-vitals report."""
    log.info(
        "web_vital",
        name=payload.get("name"),
        value=payload.get("value"),
        rating=payload.get("rating"),
        id=payload.get("id"),
        navigation_type=payload.get("navigationType"),
    )
