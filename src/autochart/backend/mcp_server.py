from __future__ import annotations

import json
from typing import Any

from fastapi import APIRouter, HTTPException, Response
from pydantic import BaseModel

from autochart.backend import data as data_service
from autochart.backend.overlap import plot_panel_overlap

router = APIRouter(prefix="/mcp", tags=["mcp"])


class JsonRpcRequest(BaseModel):
    jsonrpc: str = "2.0"
    id: str | int | None = None
    method: str
    params: dict[str, Any] | None = None


TOOLS: list[dict[str, Any]] = [
    {
        "name": "chart.lookup",
        "description": "Look up old/new chart panels by chart_number, chart_name, chart_title, or panel_id.",
        "inputSchema": {
            "type": "object",
            "required": ["mode", "value"],
            "properties": {
                "mode": {
                    "type": "string",
                    "enum": ["chart_number", "chart_name", "chart_title", "panel_id"],
                },
                "value": {"type": "string"},
            },
        },
    },
    {
        "name": "chart.get_data",
        "description": "Return old and new panel geometry as GeoJSON, optionally filtered by max_scale.",
        "inputSchema": {
            "type": "object",
            "properties": {
                "max_scale": {"type": ["integer", "null"], "minimum": 0, "default": 30000},
            },
        },
    },
    {
        "name": "chart.overlap",
        "description": "Compute overlap between an old panel (PANEL_MAIN) and intersecting new panels. Returns PNG base64 + metrics. Enforces Scale<=max_scale.",
        "inputSchema": {
            "type": "object",
            "required": ["panel_main"],
            "properties": {
                "panel_main": {"type": "string"},
                "max_scale": {"type": ["integer", "null"], "minimum": 0, "default": 30000},
            },
        },
    },
    {
        "name": "chart.overlap_geojson",
        "description": "Return the old ∩ new intersection polygons + bounds for the given panel names (EPSG:4326). Feed a map or spatial consumer.",
        "inputSchema": {
            "type": "object",
            "required": ["panel_names"],
            "properties": {
                "panel_names": {
                    "type": "array",
                    "items": {"type": "string"},
                    "minItems": 0,
                },
                "max_scale": {"type": ["integer", "null"], "minimum": 0, "default": 30000},
            },
        },
    },
    {
        "name": "chart.answer",
        "description": "Conversational summary for a user query about a chart (number, name, title, or panel id). Returns a single prose text — no raw JSON payload.",
        "inputSchema": {
            "type": "object",
            "required": ["query"],
            "properties": {
                "query": {"type": "string"},
            },
        },
    },
    {
        "name": "chart.list_panels",
        "description": "List old panels (PANEL_MAIN) available at or below max_scale.",
        "inputSchema": {
            "type": "object",
            "properties": {
                "max_scale": {"type": ["integer", "null"], "minimum": 0, "default": 30000},
            },
        },
    },
    {
        "name": "chart.compare",
        "description": "Alias of chart.overlap for compatibility.",
        "inputSchema": {
            "type": "object",
            "required": ["panel_main"],
            "properties": {
                "panel_main": {"type": "string"},
                "max_scale": {"type": ["integer", "null"], "minimum": 0, "default": 30000},
            },
        },
    },
]


def _text_result(payload: Any) -> dict[str, Any]:
    return {"content": [{"type": "text", "text": json.dumps(payload, default=str)}]}


def _call_tool(name: str, args: dict[str, Any]) -> dict[str, Any]:
    if name == "chart.lookup":
        mode = args.get("mode")
        value = args.get("value")
        if not mode or not value:
            raise ValueError("chart.lookup requires 'mode' and 'value'")
        return _text_result(data_service.lookup(mode, value))
    if name == "chart.get_data":
        max_scale = args.get("max_scale", data_service.MAX_SCALE)
        return _text_result(data_service.get_data(max_scale=max_scale))
    if name == "chart.answer":
        query = args.get("query")
        text = data_service.answer(query)
        return {"content": [{"type": "text", "text": text}]}
    if name == "chart.list_panels":
        max_scale = args.get("max_scale", data_service.MAX_SCALE)
        return _text_result(data_service.list_panels(max_scale=max_scale))
    if name == "chart.overlap_geojson":
        panel_names = args.get("panel_names") or []
        max_scale = args.get("max_scale", data_service.MAX_SCALE)
        return _text_result(
            data_service.overlap_geojson(panel_names=panel_names, max_scale=max_scale)
        )
    if name in {"chart.overlap", "chart.compare"}:
        panel_main = args.get("panel_main")
        if not panel_main:
            raise ValueError(f"{name} requires 'panel_main'")
        max_scale = args.get("max_scale", data_service.MAX_SCALE)
        result = plot_panel_overlap(panel_main, max_scale=max_scale)
        content = [
            {"type": "text", "text": json.dumps({"panel_main": result["panel_main"], "metrics": result["metrics"], "max_scale": result["max_scale"]})},
            {"type": "image", "mimeType": "image/png", "data": result["png_base64"]},
        ]
        return {"content": content}
    raise ValueError(f"Unknown tool: {name}")


def _error(request_id: Any, code: int, message: str) -> dict[str, Any]:
    return {"jsonrpc": "2.0", "id": request_id, "error": {"code": code, "message": message}}


@router.post("", response_model=None)
def mcp_jsonrpc(request: JsonRpcRequest) -> dict[str, Any] | Response:
    if request.jsonrpc != "2.0":
        raise HTTPException(status_code=400, detail="Only JSON-RPC 2.0 is supported")

    if request.id is None:
        return Response(status_code=204)

    if request.method == "initialize":
        return {
            "jsonrpc": "2.0",
            "id": request.id,
            "result": {
                "protocolVersion": "2024-11-05",
                "capabilities": {"tools": {}},
                "serverInfo": {"name": "autochart-mcp", "version": "0.1.0"},
            },
        }

    if request.method == "tools/list":
        return {"jsonrpc": "2.0", "id": request.id, "result": {"tools": TOOLS}}

    if request.method == "tools/call":
        params = request.params or {}
        name = params.get("name")
        args = params.get("arguments") or {}
        if not name:
            return _error(request.id, -32602, "Missing 'name' in tools/call params")
        try:
            result = _call_tool(name, args)
        except ValueError as e:
            return _error(request.id, -32602, str(e))
        except Exception:
            return _error(request.id, -32000, "Tool execution failed")
        return {"jsonrpc": "2.0", "id": request.id, "result": result}

    return _error(request.id, -32601, f"Method not found: {request.method}")
