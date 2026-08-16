from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class ProductImageResponse(BaseModel):
    id: int
    product_id: int
    image_url: str
    is_primary: bool
    is_virtual_try_on: bool
    display_order: int

    model_config = ConfigDict(from_attributes=True)


class ProductVariantResponse(BaseModel):
    id: int
    product_id: int
    lens_type: str | None
    sku: str
    price: float
    stock_quantity: int

    model_config = ConfigDict(from_attributes=True)


class ProductListResponse(BaseModel):
    id: int
    name: str
    category: str
    brand: str | None
    gender: str | None
    colour: str | None
    frame_shape: str | None
    has_3d_model: bool
    is_active: bool
    is_featured: bool
    created_at: datetime
    images: list[ProductImageResponse]
    variants: list[ProductVariantResponse]

    model_config = ConfigDict(from_attributes=True)


class ProductResponse(BaseModel):
    id: int
    name: str
    category: str
    brand: str | None
    gender: str | None
    colour: str | None
    frame_shape: str | None
    has_3d_model: bool
    is_active: bool
    is_featured: bool
    created_at: datetime
    images: list[ProductImageResponse]
    variants: list[ProductVariantResponse]
    description: str | None
    frame_material: str | None
    gltf_model_url: str | None

    model_config = ConfigDict(from_attributes=True)


class ProductVariantCreate(BaseModel):
    id: int | None = None
    lens_type: str | None = None
    sku: str
    price: float
    stock_quantity: int = 0


class ProductCreate(BaseModel):
    name: str
    description: str | None = None
    category: str
    brand: str | None = None
    gender: str | None = None
    frame_shape: str | None = None
    frame_material: str | None = None
    colour: str | None = None
    has_3d_model: bool = False
    gltf_model_url: str | None = None
    is_featured: bool = False
    is_active: bool = True
    variants: list[ProductVariantCreate] = Field(default_factory=list, min_length=1)


class ProductUpdate(BaseModel):
    name: str | None = None
    description: str | None = None
    category: str | None = None
    brand: str | None = None
    gender: str | None = None
    frame_shape: str | None = None
    frame_material: str | None = None
    colour: str | None = None
    has_3d_model: bool | None = None
    gltf_model_url: str | None = None
    is_featured: bool | None = None
    is_active: bool | None = None
    variants: list[ProductVariantCreate] | None = None


class ImageReorderItem(BaseModel):
    id: int
    display_order: int


class ProductImagesReorderRequest(BaseModel):
    items: list[ImageReorderItem]


class BulkProductActionRequest(BaseModel):
    action: str
    product_ids: list[int]
