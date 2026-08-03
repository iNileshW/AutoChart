from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from autochart.backend.api.routes import router as api_router
from autochart.backend.mcp_server import router as mcp_router

app = FastAPI(title="AutoChart Backend", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router)
app.include_router(mcp_router)


@app.get("/")
def root() -> dict[str, str]:
    return {"service": "AutoChart backend", "status": "running"}
