from fastapi import APIRouter, Depends
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_user
from app.database import get_db
from app.models.loyalty import LoyaltyTransaction
from app.models.user import User
from app.schemas.loyalty import LoyaltyBalanceSummary, LoyaltyTransactionResponse

router = APIRouter()


@router.get("/balance", response_model=LoyaltyBalanceSummary)
def get_balance(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> LoyaltyBalanceSummary:
    balance = db.execute(
        select(func.coalesce(func.sum(LoyaltyTransaction.points), 0)).where(
            LoyaltyTransaction.user_id == current_user.id
        )
    ).scalar_one()

    total_earned = db.execute(
        select(func.coalesce(func.sum(LoyaltyTransaction.points), 0)).where(
            LoyaltyTransaction.user_id == current_user.id,
            LoyaltyTransaction.points > 0,
        )
    ).scalar_one()

    total_redeemed = db.execute(
        select(func.coalesce(func.sum(LoyaltyTransaction.points), 0)).where(
            LoyaltyTransaction.user_id == current_user.id,
            LoyaltyTransaction.points < 0,
        )
    ).scalar_one()

    return LoyaltyBalanceSummary(
        balance=balance, total_earned=total_earned, total_redeemed=-total_redeemed
    )


@router.get("/transactions", response_model=list[LoyaltyTransactionResponse])
def get_transactions(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> list[LoyaltyTransaction]:
    result = (
        db.execute(
            select(LoyaltyTransaction)
            .where(LoyaltyTransaction.user_id == current_user.id)
            .order_by(LoyaltyTransaction.created_at.desc())
        )
        .scalars()
        .all()
    )
    return list(result)
