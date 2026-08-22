from datetime import datetime
from typing import Generic, TypeVar

from pydantic import BaseModel, ConfigDict, EmailStr

T = TypeVar("T")


class PaginatedResponse(BaseModel, Generic[T]):
    items: list[T]
    total: int
    page: int
    size: int
    pages: int


# --- Analytics ---


class DailyRevenuePoint(BaseModel):
    date: str
    revenue: float


class OrderStatusCount(BaseModel):
    status: str
    count: int


class AdminOrderSummary(BaseModel):
    id: int
    order_reference: str
    customer_name: str
    total: float
    status: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class AdminProductSummary(BaseModel):
    id: int
    name: str
    category: str
    units_sold: int
    revenue: float


class AdminAnalyticsSummary(BaseModel):
    this_month_revenue: float
    last_month_revenue: float
    revenue_trend_pct: float
    this_month_orders: int
    last_month_orders: int
    orders_trend_pct: float
    new_customers_this_month: int
    customers_trend_pct: float
    appointments_this_month: int
    appointments_trend_pct: float
    daily_revenue_last_30_days: list[DailyRevenuePoint]
    orders_by_status: list[OrderStatusCount]
    recent_orders: list[AdminOrderSummary]
    popular_products: list[AdminProductSummary]


# --- Orders ---


class OrderStatusUpdateRequest(BaseModel):
    status: str


class AdminOrderListItem(BaseModel):
    id: int
    order_reference: str
    user_id: int
    customer_name: str
    customer_email: str
    status: str
    total: float
    items_count: int
    has_prescription: bool
    created_at: datetime
    updated_at: datetime | None


class AdminOrderPrescriptionDetail(BaseModel):
    id: int
    right_sph: str | None
    right_cyl: str | None
    right_axis: str | None
    right_add: str | None
    left_sph: str | None
    left_cyl: str | None
    left_axis: str | None
    left_add: str | None
    pd: str | None
    recommended_lens_types: list[str] | None

    model_config = ConfigDict(from_attributes=True)


class AdminOrderItemDetail(BaseModel):
    id: int
    variant_id: int
    quantity: int
    unit_price: float
    product_id: int
    product_name: str
    product_image_url: str | None
    lens_type: str | None


class AdminOrderDetail(BaseModel):
    id: int
    order_reference: str
    user_id: int
    customer_name: str
    customer_email: str
    customer_phone: str | None
    status: str
    subtotal: float
    loyalty_discount: float
    total: float
    loyalty_points_earned: int
    loyalty_points_used: int
    delivery_name: str
    delivery_address: str
    delivery_city: str
    delivery_phone: str
    prescription_url: str | None
    prescription_notes: str | None
    prescription: AdminOrderPrescriptionDetail | None
    items: list[AdminOrderItemDetail]
    created_at: datetime
    updated_at: datetime | None


# --- Appointments ---


class AdminAppointmentUpdateRequest(BaseModel):
    status: str | None = None
    notes: str | None = None


# --- Customers ---


class AdminCustomerResponse(BaseModel):
    id: int
    email: str
    full_name: str
    phone: str | None
    delivery_address: str | None
    city: str | None
    is_active: bool
    created_at: datetime
    total_orders: int
    total_spent: float
    loyalty_balance: int

    model_config = ConfigDict(from_attributes=True)


class AdminCustomerUpdateRequest(BaseModel):
    full_name: str | None = None
    phone: str | None = None
    delivery_address: str | None = None
    city: str | None = None
    is_active: bool | None = None


class LoyaltyAdjustRequest(BaseModel):
    points: int
    description: str


# --- Admin accounts ---


class AdminAccountResponse(BaseModel):
    id: int
    full_name: str
    email: str
    is_active: bool
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class AdminAccountCreateRequest(BaseModel):
    full_name: str
    email: EmailStr
    password: str


# --- Settings ---


class SiteSettingsResponse(BaseModel):
    store_name: str
    store_email: str
    store_phone: str
    store_address: str
    loyalty_earn_rate: float
    loyalty_redeem_rate: float
    max_slots_per_day: int
    appointment_duration_minutes: int


class SiteSettingsUpdateRequest(BaseModel):
    store_name: str | None = None
    store_email: str | None = None
    store_phone: str | None = None
    store_address: str | None = None
    loyalty_earn_rate: float | None = None
    loyalty_redeem_rate: float | None = None
    max_slots_per_day: int | None = None
    appointment_duration_minutes: int | None = None


# --- Banners ---


class BannerResponse(BaseModel):
    id: int
    image_url: str
    title: str | None
    subtitle: str | None
    cta_text: str | None
    cta_link: str | None
    display_order: int
    is_active: bool

    model_config = ConfigDict(from_attributes=True)


class BannerCreateRequest(BaseModel):
    title: str | None = None
    subtitle: str | None = None
    cta_text: str | None = None
    cta_link: str | None = None


class BannerUpdateRequest(BaseModel):
    title: str | None = None
    subtitle: str | None = None
    cta_text: str | None = None
    cta_link: str | None = None
    is_active: bool | None = None


class BannerReorderItem(BaseModel):
    id: int
    display_order: int


class BannerReorderRequest(BaseModel):
    items: list[BannerReorderItem]
