from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session, joinedload

from app.core.dependencies import get_current_user
from app.database import get_db
from app.models.order import CartItem, WishlistItem
from app.models.product import ProductVariant
from app.models.user import User
from app.schemas.order import WishlistItemCreate, WishlistItemResponse

router = APIRouter()


@router.get("/", response_model=list[WishlistItemResponse])
def get_wishlist(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> list[WishlistItem]:
    query = (
        select(WishlistItem)
        .where(WishlistItem.user_id == current_user.id)
        .options(joinedload(WishlistItem.variant).joinedload(ProductVariant.product))
    )
    result = db.execute(query).unique().scalars().all()
    return list(result)


@router.post("/", response_model=WishlistItemResponse, status_code=status.HTTP_200_OK)
def add_to_wishlist(
    payload: WishlistItemCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> WishlistItem:
    variant = db.execute(
        select(ProductVariant).where(ProductVariant.id == payload.variant_id)
    ).scalar_one_or_none()
    if variant is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Variant not found")

    existing_item = db.execute(
        select(WishlistItem).where(
            WishlistItem.user_id == current_user.id,
            WishlistItem.variant_id == payload.variant_id,
        )
    ).scalar_one_or_none()

    if existing_item is not None:
        item = existing_item
    else:
        item = WishlistItem(user_id=current_user.id, variant_id=payload.variant_id)
        db.add(item)
        db.commit()
        db.refresh(item)

    query = (
        select(WishlistItem)
        .where(WishlistItem.id == item.id)
        .options(joinedload(WishlistItem.variant).joinedload(ProductVariant.product))
    )
    return db.execute(query).unique().scalar_one()


@router.delete("/{item_id}")
def remove_from_wishlist(
    item_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> dict[str, str]:
    item = db.execute(
        select(WishlistItem).where(
            WishlistItem.id == item_id, WishlistItem.user_id == current_user.id
        )
    ).scalar_one_or_none()
    if item is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Item not found")

    db.delete(item)
    db.commit()
    return {"message": "Removed from wishlist"}


@router.post("/{item_id}/move-to-cart")
def move_to_cart(
    item_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> dict[str, str]:
    item = db.execute(
        select(WishlistItem).where(
            WishlistItem.id == item_id, WishlistItem.user_id == current_user.id
        )
    ).scalar_one_or_none()
    if item is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Item not found")

    existing_cart_item = db.execute(
        select(CartItem).where(
            CartItem.user_id == current_user.id, CartItem.variant_id == item.variant_id
        )
    ).scalar_one_or_none()

    if existing_cart_item is not None:
        existing_cart_item.quantity += 1
    else:
        db.add(CartItem(user_id=current_user.id, variant_id=item.variant_id, quantity=1))

    db.delete(item)
    db.commit()
    return {"message": "Moved to cart"}
