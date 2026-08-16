import math

from fastapi import APIRouter, Depends, File, HTTPException, Query, UploadFile, status
from sqlalchemy import Select, func, select
from sqlalchemy.orm import Session, joinedload

from app.database import get_db
from app.models.product import Product, ProductImage, ProductVariant
from app.schemas.admin import PaginatedResponse
from app.schemas.product import (
    BulkProductActionRequest,
    ImageReorderItem,
    ProductCreate,
    ProductImageResponse,
    ProductImagesReorderRequest,
    ProductResponse,
    ProductUpdate,
)
from app.services.cloudinary_service import delete_file, upload_product_image

router = APIRouter(prefix="/products", tags=["admin-products"])


def _product_query() -> Select:
    return select(Product).options(joinedload(Product.images), joinedload(Product.variants))


def _get_product_or_404(db: Session, product_id: int) -> Product:
    product = (
        db.execute(_product_query().where(Product.id == product_id))
        .unique()
        .scalar_one_or_none()
    )
    if product is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")
    return product


@router.get("", response_model=PaginatedResponse[ProductResponse])
def list_products(
    db: Session = Depends(get_db),
    page: int = Query(default=1, ge=1),
    size: int = Query(default=20, ge=1, le=100),
    search: str | None = Query(default=None),
    category: str | None = Query(default=None),
    status_filter: str | None = Query(default=None, alias="status"),
) -> PaginatedResponse[ProductResponse]:
    def apply_filters(stmt: Select) -> Select:
        if search:
            stmt = stmt.where(
                (Product.name.ilike(f"%{search}%")) | (Product.brand.ilike(f"%{search}%"))
            )
        if category:
            stmt = stmt.where(Product.category == category)
        if status_filter == "active":
            stmt = stmt.where(Product.is_active == True)  # noqa: E712
        elif status_filter == "inactive":
            stmt = stmt.where(Product.is_active == False)  # noqa: E712
        return stmt

    # Count against a join-free selectable — the paginated query below uses
    # joinedload for images/variants, whose JOINs would otherwise fan out
    # rows and inflate a count taken from the same statement.
    total = db.execute(
        apply_filters(select(func.count()).select_from(Product))
    ).scalar_one()

    query = apply_filters(_product_query())
    query = query.order_by(Product.created_at.desc()).offset((page - 1) * size).limit(size)
    items = db.execute(query).unique().scalars().all()

    return PaginatedResponse(
        items=list(items),
        total=total,
        page=page,
        size=size,
        pages=max(1, math.ceil(total / size)),
    )


@router.post("", response_model=ProductResponse, status_code=status.HTTP_201_CREATED)
def create_product(payload: ProductCreate, db: Session = Depends(get_db)) -> Product:
    data = payload.model_dump(exclude={"variants"})
    product = Product(**data)
    db.add(product)
    db.flush()

    for variant in payload.variants:
        db.add(
            ProductVariant(
                product_id=product.id,
                lens_type=variant.lens_type,
                sku=variant.sku,
                price=variant.price,
                stock_quantity=variant.stock_quantity,
            )
        )

    db.commit()
    return _get_product_or_404(db, product.id)


@router.get("/{product_id}", response_model=ProductResponse)
def get_product(product_id: int, db: Session = Depends(get_db)) -> Product:
    return _get_product_or_404(db, product_id)


@router.put("/{product_id}", response_model=ProductResponse)
def update_product(
    product_id: int, payload: ProductUpdate, db: Session = Depends(get_db)
) -> Product:
    product = _get_product_or_404(db, product_id)

    update_data = payload.model_dump(exclude={"variants"}, exclude_none=True)
    for field, value in update_data.items():
        setattr(product, field, value)

    if payload.variants is not None:
        existing_by_id = {variant.id: variant for variant in product.variants}
        submitted_ids = {v.id for v in payload.variants if v.id is not None}

        for variant_id, variant in list(existing_by_id.items()):
            if variant_id not in submitted_ids:
                db.delete(variant)

        for variant_data in payload.variants:
            if variant_data.id is not None and variant_data.id in existing_by_id:
                existing = existing_by_id[variant_data.id]
                existing.lens_type = variant_data.lens_type
                existing.sku = variant_data.sku
                existing.price = variant_data.price
                existing.stock_quantity = variant_data.stock_quantity
            else:
                db.add(
                    ProductVariant(
                        product_id=product.id,
                        lens_type=variant_data.lens_type,
                        sku=variant_data.sku,
                        price=variant_data.price,
                        stock_quantity=variant_data.stock_quantity,
                    )
                )

    db.commit()
    return _get_product_or_404(db, product_id)


@router.patch("/{product_id}/toggle-featured", response_model=ProductResponse)
def toggle_featured(product_id: int, db: Session = Depends(get_db)) -> Product:
    product = _get_product_or_404(db, product_id)
    product.is_featured = not product.is_featured
    db.commit()
    return _get_product_or_404(db, product_id)


