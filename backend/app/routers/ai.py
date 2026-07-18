from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel

from app.services.ai_service import get_chat_response

router = APIRouter()


class ChatMessage(BaseModel):
    role: str
    content: str


class ChatRequest(BaseModel):
    messages: list[ChatMessage]


@router.post("/chat")
def chat(request: ChatRequest) -> dict[str, str]:
    if not request.messages:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Messages list cannot be empty"
        )
    if request.messages[-1].role != "user":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Last message must have role 'user'",
        )

    try:
        response_text = get_chat_response(
            [{"role": message.role, "content": message.content} for message in request.messages]
        )
    except Exception:
        return {
            "response": "Sorry, I'm having trouble responding right now. Please try again later."
        }

    return {"response": response_text}
