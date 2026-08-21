from datetime import datetime

from pydantic import BaseModel, ConfigDict


class LoyaltyTransactionResponse(BaseModel):
    id: int
    user_id: int
    transaction_type: str
    points: int
    reference_id: int | None
    description: str | None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class LoyaltyBalanceResponse(BaseModel):
    balance: int
    transactions: list[LoyaltyTransactionResponse]


class LoyaltyBalanceSummary(BaseModel):
    balance: int
    total_earned: int
    total_redeemed: int
    redeemable_value: float
    earn_rate: int
    redeem_rate: float
