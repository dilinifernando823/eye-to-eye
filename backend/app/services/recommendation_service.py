from sqlalchemy import func, select
from sqlalchemy.orm import Session, joinedload

from app.models.order import Order, OrderItem
from app.models.product import Product, ProductVariant


def get_popular_products(db: Session, limit: int = 8) -> list[Product]:
    # Outer joins so products with zero sales yet still appear (ranked
    # last) instead of vanishing from the "popular" fallback entirely.
    rows = (
        db.execute(
            select(Product)
            .outerjoin(ProductVariant, ProductVariant.product_id == Product.id)
            .outerjoin(OrderItem, OrderItem.variant_id == ProductVariant.id)
            .where(Product.is_active == True)  # noqa: E712
            .options(joinedload(Product.images), joinedload(Product.variants))
            .group_by(Product.id)
            .order_by(func.count(OrderItem.id).desc())
            .limit(limit)
        )
        .unique()
        .scalars()
        .all()
    )
    return list(rows)


def get_recommendations(user_id: int | None, db: Session, limit: int = 8) -> list[Product]:
    if user_id is None:
        return get_popular_products(db, limit)

    ordered_product_ids = set(
        db.execute(
            select(ProductVariant.product_id)
            .join(OrderItem, OrderItem.variant_id == ProductVariant.id)
            .join(Order, Order.id == OrderItem.order_id)
            .where(Order.user_id == user_id)
            .distinct()
        )
        .scalars()
        .all()
    )

    if not ordered_product_ids:
        return get_popular_products(db, limit)

    similar_user_ids = set(
        db.execute(
            select(Order.user_id)
            .join(OrderItem, OrderItem.order_id == Order.id)
            .join(ProductVariant, ProductVariant.id == OrderItem.variant_id)
            .where(ProductVariant.product_id.in_(ordered_product_ids))
            .where(Order.user_id != user_id)
            .distinct()
        )
        .scalars()
        .all()
    )

    recommendations: list[Product] = []
    if similar_user_ids:
        rows = (
            db.execute(
                select(Product)
                .join(ProductVariant, ProductVariant.product_id == Product.id)
                .join(OrderItem, OrderItem.variant_id == ProductVariant.id)
                .join(Order, Order.id == OrderItem.order_id)
                .where(Order.user_id.in_(similar_user_ids))
                .where(Product.id.notin_(ordered_product_ids))
                .where(Product.is_active == True)  # noqa: E712
                .options(joinedload(Product.images), joinedload(Product.variants))
                .group_by(Product.id)
                .order_by(func.count(OrderItem.id).desc())
                .limit(limit)
            )
            .unique()
            .scalars()
            .all()
        )
        recommendations = list(rows)

    if len(recommendations) < limit:
        existing_ids = {product.id for product in recommendations}
        remaining = limit - len(recommendations)
        for product in get_popular_products(db, limit + len(existing_ids)):
            if product.id not in existing_ids and product.id not in ordered_product_ids:
                recommendations.append(product)
                existing_ids.add(product.id)
                remaining -= 1
                if remaining == 0:
                    break

    return recommendations


def get_similar_products(
    db: Session, product_id: int, category: str, limit: int = 4
) -> list[Product]:
    rows = (
        db.execute(
            select(Product)
            .outerjoin(ProductVariant, ProductVariant.product_id == Product.id)
            .outerjoin(OrderItem, OrderItem.variant_id == ProductVariant.id)
            .where(
                Product.is_active == True,  # noqa: E712
                Product.category == category,
                Product.id != product_id,
            )
            .options(joinedload(Product.images), joinedload(Product.variants))
            .group_by(Product.id)
            .order_by(func.count(OrderItem.id).desc())
            .limit(limit)
        )
        .unique()
        .scalars()
        .all()
    )
    return list(rows)
