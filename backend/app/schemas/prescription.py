from datetime import datetime

from pydantic import BaseModel, ConfigDict

from app.schemas.product import ProductImageResponse


class PrescriptionValuesInput(BaseModel):
    right_sph: str | None = None
    right_cyl: str | None = None
    right_axis: str | None = None
    right_add: str | None = None
    left_sph: str | None = None
    left_cyl: str | None = None
    left_axis: str | None = None
    left_add: str | None = None
    pd: str | None = None


class PrescriptionManualInput(PrescriptionValuesInput):
    pass


class MatchingProductResponse(BaseModel):
    id: int
    name: str
    brand: str | None
    images: list[ProductImageResponse]

    model_config = ConfigDict(from_attributes=True)


class MatchingVariantResponse(BaseModel):
    id: int
    product_id: int
    lens_type: str | None
    sku: str
    price: float
    stock_quantity: int
    product: MatchingProductResponse

    model_config = ConfigDict(from_attributes=True)


class PrescriptionResponse(BaseModel):
    id: int
    user_id: int
    file_url: str | None
    original_filename: str | None
    ocr_success: bool
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
    lens_recommendation_reason: str | None
    advice_message: str | None
    has_match: bool
    is_active: bool
    created_at: datetime
    updated_at: datetime | None

    model_config = ConfigDict(from_attributes=True)


class PrescriptionListResponse(BaseModel):
    id: int
    original_filename: str | None
    recommended_lens_types: list[str] | None
    has_match: bool
    is_active: bool
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class PrescriptionWithMatchesResponse(PrescriptionResponse):
    matching_variants: list[MatchingVariantResponse]
