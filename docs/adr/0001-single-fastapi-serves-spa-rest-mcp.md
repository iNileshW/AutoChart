# ADR 0001: One FastAPI process serves the SPA, REST API, and MCP endpoint

- **Status**: Accepted
- **Date**: 2026-08-05
- **Deciders**: Backend Lead, Platform Lead
- **Consulted**: Product Owner
- **Informed**: Frontend Lead, Data/GIS Lead

## Context and problem statement

The graduation project needs a hydrographic chatbot, an interactive map, and MCP tool access. Deploying a separate SPA host, REST service, and MCP server would multiply infrastructure and CORS headaches on the constrained development VM.

## Decision drivers

- Single-origin simplifies CORS + reverse-proxy operation on the lab VM.
- Solo/small-team maintainability.
- Reuse of the same service layer (`data.py`, `overlap.py`) across HTTP and JSON-RPC.

## Considered options

1. Split services: static hosting + REST + MCP (three deployables).
2. **Single FastAPI process serves everything.**
3. Serverless functions with a static bucket.

## Decision

Chosen option **"single FastAPI process"**. FastAPI mounts `/api`, `/api/v1`, `/mcp`, and the built SPA under `/`, and reuses the same Pydantic-typed service layer.

## Consequences

- Positive: One binding, one health check, one Docker image, single deploy artefact.
- Negative: SPA scaling is coupled to backend scaling; not ideal for large concurrency.
- Neutral: All state stays in-process; scaling horizontally requires reintroducing state (there is none today).

## Compliance / Follow-ups

- If load grows, split into an nginx SPA host and a FastAPI API/MCP process.
- Add contract tests (schemathesis) so REST and MCP surfaces stay stable across releases.

## References

- gov.uk ADR framework — https://www.gov.uk/government/publications/architectural-decision-record-framework
- `docs/architecture.md`
