"""initial schema

Revision ID: 001
Revises:
Create Date: 2026-07-18

"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision: str = "001"
down_revision: Union[str, Sequence[str], None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # 1. users
    op.create_table(
        "users",
        sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column("email", sa.String(255), nullable=False, unique=True),
        sa.Column("full_name", sa.String(255), nullable=False),
        sa.Column("hashed_password", sa.String(255), nullable=False),
        sa.Column("phone", sa.String(20), nullable=True),
        sa.Column(
            "role",
            sa.Enum("customer", "admin", name="user_role"),
            nullable=False,
            server_default="customer",
        ),
        sa.Column("is_active", sa.Boolean(), server_default=sa.true()),
        sa.Column("delivery_address", sa.Text(), nullable=True),
        sa.Column("city", sa.String(100), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=True),
    )
    op.create_index("ix_users_email", "users", ["email"])

    # 2. products
    op.create_table(
        "products",
        sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column("name", sa.String(255), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column(
            "category",
            sa.Enum("spectacles", "sunglasses", "contact_lenses", name="product_category"),
            nullable=False,
        ),
        sa.Column("brand", sa.String(100), nullable=True),
        sa.Column("gender", sa.String(20), nullable=True),
        sa.Column("frame_shape", sa.String(50), nullable=True),
        sa.Column("frame_material", sa.String(50), nullable=True),
        sa.Column("colour", sa.String(50), nullable=True),
        sa.Column("has_3d_model", sa.Boolean(), server_default=sa.false()),
        sa.Column("gltf_model_url", sa.String(500), nullable=True),
        sa.Column("is_active", sa.Boolean(), server_default=sa.true()),
        sa.Column("is_featured", sa.Boolean(), server_default=sa.false()),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=True),
    )
    op.create_index("ix_products_id", "products", ["id"])
    op.create_index("ix_products_category", "products", ["category"])
    op.create_index("ix_products_brand", "products", ["brand"])

    # 3. product_images
    op.create_table(
        "product_images",
        sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column(
            "product_id",
            sa.Integer(),
            sa.ForeignKey("products.id"),
            nullable=False,
        ),
        sa.Column("image_url", sa.String(500), nullable=False),
        sa.Column("cloudinary_public_id", sa.String(255), nullable=False),
        sa.Column("is_primary", sa.Boolean(), server_default=sa.false()),
        sa.Column("display_order", sa.Integer(), server_default="0"),
    )

    # 4. product_variants
    op.create_table(
        "product_variants",
        sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column(
            "product_id",
            sa.Integer(),
            sa.ForeignKey("products.id"),
            nullable=False,
        ),
        sa.Column("lens_type", sa.String(100), nullable=True),
        sa.Column("sku", sa.String(100), nullable=False, unique=True),
        sa.Column("price", sa.Float(), nullable=False),
        sa.Column("stock_quantity", sa.Integer(), server_default="0"),
    )

    # product_views (supports POST /products/{id}/view)
    op.create_table(
        "product_views",
        sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column(
            "product_id",
            sa.Integer(),
            sa.ForeignKey("products.id"),
            nullable=False,
        ),
        sa.Column("user_id", sa.Integer(), sa.ForeignKey("users.id"), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )

    # 5. orders
    op.create_table(
        "orders",
        sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column("order_reference", sa.String(20), nullable=False, unique=True),
        sa.Column("user_id", sa.Integer(), sa.ForeignKey("users.id"), nullable=False),
        sa.Column(
            "status",
            sa.Enum(
                "pending",
                "processing",
                "dispatched",
                "delivered",
                "cancelled",
                name="order_status",
            ),
            server_default="pending",
        ),
        sa.Column("subtotal", sa.Float(), nullable=False),
        sa.Column("loyalty_discount", sa.Float(), server_default="0"),
        sa.Column("total", sa.Float(), nullable=False),
        sa.Column("loyalty_points_earned", sa.Integer(), server_default="0"),
        sa.Column("loyalty_points_used", sa.Integer(), server_default="0"),
        sa.Column("delivery_name", sa.String(255), nullable=False),
        sa.Column("delivery_address", sa.Text(), nullable=False),
        sa.Column("delivery_city", sa.String(100), nullable=False),
        sa.Column("delivery_phone", sa.String(20), nullable=False),
        sa.Column("prescription_url", sa.String(500), nullable=True),
        sa.Column("prescription_cloudinary_id", sa.String(255), nullable=True),
        sa.Column("prescription_notes", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=True),
    )

    # 6. order_items
    op.create_table(
        "order_items",
        sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column("order_id", sa.Integer(), sa.ForeignKey("orders.id"), nullable=False),
        sa.Column(
            "variant_id",
            sa.Integer(),
            sa.ForeignKey("product_variants.id"),
            nullable=False,
        ),
        sa.Column("quantity", sa.Integer(), nullable=False),
        sa.Column("unit_price", sa.Float(), nullable=False),
    )

    # 7. cart_items
    op.create_table(
        "cart_items",
        sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column("user_id", sa.Integer(), sa.ForeignKey("users.id"), nullable=False),
        sa.Column(
            "variant_id",
            sa.Integer(),
            sa.ForeignKey("product_variants.id"),
            nullable=False,
        ),
        sa.Column("quantity", sa.Integer(), nullable=False, server_default="1"),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )

    # 8. wishlist_items
    op.create_table(
        "wishlist_items",
        sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column("user_id", sa.Integer(), sa.ForeignKey("users.id"), nullable=False),
        sa.Column(
            "variant_id",
            sa.Integer(),
            sa.ForeignKey("product_variants.id"),
            nullable=False,
        ),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )

    # 9. appointments
    op.create_table(
        "appointments",
        sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column("user_id", sa.Integer(), sa.ForeignKey("users.id"), nullable=False),
        sa.Column("appointment_date", sa.Date(), nullable=False),
        sa.Column("appointment_time", sa.Time(), nullable=False),
        sa.Column(
            "status",
            sa.Enum(
                "pending", "confirmed", "completed", "cancelled", name="appointment_status"
            ),
            server_default="pending",
        ),
        sa.Column("notes", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=True),
    )

    # 10. loyalty_transactions
    op.create_table(
        "loyalty_transactions",
        sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column("user_id", sa.Integer(), sa.ForeignKey("users.id"), nullable=False),
        sa.Column(
            "transaction_type",
            sa.Enum(
                "earned_purchase",
                "earned_appointment",
                "earned_referral",
                "redeemed",
                "manual_adjustment",
                name="loyalty_transaction_type",
            ),
            nullable=False,
        ),
        sa.Column("points", sa.Integer(), nullable=False),
        sa.Column("reference_id", sa.Integer(), nullable=True),
        sa.Column("description", sa.String(255), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )


def downgrade() -> None:
    op.drop_table("loyalty_transactions")
    op.drop_table("appointments")
    op.drop_table("wishlist_items")
    op.drop_table("cart_items")
    op.drop_table("order_items")
    op.drop_table("orders")
    op.drop_table("product_views")
    op.drop_table("product_variants")
    op.drop_table("product_images")
    op.drop_table("products")
    op.drop_table("users")

    sa.Enum(name="loyalty_transaction_type").drop(op.get_bind(), checkfirst=True)
    sa.Enum(name="appointment_status").drop(op.get_bind(), checkfirst=True)
    sa.Enum(name="order_status").drop(op.get_bind(), checkfirst=True)
    sa.Enum(name="product_category").drop(op.get_bind(), checkfirst=True)
    sa.Enum(name="user_role").drop(op.get_bind(), checkfirst=True)
