from fastapi import APIRouter

from autochart.backend.schemas import ChatRequest, ChatResponse

router = APIRouter(prefix="/api", tags=["api"])


@router.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@router.post("/chat", response_model=ChatResponse)
def chat(payload: ChatRequest) -> ChatResponse:
    # Placeholder chatbot response. Replace with real chart-comparison workflow.
    return ChatResponse(reply=f"Received: {payload.message}")
