from sqlalchemy import select
from sqlalchemy.orm import Session, joinedload

from app.models.product import Product, ProductVariant

FRAME_ONLY = "Frame Only"
SINGLE_VISION = "Single Vision"
BIFOCAL = "Bifocal"


def _has_value(value: str | None) -> bool:
    if value is None:
        return False
    try:
        return float(value) != 0.0
    except ValueError:
        return False


def determine_lens_types(prescription_data: dict[str, str | None]) -> tuple[list[str], str]:
    """Maps parsed/manual prescription values to the lens types this store sells.

    Returns (recommended_lens_types, reason).
    """
    has_error = any(
        _has_value(prescription_data.get(field))
        for field in ("right_sph", "right_cyl", "left_sph", "left_cyl")
    )
    has_add = any(
        _has_value(prescription_data.get(field)) for field in ("right_add", "left_add")
    )

    if has_add:
        return (
            [BIFOCAL],
            "A reading addition (ADD) was detected, which indicates presbyopia — "
            "bifocal lenses correct both distance and near vision in one lens.",
        )
    if has_error:
        return (
            [SINGLE_VISION],
            "Distance-only refractive correction was detected — single vision lenses "
            "are recommended.",
        )
    return (
        [FRAME_ONLY],
        "No refractive correction was detected, so any frame with non-prescription "
        "(plano) lenses will work.",
    )


def find_matching_variants(db: Session, lens_types: list[str]) -> list[ProductVariant]:
    if not lens_types:
        return []
    query = (
        select(ProductVariant)
        .join(Product, Product.id == ProductVariant.product_id)
        .where(
            ProductVariant.lens_type.in_(lens_types),
            ProductVariant.stock_quantity > 0,
            Product.is_active == True,  # noqa: E712
        )
        .options(joinedload(ProductVariant.product).joinedload(Product.images))
    )
    return list(db.execute(query).unique().scalars().all())


def generate_advice(lens_types: list[str], has_match: bool) -> str:
    lens_type_label = " or ".join(lens_types) if lens_types else "prescription lenses"
    if has_match:
        return (
            f"We found frames in stock with {lens_type_label} lenses available — "
            "browse them below and add your favourite to the cart."
        )
    return (
        f"We recommend {lens_type_label} lenses for you, but none of our current frames "
        "have that lens type in stock. Please check back soon or visit a store for options."
    )
