# Architecture

## Context diagram

```mermaid
flowchart LR
  User[UKHO customer / stakeholder]:::actor -->|HTTPS| Proxy[Reverse proxy<br/>code-lab8102.labs.decoded.com]
  Agent[MCP client / AI agent]:::actor -->|JSON-RPC 2.0| Proxy
  Proxy --> App
  subgraph App["FastAPI process (single container)"]
    direction TB
    SPA[React + Vite SPA<br/>frontend/dist]:::asset
    REST["/api and /api/v1<br/>Pydantic-typed REST"]:::svc
    MCP["/mcp JSON-RPC endpoint"]:::svc
    Service[Service layer<br/>data.py, overlap.py]:::svc
    Config[config, logging_setup, security]:::svc
  end
  Service -->|read| GeoJSON[(my_file_gdf_old.geojson<br/>my_file_gdf_new.geojson)]:::data
  GeoJSON -.exported from.-> Shape[(data_original/*.shp)]:::data
  SPA --- REST
  REST --> Service
  MCP --> Service
  App --> Config

  classDef actor fill:#e5edff,stroke:#001b5f,color:#001b5f;
  classDef svc fill:#ffffff,stroke:#0090d4,color:#001b5f;
  classDef data fill:#fff5db,stroke:#f2a900,color:#26374a;
  classDef asset fill:#e6f4fb,stroke:#0090d4,color:#001b5f;
```

## Request flow — chart lookup

```mermaid
sequenceDiagram
  actor U as User
  participant SPA as React SPA (ChatBot)
  participant API as FastAPI /api/chat
  participant DS as Service layer (data.lookup)
  participant MV as MapView (React.lazy)
  participant OG as FastAPI /api/overlap-geojson

  U->>SPA: Enter chart number / name / panel id
  SPA->>API: POST /api/chat {mode, value}
  API->>DS: lookup(mode, value)
  DS-->>API: {old_matches, new_matches, new_chart_available}
  API-->>SPA: reply + lookup payload
  SPA-->>U: Prose reply + match tables
  SPA->>MV: focus = lookup
  MV->>OG: POST /api/overlap-geojson {panel_names}
  OG->>DS: overlap_geojson(panel_names)
  DS-->>OG: FeatureCollection + bounds_4326
  OG-->>MV: Intersection polygons
  MV-->>U: Zoomed Leaflet map with old + new + overlap layers
```

## MCP tool catalogue

```mermaid
flowchart TB
  Client[MCP client]:::actor -->|tools/list, tools/call| Router["/mcp JSON-RPC"]:::svc
  Router --> Answer[chart.answer]
  Router --> Lookup[chart.lookup]
  Router --> Overlap[chart.overlap]
  Router --> OverlapGeo[chart.overlap_geojson]
  Router --> ListP[chart.list_panels]
  Router --> GetD[chart.get_data]
  Router --> Compare[chart.compare]
  Answer -->|data.answer| Service[Service layer]
  Lookup -->|data.lookup| Service
  Overlap -->|plot_panel_overlap PNG| Service
  OverlapGeo -->|data.overlap_geojson| Service
  ListP --> Service
  GetD --> Service
  Compare --> Service

  classDef actor fill:#e5edff,stroke:#001b5f,color:#001b5f;
  classDef svc fill:#ffffff,stroke:#0090d4,color:#001b5f;
```

## Deployment

```mermaid
flowchart LR
  Dev[Developer laptop]:::actor
  CI[GitHub Actions]:::svc
  Reg[(Container registry)]:::data
  Host[Host / VM]:::svc

  Dev -->|git push| Repo[(GitHub main)]
  Repo -->|PR| CI
  CI -->|ruff / mypy / pytest / vitest / build| Verified{Green?}
  Verified -->|no| Fail[Fail PR check]
  Verified -->|yes| Image[Multi-stage Docker image]
  Image -->|manual push| Reg
  Reg -->|docker compose up| Host
  Host -->|serves| Users((Users))

  classDef actor fill:#e5edff,stroke:#001b5f,color:#001b5f;
  classDef svc fill:#ffffff,stroke:#0090d4,color:#001b5f;
  classDef data fill:#fff5db,stroke:#f2a900,color:#26374a;
```

## Component boundaries

| Layer | Location | Responsibility |
|-------|----------|----------------|
| SPA | `frontend/src/App.jsx`, `frontend/src/MapView.jsx` | ChatBot, MapView, MCPChat, routing, a11y |
| REST | `src/autochart/backend/api/routes.py` | Pydantic-typed endpoints, `/api` and `/api/v1` alias |
| MCP | `src/autochart/backend/mcp_server.py` | JSON-RPC dispatcher, tool schema, image content |
| Service | `src/autochart/backend/data.py`, `overlap.py` | Lookup, GeoJSON, matplotlib overlap PNG |
| Cross-cutting | `config.py`, `logging_setup.py`, `security.py`, `main.py` | Env config, structlog, API-key middleware, SPA static + SPA fallback |
| Data | Repo root `my_file_gdf_*.geojson`, `data_original/*.shp` | Old/new panel geometry (EPSG:4326 / native CRS) |
