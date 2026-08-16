import math

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import Select, func, select
from sqlalchemy.orm import Session, joinedload

from app.database import get_db
from app.models.appointment import Appointment
from app.models.loyalty import LoyaltyTransaction
from app.models.order import Order
from app.models.user import User
from app.schemas.admin import (
    AdminCustomerResponse,
    AdminCustomerUpdateRequest,
    AdminOrderListItem,
    LoyaltyAdjustRequest,
    PaginatedResponse,
)
from app.schemas.appointment import AppointmentResponse
from app.schemas.loyalty import LoyaltyTransactionResponse

router = APIRouter(prefix="/customers", tags=["admin-customers"])


def _to_customer_response(db: Session, user: User) -> AdminCustomerResponse:
    total_orders = db.execute(
        select(func.count()).select_from(Order).where(Order.user_id == user.id)
    ).scalar_one()
    total_spent = db.execute(
        select(func.coalesce(func.sum(Order.total), 0.0)).where(
            Order.user_id == user.id, Order.status != "cancelled"
        )
    ).scalar_one()
    loyalty_balance = db.execute(
        select(func.coalesce(func.sum(LoyaltyTransaction.points), 0)).where(
            LoyaltyTransaction.user_id == user.id
        )
    ).scalar_one()

    return AdminCustomerResponse(
        id=user.id,
        email=user.email,
        full_name=user.full_name,
        phone=user.phone,
        delivery_address=user.delivery_address,
        city=user.city,
        is_active=user.is_active,
        created_at=user.created_at,
        total_orders=total_orders,
        total_spent=total_spent,
        loyalty_balance=loyalty_balance,
    )


def _customers_base(search: str | None, is_active: bool | None) -> Select:
    stmt = select(User).where(User.role == "customer")
    if search:
        stmt = stmt.where(
            (User.full_name.ilike(f"%{search}%")) | (User.email.ilike(f"%{search}%"))
        )
    if is_active is not None:
        stmt = stmt.where(User.is_active == is_active)
    return stmt


@router.get("", response_model=PaginatedResponse[AdminCustomerResponse])
def list_customers(
    db: Session = Depends(get_db),
    page: int = Query(default=1, ge=1),
    size: int = Query(default=20, ge=1, le=100),
    search: str | None = Query(default=None),
    is_active: bool | None = Query(default=None),
) -> PaginatedResponse[AdminCustomerResponse]:
    base = _customers_base(search, is_active)

    total = db.execute(
        select(func.count()).select_from(base.with_only_columns(User.id).subquery())
    ).scalar_one()

    query = base.order_by(User.created_at.desc()).offset((page - 1) * size).limit(size)
    users = db.execute(query).scalars().all()

    return PaginatedResponse(
        items=[_to_customer_response(db, user) for user in users],
        total=total,
        page=page,
        size=size,
        pages=max(1, math.ceil(total / size)),
    )


def _get_customer_or_404(db: Session, customer_id: int) -> User:
    customer = db.execute(
        select(User).where(User.id == customer_id, User.role == "customer")
    ).scalar_one_or_none()
    if customer is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Customer not found")
    return customer


@router.get("/{customer_id}")
def get_customer(
    customer_id: int, db: Session = Depends(get_db)
) -> dict[
    str,
    AdminCustomerResponse
    | list[AdminOrderListItem]
    | list[AppointmentResponse]
    | list[LoyaltyTransactionResponse],
]:
    customer = _get_customer_or_404(db, customer_id)

    orders = (
        db.execute(
            select(Order)
            .where(Order.user_id == customer_id)
            .options(joinedload(Order.items))
            .order_by(Order.created_at.desc())
        )
        .unique()
        .scalars()
        .all()
    )
    appointments = (
        db.execute(
            select(Appointment)
            .where(Appointment.user_id == customer_id)
            .options(joinedload(Appointment.user))
            .order_by(Appointment.appointment_date.desc())
        )
        .unique()
        .scalars()
        .all()
    )
    loyalty_transactions = (
        db.execute(
            select(LoyaltyTransaction)
            .where(LoyaltyTransaction.user_id == customer_id)
            .order_by(LoyaltyTransaction.created_at.desc())
        )
        .scalars()
        .all()
    )

    return {
        "customer": _to_customer_response(db, customer),
        "orders": [
            AdminOrderListItem(
                id=order.id,
                order_reference=order.order_reference,
                user_id=order.user_id,
                customer_name=customer.full_name,
                customer_email=customer.email,
                status=order.status,
                total=order.total,
                items_count=len(order.items),
                has_prescription=bool(order.prescription_url),
                created_at=order.created_at,
                updated_at=order.updated_at,
            )
            for order in orders
        ],
        "appointments": [
            AppointmentResponse.model_validate(appointment) for appointment in appointments
        ],
        "loyalty_transactions": [
            LoyaltyTransactionResponse.model_validate(txn) for txn in loyalty_transactions
        ],
    }


@router.patch("/{customer_id}", response_model=AdminCustomerResponse)
def update_customer(
    customer_id: int, payload: AdminCustomerUpdateRequest, db: Session = Depends(get_db)
) -> AdminCustomerResponse:
    customer = _get_customer_or_404(db, customer_id)

    update_data = payload.model_dump(exclude_none=True)
    for field, value in update_data.items():
        setattr(customer, field, value)

    db.commit()
    db.refresh(customer)
    return _to_customer_response(db, customer)


@router.post("/{customer_id}/loyalty/adjust", response_model=LoyaltyTransactionResponse)
def adjust_loyalty(
    customer_id: int, payload: LoyaltyAdjustRequest, db: Session = Depends(get_db)
) -> LoyaltyTransaction:
    _get_customer_or_404(db, customer_id)

    transaction = LoyaltyTransaction(
        user_id=customer_id,
        transaction_type="manual_adjustment",
        points=payload.points,
        description=payload.description,
    )
    db.add(transaction)
    db.commit()
    db.refresh(transaction)
    return transaction
