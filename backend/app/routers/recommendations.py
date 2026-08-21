from typing import Literal

from fastapi import APIRouter, Depends, Query
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.dependencies import optional_user
from app.database import get_db
from app.models.order import Order
from app.models.product import Product
from app.models.user import User
from app.schemas.product import ProductListResponse
from app.services.recommendation_service import (
    get_popular_products,
    get_recommendations,
    get_similar_products,
)

router = APIRouter()


class RecommendationsResponse(BaseModel):
    source: Literal["personalised", "popular"]
    items: list[ProductListResponse]


class SimilarProductsResponse(BaseModel):
    items: list[ProductListResponse]


@router.get("/", response_model=RecommendationsResponse)
def get_home_recommendations(
    limit: int = Query(default=8, ge=1, le=12),
    db: Session = Depends(get_db),
    current_user: User | None = Depends(optional_user),
) -> RecommendationsResponse:
    if current_user is None:
        return RecommendationsResponse(
            source="popular", items=get_popular_products(db, limit)
        )

    has_orders = db.execute(
        select(Order.id).where(Order.user_id == current_user.id).limit(1)
    ).scalar_one_or_none()

    items = get_recommendations(current_user.id, db, limit)
    source = "personalised" if has_orders is not None else "popular"
    return RecommendationsResponse(source=source, items=items)


@router.get("/similar/{product_id}", response_model=SimilarProductsResponse)
def get_similar(
    product_id: int,
    limit: int = Query(default=4, ge=1, le=8),
    db: Session = Depends(get_db),
) -> SimilarProductsResponse:
    product = db.execute(
        select(Product).where(Product.id == product_id, Product.is_active == True)  # noqa: E712
    ).scalar_one_or_none()

    if product is None:
        return SimilarProductsResponse(items=[])

    items = get_similar_products(db, product_id, product.category, limit)
    return SimilarProductsResponse(items=items)