@router.patch("/{product_id}/toggle-active", response_model=ProductResponse)
def toggle_active(product_id: int, db: Session = Depends(get_db)) -> Product:
    product = _get_product_or_404(db, product_id)
    product.is_active = not product.is_active
    db.commit()
    return _get_product_or_404(db, product_id)


@router.delete("/{product_id}")
def delete_product(product_id: int, db: Session = Depends(get_db)) -> dict[str, str]:
    product = _get_product_or_404(db, product_id)
    product.is_active = False
    db.commit()
    return {"message": "Product deactivated"}


@router.post("/bulk-action")
def bulk_action(payload: BulkProductActionRequest, db: Session = Depends(get_db)) -> dict[str, str]:
    if payload.action not in {"activate", "deactivate"}:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Unknown action")

    products = db.execute(
        select(Product).where(Product.id.in_(payload.product_ids))
    ).scalars().all()
    for product in products:
        product.is_active = payload.action == "activate"

    db.commit()
    return {"message": f"{len(products)} product(s) updated"}


# --- Images ---


@router.get("/{product_id}/images", response_model=list[ProductImageResponse])
def list_images(product_id: int, db: Session = Depends(get_db)) -> list[ProductImage]:
    _get_product_or_404(db, product_id)
    images = db.execute(
        select(ProductImage)
        .where(ProductImage.product_id == product_id)
        .order_by(ProductImage.display_order)
    ).scalars().all()
    return list(images)


@router.post(
    "/{product_id}/images/upload",
    response_model=ProductImageResponse,
    status_code=status.HTTP_201_CREATED,
)
def upload_image(
    product_id: int, file: UploadFile = File(...), db: Session = Depends(get_db)
) -> ProductImage:
    _get_product_or_404(db, product_id)

    file_bytes = file.file.read()
    upload_result = upload_product_image(file_bytes, file.filename or "image", product_id)

    existing_count = db.execute(
        select(func.count())
        .select_from(ProductImage)
        .where(ProductImage.product_id == product_id)
    ).scalar_one()

    image = ProductImage(
        product_id=product_id,
        image_url=upload_result["url"],
        cloudinary_public_id=upload_result["public_id"],
        is_primary=existing_count == 0,
        display_order=existing_count,
    )
    db.add(image)
    db.commit()
    db.refresh(image)
    return image


def _get_image_or_404(db: Session, product_id: int, image_id: int) -> ProductImage:
    image = db.execute(
        select(ProductImage).where(
            ProductImage.id == image_id, ProductImage.product_id == product_id
        )
    ).scalar_one_or_none()
    if image is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Image not found")
    return image


@router.patch("/{product_id}/images/{image_id}/primary", response_model=ProductImageResponse)
def set_primary_image(
    product_id: int, image_id: int, db: Session = Depends(get_db)
) -> ProductImage:
    image = _get_image_or_404(db, product_id, image_id)

    other_images = db.execute(
        select(ProductImage).where(
            ProductImage.product_id == product_id, ProductImage.id != image_id
        )
    ).scalars().all()
    for other in other_images:
        other.is_primary = False

    image.is_primary = True
    db.commit()
    db.refresh(image)
    return image


@router.patch("/{product_id}/images/{image_id}/tryon", response_model=ProductImageResponse)
def set_tryon_image(
    product_id: int, image_id: int, db: Session = Depends(get_db)
) -> ProductImage:
    image = _get_image_or_404(db, product_id, image_id)

    if image.is_virtual_try_on:
        image.is_virtual_try_on = False
    else:
        other_images = db.execute(
            select(ProductImage).where(
                ProductImage.product_id == product_id, ProductImage.id != image_id
            )
        ).scalars().all()
        for other in other_images:
            other.is_virtual_try_on = False
        image.is_virtual_try_on = True

    db.commit()
    db.refresh(image)
    return image


@router.patch("/{product_id}/images/reorder", response_model=list[ProductImageResponse])
def reorder_images(
    product_id: int, payload: ProductImagesReorderRequest, db: Session = Depends(get_db)
) -> list[ProductImage]:
    _get_product_or_404(db, product_id)

    images_by_id = {
        image.id: image
        for image in db.execute(
            select(ProductImage).where(ProductImage.product_id == product_id)
        ).scalars().all()
    }

    item: ImageReorderItem
    for item in payload.items:
        if item.id in images_by_id:
            images_by_id[item.id].display_order = item.display_order

    db.commit()

    images = db.execute(
        select(ProductImage)
        .where(ProductImage.product_id == product_id)
        .order_by(ProductImage.display_order)
    ).scalars().all()
    return list(images)


@router.delete("/{product_id}/images/{image_id}")
def delete_image(product_id: int, image_id: int, db: Session = Depends(get_db)) -> dict[str, str]:
    image = _get_image_or_404(db, product_id, image_id)

    delete_file(image.cloudinary_public_id)
    db.delete(image)
    db.commit()
    return {"message": "Image deleted"}
