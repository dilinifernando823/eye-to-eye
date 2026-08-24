from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.core.dependencies import optional_user
from app.database import get_db
from app.models.loyalty import LoyaltyTransaction
from app.models.order import Order
from app.models.prescription import Prescription
from app.models.user import User
from app.services.ai_service import get_chat_response

router = APIRouter()


class ChatMessage(BaseModel):
    role: str
    content: str


class ChatRequest(BaseModel):
    messages: list[ChatMessage]


def _build_customer_context(db: Session, user: User | None) -> dict | None:
    if user is None:
        return None

    loyalty_balance = int(
        db.execute(
            select(func.coalesce(func.sum(LoyaltyTransaction.points), 0)).where(
                LoyaltyTransaction.user_id == user.id
            )
        ).scalar_one()
    )

    recent_order = db.execute(
        select(Order).where(Order.user_id == user.id).order_by(Order.created_at.desc())
    ).scalars().first()

    prescription = db.execute(
        select(Prescription).where(
            Prescription.user_id == user.id, Prescription.is_active == True  # noqa: E712
        )
    ).scalar_one_or_none()

    return {
        "customer_name": user.full_name,
        "loyalty_balance": loyalty_balance,
        "recent_order": (
            {
                "order_reference": recent_order.order_reference,
                "status": recent_order.status,
                "total": recent_order.total,
            }
            if recent_order
            else None
        ),
        "active_prescription": (
            {
                "right_eye": {
                    "sph": prescription.right_sph,
                    "cyl": prescription.right_cyl,
                    "axis": prescription.right_axis,
                },
                "left_eye": {
                    "sph": prescription.left_sph,
                    "cyl": prescription.left_cyl,
                    "axis": prescription.left_axis,
                },
                "recommended_lens_types": prescription.recommended_lens_types or [],
            }
            if prescription
            else None
        ),
    }


@router.post("/chat")
def chat(
    request: ChatRequest,
    db: Session = Depends(get_db),
    current_user: User | None = Depends(optional_user),
) -> dict[str, str]:
    if not request.messages:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Messages list cannot be empty"
        )
    if request.messages[-1].role != "user":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Last message must have role 'user'",
        )

    customer_context = _build_customer_context(db, current_user)

    try:
        response_text = get_chat_response(
            [{"role": message.role, "content": message.content} for message in request.messages],
            customer_context=customer_context,
        )
    except Exception:
        return {
            "response": "Sorry, I'm having trouble responding right now. Please try again later."
        }

    return {"response": response_text}
