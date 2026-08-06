# syntax=docker/dockerfile:1.6

# ---------- Stage 1: build the frontend ----------
FROM node:22-alpine AS web
WORKDIR /web
COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci --no-audit --no-fund
COPY frontend/ ./
RUN npm run build

# ---------- Stage 2: python runtime ----------
FROM python:3.13-slim AS runtime

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1 \
    UV_LINK_MODE=copy \
    UV_PYTHON_INSTALL_DIR=/opt/uv-python \
    AUTOCHART_HOST=0.0.0.0 \
    AUTOCHART_PORT=8000

RUN apt-get update && apt-get install -y --no-install-recommends \
      libexpat1 curl \
    && rm -rf /var/lib/apt/lists/*

RUN adduser --system --group --home /app app
WORKDIR /app

COPY --from=ghcr.io/astral-sh/uv:latest /uv /usr/local/bin/uv

# Install python deps (production only, no dev group)
COPY pyproject.toml uv.lock ./
RUN uv sync --frozen --no-dev --no-install-project

# Copy application sources
COPY README.md ./
COPY src ./src
COPY my_file_gdf_old.geojson my_file_gdf_new.geojson ./
RUN uv sync --frozen --no-dev

# Copy built frontend
COPY --from=web /web/dist ./frontend/dist

USER app
EXPOSE 8000

HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
    CMD curl -fsS http://127.0.0.1:8000/api/health || exit 1

CMD ["uv", "run", "uvicorn", "autochart.backend.main:app", "--host", "0.0.0.0", "--port", "8000"]
