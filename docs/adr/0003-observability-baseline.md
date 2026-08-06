# ADR 0003: Observability baseline — Prometheus, OpenTelemetry, Sentry, web-vitals

- **Status**: Accepted
- **Date**: 2026-08-06
- **Deciders**: Platform Lead, Backend Lead
- **Consulted**: Frontend Lead
- **Informed**: Product Owner

## Context and problem statement

The service already emits structured JSON logs and a `X-Request-ID` header. It has no metrics, no distributed tracing hooks, and no error reporting. For a lab VM demo that's tolerable; anything past that needs at least a metrics-and-errors baseline.

## Decision drivers

- Env-gated — nothing must be required for local dev or the graduation demo.
- Zero cost when unconfigured.
- Reuse existing `X-Request-ID` for correlation.
- Match ecosystem conventions so a real deployment can plug in Prometheus / Grafana / an OTLP collector / Sentry without further code changes.

## Considered options

1. Roll our own metrics/error pipeline.
2. **Prometheus + OpenTelemetry + Sentry — three narrowly-scoped libraries wired through `observability.py`.**
3. A full APM SaaS (Datadog, New Relic).

## Decision

Chosen option **"three narrow libraries"**:

- `prometheus-fastapi-instrumentator` exposes `/metrics` (Prometheus text format). Always on unless `AUTOCHART_METRICS=0`.
- `opentelemetry-instrumentation-fastapi` + OTLP/HTTP exporter. Off unless `OTEL_EXPORTER_OTLP_ENDPOINT` is set.
- `sentry-sdk[fastapi]` — off unless `SENTRY_DSN` is set. Captures unhandled exceptions and slow traces (sample rate configurable).
- `/livez` (cheap liveness) and `/healthz` (readiness — verifies geodata loadable) split for k8s / Docker healthchecks.
- `POST /api/telemetry` receives browser web-vitals via `navigator.sendBeacon`; the payload is logged via `structlog` so it lands in the same JSON stream as everything else.

## Consequences

- Positive: Zero runtime cost when unconfigured; standard endpoints allow off-the-shelf dashboards.
- Positive: Web-vitals capture creates a real perf/a11y regression signal without extra infra.
- Negative: Three new dependency families to track for security updates.
- Neutral: Prometheus scrape endpoint is public by default; behind a proxy this is fine but production must decide whether to gate `/metrics` too.

## Compliance / Follow-ups

- CI could gate perf budgets by asserting on web-vitals reports in future E2E runs.
- If Prometheus is scraped by an untrusted network, add a route-level auth check to `/metrics` (currently in `security.PUBLIC_PATHS`).
- Sentry sampling defaults to `0.0` — deployments must set `SENTRY_TRACES_SAMPLE_RATE` deliberately.

## References

- gov.uk ADR framework — https://www.gov.uk/government/publications/architectural-decision-record-framework
- Prometheus best practices — https://prometheus.io/docs/practices/instrumentation/
- OpenTelemetry Python — https://opentelemetry.io/docs/languages/python/
