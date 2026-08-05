import uvicorn


def main() -> None:
    uvicorn.run("autochart.backend.main:app", host="0.0.0.0", port=8000, reload=True)

def matchData(chartNumber: str) -> bool:
    if "match" in chartNumber:
        return True
    else:
        return False