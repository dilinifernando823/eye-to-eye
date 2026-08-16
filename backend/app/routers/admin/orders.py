import csv
import io
import math
from datetime import date, datetime, timedelta

from fastapi import APIRouter, Depends, HTTPException, Query, status
from fastapi.responses import StreamingResponse
from sqlalchemy import Select, func, select
from sqlalchemy.orm import Session, joinedload

from app.database import get_db
from app.models.order import Order, OrderItem
from app.models.product import Product, ProductVariant
from app.models.user import User
from app.schemas.admin import (
    AdminOrderDetail,
    AdminOrderItemDetail,
    AdminOrderListItem,
    OrderStatusUpdateRequest,
    PaginatedResponse,
)

router = APIRouter(prefix="/orders", tags=["admin-orders"])

ALLOWED_TRANSITIONS: dict[str, set[str]] = {
    "pending": {"processing", "cancelled"},
    "processing": {"dispatched", "cancelled"},
    "dispatched": {"delivered"},
    "delivered": set(),
    "cancelled": set(),
}


def _order_detail_query() -> Select:
    return select(Order).options(
        joinedload(Order.user),
        joinedload(Order.items)
        .joinedload(OrderItem.variant)
        .joinedload(ProductVariant.product)
        .joinedload(Product.images),
    )


def _apply_filters(
    stmt: Select,
    status_filter: str | None,
    date_from: date | None,
    date_to: date | None,
    search: str | None,
) -> Select:
    if status_filter:
        stmt = stmt.where(Order.status == status_filter)
    if date_from:
        stmt = stmt.where(Order.created_at >= datetime.combine(date_from, datetime.min.time()))
    if date_to:
        stmt = stmt.where(
            Order.created_at < datetime.combine(date_to + timedelta(days=1), datetime.min.time())
        )
    if search:
        stmt = stmt.where(
            (Order.order_reference.ilike(f"%{search}%"))
            | (Order.user.has(User.full_name.ilike(f"%{search}%")))
            | (Order.user.has(User.email.ilike(f"%{search}%")))
        )
    return stmt


def _to_list_item(order: Order) -> AdminOrderListItem:
    return AdminOrderListItem(
        id=order.id,
        order_reference=order.order_reference,
        user_id=order.user_id,
        customer_name=order.user.full_name,
        customer_email=order.user.email,
        status=order.status,
        total=order.total,
        items_count=len(order.items),
        has_prescription=bool(order.prescription_url),
        created_at=order.created_at,
        updated_at=order.updated_at,
    )


def _to_detail(order: Order) -> AdminOrderDetail:
    return AdminOrderDetail(
        id=order.id,
        order_reference=order.order_reference,
        user_id=order.user_id,
        customer_name=order.user.full_name,
        customer_email=order.user.email,
        customer_phone=order.user.phone,
        status=order.status,
        subtotal=order.subtotal,
        loyalty_discount=order.loyalty_discount,
        total=order.total,
        loyalty_points_earned=order.loyalty_points_earned,
        loyalty_points_used=order.loyalty_points_used,
        delivery_name=order.delivery_name,
        delivery_address=order.delivery_address,
        delivery_city=order.delivery_city,
        delivery_phone=order.delivery_phone,
        prescription_url=order.prescription_url,
        prescription_notes=order.prescription_notes,
        items=[
            AdminOrderItemDetail(
                id=item.id,
                variant_id=item.variant_id,
                quantity=item.quantity,
                unit_price=item.unit_price,
                product_id=item.variant.product.id,
                product_name=item.variant.product.name,
                product_image_url=next(
                    (
                        image.image_url
                        for image in item.variant.product.images
                        if image.is_primary
                    ),
                    item.variant.product.images[0].image_url
                    if item.variant.product.images
                    else None,
                ),
                lens_type=item.variant.lens_type,
            )
            for item in order.items
        ],
        created_at=order.created_at,
        updated_at=order.updated_at,
    )


@router.get("", response_model=PaginatedResponse[AdminOrderListItem])
def list_orders(
    db: Session = Depends(get_db),
    page: int = Query(default=1, ge=1),
    size: int = Query(default=20, ge=1, le=100),
    status_filter: str | None = Query(default=None, alias="status"),
    date_from: date | None = Query(default=None),
    date_to: date | None = Query(default=None),
    search: str | None = Query(default=None),
) -> PaginatedResponse[AdminOrderListItem]:
    # Count against a join-free base — the paginated query below adds
    # joinedload for items/user, whose JOINs would otherwise fan out rows.
    count_query = _apply_filters(select(Order), status_filter, date_from, date_to, search)
    total = db.execute(
        select(func.count()).select_from(count_query.with_only_columns(Order.id).subquery())
    ).scalar_one()

    query = _apply_filters(
        select(Order).options(joinedload(Order.user), joinedload(Order.items)),
        status_filter,
        date_from,
        date_to,
        search,
    )
    query = query.order_by(Order.created_at.desc()).offset((page - 1) * size).limit(size)
    orders = db.execute(query).unique().scalars().all()

    return PaginatedResponse(
        items=[_to_list_item(order) for order in orders],
        total=total,
        page=page,
        size=size,
        pages=max(1, math.ceil(total / size)),
    )


@router.get("/export")
def export_orders(
    db: Session = Depends(get_db),
    status_filter: str | None = Query(default=None, alias="status"),
    date_from: date | None = Query(default=None),
    date_to: date | None = Query(default=None),
    search: str | None = Query(default=None),
) -> StreamingResponse:
    query = _apply_filters(
        select(Order).options(joinedload(Order.user)),
        status_filter,
        date_from,
        date_to,
        search,
    )
    query = query.order_by(Order.created_at.desc())
    orders = db.execute(query).unique().scalars().all()

    buffer = io.StringIO()
    writer = csv.writer(buffer)
    writer.writerow(
        [
            "Order Ref",
            "Customer Name",
            "Customer Email",
            "Date",
            "Status",
            "Subtotal (LKR)",
            "Loyalty Discount (LKR)",
            "Total (LKR)",
            "Points Earned",
            "Points Used",
            "Delivery City",
        ]
    )
    for order in orders:
        writer.writerow(
            [
                order.order_reference,
                order.user.full_name,
                order.user.email,
                order.created_at.isoformat(),
                order.status,
                order.subtotal,
                order.loyalty_discount,
                order.total,
                order.loyalty_points_earned,
                order.loyalty_points_used,
                order.delivery_city,
            ]
        )
    buffer.seek(0)

    return StreamingResponse(
        iter([buffer.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=orders_export.csv"},
    )


@router.get("/{order_id}", response_model=AdminOrderDetail)
def get_order(order_id: int, db: Session = Depends(get_db)) -> AdminOrderDetail:
    order = db.execute(
        _order_detail_query().where(Order.id == order_id)
    ).unique().scalar_one_or_none()
    if order is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Order not found")
    return _to_detail(order)


@router.patch("/{order_id}/status", response_model=AdminOrderDetail)
def update_order_status(
    order_id: int, payload: OrderStatusUpdateRequest, db: Session = Depends(get_db)
) -> AdminOrderDetail:
    order = db.execute(
        _order_detail_query().where(Order.id == order_id)
    ).unique().scalar_one_or_none()
    if order is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Order not found")

    allowed = ALLOWED_TRANSITIONS.get(order.status, set())
    if payload.status not in allowed:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot transition order from '{order.status}' to '{payload.status}'",
        )

    order.status = payload.status
    db.commit()

    order = db.execute(
        _order_detail_query().where(Order.id == order_id)
    ).unique().scalar_one()
    return _to_detail(order)
