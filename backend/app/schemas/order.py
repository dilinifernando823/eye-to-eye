from datetime import datetime

from pydantic import BaseModel, ConfigDict

from app.schemas.product import ProductImageResponse, ProductVariantResponse


class ProductMiniResponse(BaseModel):
    id: int
    name: str
    category: str
    brand: str | None
    images: list[ProductImageResponse]

    model_config = ConfigDict(from_attributes=True)


class VariantWithProductResponse(ProductVariantResponse):
    product: ProductMiniResponse

    model_config = ConfigDict(from_attributes=True)


class OrderItemResponse(BaseModel):
    id: int
    order_id: int
    variant_id: int
    quantity: int
    unit_price: float
    variant: VariantWithProductResponse

    model_config = ConfigDict(from_attributes=True)


class OrderResponse(BaseModel):
    id: int
    order_reference: str
    user_id: int
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
    prescription_id: int | None
    prescription_url: str | None
    prescription_notes: str | None
    created_at: datetime
    updated_at: datetime | None
    items: list[OrderItemResponse]

    model_config = ConfigDict(from_attributes=True)


class OrderListResponse(BaseModel):
    id: int
    order_reference: str
    status: str
    total: float
    created_at: datetime
    items_count: int

    model_config = ConfigDict(from_attributes=True)


class CartItemResponse(BaseModel):
    id: int
    user_id: int
    variant_id: int
    quantity: int
    variant: VariantWithProductResponse

    model_config = ConfigDict(from_attributes=True)


class CartItemCreate(BaseModel):
    variant_id: int
    quantity: int = 1


class CartItemUpdate(BaseModel):
    quantity: int


class OrderStatusUpdate(BaseModel):
    status: str


class WishlistItemCreate(BaseModel):
    variant_id: int


class WishlistItemResponse(BaseModel):
    id: int
    user_id: int
    variant_id: int
    variant: VariantWithProductResponse

    model_config = ConfigDict(from_attributes=True)
