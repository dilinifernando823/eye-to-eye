from datetime import datetime, timedelta

from fastapi import APIRouter, Depends
from sqlalchemy import func, select
from sqlalchemy.orm import Session, joinedload

from app.database import get_db
from app.models.appointment import Appointment
from app.models.order import Order, OrderItem
from app.models.product import Product, ProductVariant
from app.models.user import User
from app.schemas.admin import (
    AdminAnalyticsSummary,
    AdminOrderSummary,
    AdminProductSummary,
    DailyRevenuePoint,
    OrderStatusCount,
)

router = APIRouter(prefix="/analytics", tags=["admin-analytics"])


def _month_bounds(reference: datetime) -> tuple[datetime, datetime]:
    start = reference.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    if start.month == 12:
        next_start = start.replace(year=start.year + 1, month=1)
    else:
        next_start = start.replace(month=start.month + 1)
    return start, next_start


def _trend_pct(current: float, previous: float) -> float:
    if previous == 0:
        return 100.0 if current > 0 else 0.0
    return round((current - previous) / previous * 100, 1)


@router.get("/summary", response_model=AdminAnalyticsSummary)
def analytics_summary(db: Session = Depends(get_db)) -> AdminAnalyticsSummary:
    now = datetime.now()
    this_month_start, next_month_start = _month_bounds(now)
    last_month_start, _unused = _month_bounds(this_month_start - timedelta(days=1))

    def revenue_between(start: datetime, end: datetime) -> float:
        return db.execute(
            select(func.coalesce(func.sum(Order.total), 0.0)).where(
                Order.created_at >= start,
                Order.created_at < end,
                Order.status != "cancelled",
            )
        ).scalar_one()

    def orders_count_between(start: datetime, end: datetime) -> int:
        return db.execute(
            select(func.count())
            .select_from(Order)
            .where(Order.created_at >= start, Order.created_at < end)
        ).scalar_one()

    def customers_count_between(start: datetime, end: datetime) -> int:
        return db.execute(
            select(func.count())
            .select_from(User)
            .where(
                User.role == "customer",
                User.created_at >= start,
                User.created_at < end,
            )
        ).scalar_one()

    def appointments_count_between(start: datetime, end: datetime) -> int:
        return db.execute(
            select(func.count())
            .select_from(Appointment)
            .where(Appointment.created_at >= start, Appointment.created_at < end)
        ).scalar_one()

    this_month_revenue = revenue_between(this_month_start, next_month_start)
    last_month_revenue = revenue_between(last_month_start, this_month_start)
    this_month_orders = orders_count_between(this_month_start, next_month_start)
    last_month_orders = orders_count_between(last_month_start, this_month_start)
    new_customers_this_month = customers_count_between(this_month_start, next_month_start)
    new_customers_last_month = customers_count_between(last_month_start, this_month_start)
    appointments_this_month = appointments_count_between(this_month_start, next_month_start)
    appointments_last_month = appointments_count_between(last_month_start, this_month_start)

    thirty_days_ago = now - timedelta(days=29)
    orders_last_30_days = db.execute(
        select(Order).where(
            Order.created_at >= thirty_days_ago.replace(hour=0, minute=0, second=0, microsecond=0),
            Order.status != "cancelled",
        )
    ).scalars().all()
    revenue_by_day: dict[str, float] = {}
    for i in range(30):
        day = (thirty_days_ago + timedelta(days=i)).strftime("%Y-%m-%d")
        revenue_by_day[day] = 0.0
    for order in orders_last_30_days:
        key = order.created_at.strftime("%Y-%m-%d")
        if key in revenue_by_day:
            revenue_by_day[key] += order.total
    daily_revenue = [
        DailyRevenuePoint(date=day, revenue=round(revenue, 2))
        for day, revenue in sorted(revenue_by_day.items())
    ]

    status_rows = db.execute(
        select(Order.status, func.count(Order.id)).group_by(Order.status)
    ).all()
    orders_by_status = [OrderStatusCount(status=row[0], count=row[1]) for row in status_rows]

    recent_orders_rows = (
        db.execute(
            select(Order)
            .options(joinedload(Order.user))
            .order_by(Order.created_at.desc())
            .limit(10)
        )
        .scalars()
        .all()
    )
    recent_orders = [
        AdminOrderSummary(
            id=order.id,
            order_reference=order.order_reference,
            customer_name=order.user.full_name,
            total=order.total,
            status=order.status,
            created_at=order.created_at,
        )
        for order in recent_orders_rows
    ]

    popular_rows = db.execute(
        select(
            Product.id,
            Product.name,
            Product.category,
            func.coalesce(func.sum(OrderItem.quantity), 0).label("units_sold"),
            func.coalesce(func.sum(OrderItem.quantity * OrderItem.unit_price), 0.0).label(
                "revenue"
            ),
        )
        .join(ProductVariant, ProductVariant.product_id == Product.id)
        .join(OrderItem, OrderItem.variant_id == ProductVariant.id)
        .group_by(Product.id, Product.name, Product.category)
        .order_by(func.sum(OrderItem.quantity).desc())
        .limit(5)
    ).all()
    popular_products = [
        AdminProductSummary(
            id=row.id,
            name=row.name,
            category=row.category,
            units_sold=row.units_sold,
            revenue=row.revenue,
        )
        for row in popular_rows
    ]

    return AdminAnalyticsSummary(
        this_month_revenue=this_month_revenue,
        last_month_revenue=last_month_revenue,
        revenue_trend_pct=_trend_pct(this_month_revenue, last_month_revenue),
        this_month_orders=this_month_orders,
        last_month_orders=last_month_orders,
        orders_trend_pct=_trend_pct(this_month_orders, last_month_orders),
        new_customers_this_month=new_customers_this_month,
        customers_trend_pct=_trend_pct(new_customers_this_month, new_customers_last_month),
        appointments_this_month=appointments_this_month,
        appointments_trend_pct=_trend_pct(appointments_this_month, appointments_last_month),
        daily_revenue_last_30_days=daily_revenue,
        orders_by_status=orders_by_status,
        recent_orders=recent_orders,
        popular_products=popular_products,
    )
