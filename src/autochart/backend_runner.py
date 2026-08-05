import os

import uvicorn


def main() -> None:
    uvicorn.run(
        "autochart.backend.main:app",
        host=os.getenv("AUTOCHART_HOST", "127.0.0.1"),
        port=int(os.getenv("AUTOCHART_PORT", "8000")),
        reload=os.getenv("AUTOCHART_RELOAD", "0") == "1",
    )
