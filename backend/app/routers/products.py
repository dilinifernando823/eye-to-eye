from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import or_, select
from sqlalchemy.orm import Session, joinedload

from app.core.dependencies import optional_user
from app.database import get_db
from app.models.product import Product, ProductVariant, ProductView
from app.models.user import User
from app.schemas.product import ProductListResponse, ProductResponse

router = APIRouter()


@router.get("/", response_model=list[ProductListResponse])
def list_products(
    db: Session = Depends(get_db),
    category: str | None = Query(default=None),
    brand: str | None = Query(default=None),
    gender: str | None = Query(default=None),
    frame_shape: str | None = Query(default=None),
    colour: str | None = Query(default=None),
    frame_material: str | None = Query(default=None),
    min_price: float | None = Query(default=None),
    max_price: float | None = Query(default=None),
    lens_type: str | None = Query(default=None),
    sort_by: str = Query(default="newest"),
    page: int = Query(default=1, ge=1),
    limit: int = Query(default=20, ge=1, le=100),
    search: str | None = Query(default=None),
) -> list[Product]:
    query = (
        select(Product)
        .where(Product.is_active == True)  # noqa: E712
        .options(joinedload(Product.images), joinedload(Product.variants))
    )

    if category:
        query = query.where(Product.category == category)
    if brand:
        query = query.where(Product.brand == brand)
    if gender:
        query = query.where(Product.gender == gender)
    if frame_shape:
        query = query.where(Product.frame_shape == frame_shape)
    if colour:
        query = query.where(Product.colour == colour)
    if frame_material:
        query = query.where(Product.frame_material == frame_material)
    if search:
        query = query.where(
            or_(Product.name.ilike(f"%{search}%"), Product.brand.ilike(f"%{search}%"))
        )
    if min_price is not None or max_price is not None or lens_type:
        query = query.join(ProductVariant, ProductVariant.product_id == Product.id)
        if min_price is not None:
            query = query.where(ProductVariant.price >= min_price)
        if max_price is not None:
            query = query.where(ProductVariant.price <= max_price)
        if lens_type:
            query = query.where(ProductVariant.lens_type == lens_type)

    if sort_by == "price_asc":
        query = query.join(
            ProductVariant, ProductVariant.product_id == Product.id, isouter=True
        ).order_by(ProductVariant.price.asc())
    elif sort_by == "price_desc":
        query = query.join(
            ProductVariant, ProductVariant.product_id == Product.id, isouter=True
        ).order_by(ProductVariant.price.desc())
    else:
        query = query.order_by(Product.created_at.desc())

    query = query.offset((page - 1) * limit).limit(limit)

    result = db.execute(query).unique().scalars().all()
    return list(result)


@router.get("/featured", response_model=list[ProductListResponse])
def get_featured_products(db: Session = Depends(get_db)) -> list[Product]:
    query = (
        select(Product)
        .where(Product.is_featured == True, Product.is_active == True)  # noqa: E712
        .options(joinedload(Product.images), joinedload(Product.variants))
        .limit(8)
    )
    result = db.execute(query).unique().scalars().all()
    return list(result)


@router.get("/search", response_model=list[ProductListResponse])
def search_products(
    q: str = Query(...),
    db: Session = Depends(get_db),
) -> list[Product]:
    query = (
        select(Product)
        .where(Product.is_active == True)  # noqa: E712
        .where(
            or_(
                Product.name.ilike(f"%{q}%"),
                Product.brand.ilike(f"%{q}%"),
                Product.description.ilike(f"%{q}%"),
            )
        )
        .options(joinedload(Product.images), joinedload(Product.variants))
    )
    result = db.execute(query).unique().scalars().all()
    return list(result)


@router.get("/{product_id}", response_model=ProductResponse)
def get_product(product_id: int, db: Session = Depends(get_db)) -> Product:
    query = (
        select(Product)
        .where(Product.id == product_id, Product.is_active == True)  # noqa: E712
        .options(joinedload(Product.images), joinedload(Product.variants))
    )
    product = db.execute(query).unique().scalar_one_or_none()
    if product is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")
    return product


@router.post("/{product_id}/view", status_code=status.HTTP_200_OK)
def record_product_view(
    product_id: int,
    db: Session = Depends(get_db),
    current_user: User | None = Depends(optional_user),
) -> dict[str, str]:
    product = db.execute(
        select(Product).where(Product.id == product_id)
    ).scalar_one_or_none()
    if product is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")

    view = ProductView(
        product_id=product_id,
        user_id=current_user.id if current_user else None,
    )
    db.add(view)
    db.commit()
    return {"message": "View recorded"}
