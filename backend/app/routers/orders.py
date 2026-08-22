from fastapi import APIRouter, Depends, Form, HTTPException, status
from sqlalchemy import func, select
from sqlalchemy.orm import Session, joinedload

from app.core.dependencies import get_current_user
from app.database import get_db
from app.models.loyalty import LoyaltyTransaction
from app.models.order import CartItem, Order, OrderItem
from app.models.prescription import Prescription
from app.models.product import Product, ProductVariant
from app.models.user import User
from app.schemas.order import OrderListResponse, OrderResponse
from app.services.email_service import send_order_confirmation

router = APIRouter()

POINTS_TO_LKR = 0.10
LKR_PER_POINT_EARNED = 100


@router.post("/", status_code=status.HTTP_201_CREATED)
def create_order(
    delivery_name: str = Form(...),
    delivery_address: str = Form(...),
    delivery_city: str = Form(...),
    delivery_phone: str = Form(...),
    use_loyalty_points: int = Form(default=0),
    prescription_id: int | None = Form(default=None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> dict[str, str | float | int]:
    prescription: Prescription | None = None
    if prescription_id is not None:
        prescription = db.execute(
            select(Prescription).where(Prescription.id == prescription_id)
        ).scalar_one_or_none()
        if prescription is None or prescription.user_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Prescription not found"
            )

    cart_items = (
        db.execute(
            select(CartItem)
            .where(CartItem.user_id == current_user.id)
            .options(joinedload(CartItem.variant).joinedload(ProductVariant.product))
        )
        .unique()
        .scalars()
        .all()
    )

    if not cart_items:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Cart is empty")

    for cart_item in cart_items:
        if cart_item.variant.stock_quantity < cart_item.quantity:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Insufficient stock for {cart_item.variant.product.name}",
            )

    subtotal = sum(item.variant.price * item.quantity for item in cart_items)

    points_balance = int(
        db.execute(
            select(func.coalesce(func.sum(LoyaltyTransaction.points), 0)).where(
                LoyaltyTransaction.user_id == current_user.id
            )
        ).scalar_one()
    )

    points_to_use = max(0, min(use_loyalty_points, points_balance))
    loyalty_discount = points_to_use * POINTS_TO_LKR
    total = max(0.0, subtotal - loyalty_discount)
    points_earned = int(total / LKR_PER_POINT_EARNED)

    order_count = db.execute(select(func.count()).select_from(Order)).scalar_one()
    order_reference = f"ETE-{order_count + 1:05d}"

    order = Order(
        order_reference=order_reference,
        user_id=current_user.id,
        subtotal=subtotal,
        loyalty_discount=loyalty_discount,
        total=total,
        loyalty_points_earned=points_earned,
        loyalty_points_used=points_to_use,
        delivery_name=delivery_name,
        delivery_address=delivery_address,
        delivery_city=delivery_city,
        delivery_phone=delivery_phone,
    )

    if prescription is not None:
        order.prescription_id = prescription.id
        order.prescription_url = prescription.file_url
        order.prescription_notes = (
            f"SPH R:{prescription.right_sph or '-'} L:{prescription.left_sph or '-'} | "
            f"CYL R:{prescription.right_cyl or '-'} L:{prescription.left_cyl or '-'} | "
            f"AXIS R:{prescription.right_axis or '-'} L:{prescription.left_axis or '-'} | "
            f"ADD R:{prescription.right_add or '-'} L:{prescription.left_add or '-'} | "
            f"PD:{prescription.pd or '-'}"
        )

    db.add(order)
    db.flush()

    for cart_item in cart_items:
        db.add(
            OrderItem(
                order_id=order.id,
                variant_id=cart_item.variant_id,
                quantity=cart_item.quantity,
                unit_price=cart_item.variant.price,
            )
        )
        cart_item.variant.stock_quantity -= cart_item.quantity

    if points_to_use > 0:
        db.add(
            LoyaltyTransaction(
                user_id=current_user.id,
                transaction_type="redeemed",
                points=-points_to_use,
                reference_id=order.id,
                description=f"Redeemed for order {order_reference}",
            )
        )

    if points_earned > 0:
        db.add(
            LoyaltyTransaction(
                user_id=current_user.id,
                transaction_type="earned_purchase",
                points=points_earned,
                reference_id=order.id,
                description=f"Earned from order {order_reference}",
            )
        )

    for cart_item in cart_items:
        db.delete(cart_item)

    db.commit()
    db.refresh(order)

    try:
        send_order_confirmation(current_user.email, order)
    except Exception:
        pass

    return {
        "order_reference": order.order_reference,
        "total": order.total,
        "points_earned": points_earned,
        "message": "Order placed successfully",
    }


@router.get("/", response_model=list[OrderListResponse])
def list_orders(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> list[dict[str, str | int | float]]:
    orders = (
        db.execute(
            select(Order)
            .where(Order.user_id == current_user.id)
            .options(joinedload(Order.items))
            .order_by(Order.created_at.desc())
        )
        .unique()
        .scalars()
        .all()
    )
    return [
        {
            "id": order.id,
            "order_reference": order.order_reference,
            "status": order.status,
            "total": order.total,
            "created_at": order.created_at,
            "items_count": len(order.items),
        }
        for order in orders
    ]


@router.get("/{order_id}", response_model=OrderResponse)
def get_order(
    order_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> Order:
    order = (
        db.execute(
            select(Order)
            .where(Order.id == order_id)
            .options(
                joinedload(Order.items)
                .joinedload(OrderItem.variant)
                .joinedload(ProductVariant.product)
                .joinedload(Product.images)
            )
        )
        .unique()
        .scalar_one_or_none()
    )
    if order is None or order.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Order not found")
    return order
