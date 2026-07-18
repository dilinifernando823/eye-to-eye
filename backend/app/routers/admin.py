from datetime import date, datetime, timedelta

from fastapi import APIRouter, Depends, File, HTTPException, Query, UploadFile, status
from sqlalchemy import func, select
from sqlalchemy.orm import Session, joinedload

from app.core.dependencies import get_admin_user
from app.database import get_db
from app.models.appointment import Appointment
from app.models.loyalty import LoyaltyTransaction
from app.models.order import Order, OrderItem
from app.models.product import Product, ProductImage, ProductVariant
from app.models.user import User
from app.schemas.appointment import AppointmentResponse, AppointmentStatusUpdate
from app.schemas.order import OrderResponse, OrderStatusUpdate
from app.schemas.product import ProductCreate, ProductImageResponse, ProductResponse, ProductUpdate
from app.schemas.user import UserResponse
from app.services.cloudinary_service import delete_file, upload_product_image

router = APIRouter(dependencies=[Depends(get_admin_user)])


# --- PRODUCTS ---


@router.get("/products", response_model=list[ProductResponse])
def admin_list_products(
    db: Session = Depends(get_db),
    page: int = Query(default=1, ge=1),
    limit: int = Query(default=20, ge=1, le=100),
    search: str | None = Query(default=None),
    category: str | None = Query(default=None),
) -> list[Product]:
    query = select(Product).options(joinedload(Product.images), joinedload(Product.variants))

    if search:
        query = query.where(Product.name.ilike(f"%{search}%"))
    if category:
        query = query.where(Product.category == category)

    query = query.offset((page - 1) * limit).limit(limit)
    result = db.execute(query).unique().scalars().all()
    return list(result)


@router.post("/products", response_model=ProductResponse, status_code=status.HTTP_201_CREATED)
def admin_create_product(payload: ProductCreate, db: Session = Depends(get_db)) -> Product:
    product = Product(**payload.model_dump())
    db.add(product)
    db.commit()
    db.refresh(product)
    return product


@router.put("/products/{product_id}", response_model=ProductResponse)
def admin_update_product(
    product_id: int, payload: ProductUpdate, db: Session = Depends(get_db)
) -> Product:
    product = db.execute(
        select(Product).where(Product.id == product_id)
    ).scalar_one_or_none()
    if product is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")

    update_data = payload.model_dump(exclude_none=True)
    for field, value in update_data.items():
        setattr(product, field, value)

    db.commit()
    db.refresh(product)
    return product


@router.delete("/products/{product_id}")
def admin_delete_product(product_id: int, db: Session = Depends(get_db)) -> dict[str, str]:
    product = db.execute(
        select(Product).where(Product.id == product_id)
    ).scalar_one_or_none()
    if product is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")

    product.is_active = False
    db.commit()
    return {"message": "Product deactivated"}


@router.post(
    "/products/{product_id}/images",
    response_model=ProductImageResponse,
    status_code=status.HTTP_201_CREATED,
)
def admin_upload_product_image(
    product_id: int, file: UploadFile = File(...), db: Session = Depends(get_db)
) -> ProductImage:
    product = db.execute(
        select(Product).where(Product.id == product_id)
    ).scalar_one_or_none()
    if product is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")

    file_bytes = file.file.read()
    upload_result = upload_product_image(file_bytes, file.filename or "image", product_id)

    existing_images_count = db.execute(
        select(func.count()).select_from(ProductImage).where(ProductImage.product_id == product_id)
    ).scalar_one()

    image = ProductImage(
        product_id=product_id,
        image_url=upload_result["url"],
        cloudinary_public_id=upload_result["public_id"],
        is_primary=existing_images_count == 0,
        display_order=existing_images_count,
    )
    db.add(image)
    db.commit()
    db.refresh(image)
    return image


@router.delete("/products/{product_id}/images/{image_id}")
def admin_delete_product_image(
    product_id: int, image_id: int, db: Session = Depends(get_db)
) -> dict[str, str]:
    image = db.execute(
        select(ProductImage).where(
            ProductImage.id == image_id, ProductImage.product_id == product_id
        )
    ).scalar_one_or_none()
    if image is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Image not found")

    delete_file(image.cloudinary_public_id)
    db.delete(image)
    db.commit()
    return {"message": "Image deleted"}


# --- ORDERS ---


@router.get("/orders", response_model=list[OrderResponse])
def admin_list_orders(
    db: Session = Depends(get_db),
    status_filter: str | None = Query(default=None, alias="status"),
    page: int = Query(default=1, ge=1),
    limit: int = Query(default=20, ge=1, le=100),
) -> list[Order]:
    query = select(Order).options(joinedload(Order.items), joinedload(Order.user))

    if status_filter:
        query = query.where(Order.status == status_filter)

    query = query.order_by(Order.created_at.desc()).offset((page - 1) * limit).limit(limit)
    result = db.execute(query).unique().scalars().all()
    return list(result)


@router.put("/orders/{order_id}/status", response_model=OrderResponse)
def admin_update_order_status(
    order_id: int, payload: OrderStatusUpdate, db: Session = Depends(get_db)
) -> Order:
    order = db.execute(
        select(Order)
        .where(Order.id == order_id)
        .options(joinedload(Order.items))
    ).unique().scalar_one_or_none()
    if order is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Order not found")

    order.status = payload.status
    db.commit()
    db.refresh(order)
    return order


