from typing import Any

from fastapi import APIRouter, HTTPException, Response
from pydantic import BaseModel

router = APIRouter(prefix="/mcp", tags=["mcp"])


class JsonRpcRequest(BaseModel):
    jsonrpc: str = "2.0"
    id: str | int | None = None
    method: str
    params: dict[str, Any] | None = None


@router.post("")
def mcp_jsonrpc(request: JsonRpcRequest) -> dict[str, Any] | Response:
    if request.jsonrpc != "2.0":
        raise HTTPException(status_code=400, detail="Only JSON-RPC 2.0 is supported")

    if request.id is None:
        return Response(status_code=204)

    if request.method == "tools/list":
        return {
            "jsonrpc": "2.0",
            "id": request.id,
            "result": {
                "tools": [
                    {
                        "name": "chart.compare",
                        "description": "Compare old and new chart polygons",
                    }
                ]
            },
        }

    return {
        "jsonrpc": "2.0",
        "id": request.id,
        "error": {
            "code": -32601,
            "message": f"Method not found: {request.method}",
        },
    }
