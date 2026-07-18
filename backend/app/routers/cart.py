from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import Select, select
from sqlalchemy.orm import Session, joinedload

from app.core.dependencies import get_current_user
from app.database import get_db
from app.models.order import CartItem
from app.models.product import ProductVariant
from app.models.user import User
from app.schemas.order import CartItemCreate, CartItemResponse, CartItemUpdate

router = APIRouter()


def _get_cart_query(user_id: int) -> Select:
    return (
        select(CartItem)
        .where(CartItem.user_id == user_id)
        .options(
            joinedload(CartItem.variant).joinedload(ProductVariant.product),
        )
    )


@router.get("/", response_model=list[CartItemResponse])
def get_cart(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> list[CartItem]:
    result = db.execute(_get_cart_query(current_user.id)).unique().scalars().all()
    return list(result)


@router.post("/", response_model=list[CartItemResponse])
def add_to_cart(
    payload: CartItemCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> list[CartItem]:
    variant = db.execute(
        select(ProductVariant).where(ProductVariant.id == payload.variant_id)
    ).scalar_one_or_none()
    if variant is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Variant not found")
    if variant.stock_quantity < payload.quantity:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Insufficient stock"
        )

    existing_item = db.execute(
        select(CartItem).where(
            CartItem.user_id == current_user.id, CartItem.variant_id == payload.variant_id
        )
    ).scalar_one_or_none()

    if existing_item is not None:
        existing_item.quantity += payload.quantity
    else:
        db.add(
            CartItem(
                user_id=current_user.id,
                variant_id=payload.variant_id,
                quantity=payload.quantity,
            )
        )

    db.commit()
    result = db.execute(_get_cart_query(current_user.id)).unique().scalars().all()
    return list(result)


@router.put("/{item_id}", response_model=CartItemResponse | None)
def update_cart_item(
    item_id: int,
    payload: CartItemUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> CartItem | None:
    item = db.execute(
        select(CartItem).where(CartItem.id == item_id, CartItem.user_id == current_user.id)
    ).scalar_one_or_none()
    if item is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Item not found")

    if payload.quantity == 0:
        db.delete(item)
        db.commit()
        return None

    item.quantity = payload.quantity
    db.commit()
    db.refresh(item)
    return db.execute(
        _get_cart_query(current_user.id).where(CartItem.id == item_id)
    ).unique().scalar_one_or_none()


@router.delete("/{item_id}")
def delete_cart_item(
    item_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> dict[str, str]:
    item = db.execute(
        select(CartItem).where(CartItem.id == item_id, CartItem.user_id == current_user.id)
    ).scalar_one_or_none()
    if item is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Item not found")

    db.delete(item)
    db.commit()
    return {"message": "Item removed from cart"}


@router.delete("/")
def clear_cart(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> dict[str, str]:
    items = db.execute(
        select(CartItem).where(CartItem.user_id == current_user.id)
    ).scalars().all()
    for item in items:
        db.delete(item)
    db.commit()
    return {"message": "Cart cleared"}