# --- APPOINTMENTS ---


@router.get("/appointments", response_model=list[AppointmentResponse])
def admin_list_appointments(
    db: Session = Depends(get_db),
    status_filter: str | None = Query(default=None, alias="status"),
    date_filter: date | None = Query(default=None, alias="date"),
) -> list[Appointment]:
    query = select(Appointment).options(joinedload(Appointment.user))

    if status_filter:
        query = query.where(Appointment.status == status_filter)
    if date_filter:
        query = query.where(Appointment.appointment_date == date_filter)

    result = db.execute(query).unique().scalars().all()
    return list(result)


@router.put("/appointments/{appointment_id}/status", response_model=AppointmentResponse)
def admin_update_appointment_status(
    appointment_id: int, payload: AppointmentStatusUpdate, db: Session = Depends(get_db)
) -> Appointment:
    appointment = db.execute(
        select(Appointment).where(Appointment.id == appointment_id)
    ).scalar_one_or_none()
    if appointment is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Appointment not found"
        )

    appointment.status = payload.status
    db.commit()
    db.refresh(appointment)
    return db.execute(
        select(Appointment)
        .where(Appointment.id == appointment_id)
        .options(joinedload(Appointment.user))
    ).unique().scalar_one()


# --- CUSTOMERS ---


@router.get("/customers", response_model=list[UserResponse])
def admin_list_customers(
    db: Session = Depends(get_db),
    page: int = Query(default=1, ge=1),
    limit: int = Query(default=20, ge=1, le=100),
    search: str | None = Query(default=None),
) -> list[User]:
    query = select(User).where(User.role == "customer")

    if search:
        query = query.where(
            (User.full_name.ilike(f"%{search}%")) | (User.email.ilike(f"%{search}%"))
        )

    query = query.offset((page - 1) * limit).limit(limit)
    result = db.execute(query).scalars().all()
    return list(result)


@router.get("/customers/{customer_id}")
def admin_get_customer(
    customer_id: int, db: Session = Depends(get_db)
) -> dict[str, UserResponse | list[OrderResponse] | int]:
    customer = db.execute(
        select(User).where(User.id == customer_id, User.role == "customer")
    ).scalar_one_or_none()
    if customer is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Customer not found")

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

    loyalty_balance = db.execute(
        select(func.coalesce(func.sum(LoyaltyTransaction.points), 0)).where(
            LoyaltyTransaction.user_id == customer_id
        )
    ).scalar_one()

    return {
        "customer": UserResponse.model_validate(customer),
        "orders": [OrderResponse.model_validate(order) for order in orders],
        "loyalty_balance": loyalty_balance,
    }


# --- ANALYTICS ---


@router.get("/analytics/summary")
def analytics_summary(db: Session = Depends(get_db)) -> dict[str, float | int]:
    total_revenue = db.execute(
        select(func.coalesce(func.sum(Order.total), 0.0)).where(Order.status == "delivered")
    ).scalar_one()

    total_orders = db.execute(select(func.count()).select_from(Order)).scalar_one()

    total_customers = db.execute(
        select(func.count()).select_from(User).where(User.role == "customer")
    ).scalar_one()

    appointments_today = db.execute(
        select(func.count())
        .select_from(Appointment)
        .where(Appointment.appointment_date == date.today())
    ).scalar_one()

    return {
        "total_revenue": total_revenue,
        "total_orders": total_orders,
        "total_customers": total_customers,
        "appointments_today": appointments_today,
    }


@router.get("/analytics/sales")
def analytics_sales(
    db: Session = Depends(get_db), period: str = Query(default="day")
) -> list[dict[str, str | int | float]]:
    if period == "week":
        date_format = "%Y-W%W"
        cutoff = datetime.now() - timedelta(weeks=12)
    elif period == "month":
        date_format = "%Y-%m"
        cutoff = datetime.now() - timedelta(days=365)
    else:
        date_format = "%Y-%m-%d"
        cutoff = datetime.now() - timedelta(days=30)

    orders = db.execute(select(Order).where(Order.created_at >= cutoff)).scalars().all()

    grouped: dict[str, dict[str, float | int]] = {}
    for order in orders:
        key = order.created_at.strftime(date_format)
        if key not in grouped:
            grouped[key] = {"orders": 0, "revenue": 0.0}
        grouped[key]["orders"] += 1
        grouped[key]["revenue"] += order.total

    return [
        {"period": key, "orders": value["orders"], "revenue": value["revenue"]}
        for key, value in sorted(grouped.items())
    ]


@router.get("/analytics/popular-products")
def analytics_popular_products(db: Session = Depends(get_db)) -> list[dict[str, str | int]]:
    rows = db.execute(
        select(Product.id, Product.name, func.count(OrderItem.id).label("order_count"))
        .join(ProductVariant, ProductVariant.product_id == Product.id)
        .join(OrderItem, OrderItem.variant_id == ProductVariant.id)
        .group_by(Product.id, Product.name)
        .order_by(func.count(OrderItem.id).desc())
        .limit(10)
    ).all()

    return [{"id": row.id, "name": row.name, "order_count": row.order_count} for row in rows]
