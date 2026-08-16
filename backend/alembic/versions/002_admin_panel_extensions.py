"""add virtual try-on flag, site_settings, banners

Revision ID: 002
Revises: 001
Create Date: 2026-08-16

"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = "002"
down_revision: Union[str, Sequence[str], None] = "001"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column(
        "product_images",
        sa.Column(
            "is_virtual_try_on",
            sa.Boolean(),
            nullable=False,
            server_default=sa.false(),
        ),
    )

    op.create_table(
        "site_settings",
        sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column("setting_key", sa.String(100), unique=True, nullable=False),
        sa.Column("setting_value", sa.Text(), nullable=True),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
        ),
    )

    op.create_table(
        "banners",
        sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column("image_url", sa.String(500), nullable=False),
        sa.Column("cloudinary_public_id", sa.String(255), nullable=False),
        sa.Column("title", sa.String(255), nullable=True),
        sa.Column("subtitle", sa.String(255), nullable=True),
        sa.Column("cta_text", sa.String(100), nullable=True),
        sa.Column("cta_link", sa.String(500), nullable=True),
        sa.Column("display_order", sa.Integer(), server_default="0"),
        sa.Column("is_active", sa.Boolean(), server_default=sa.true()),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )

    op.execute(
        """
        INSERT INTO site_settings (setting_key, setting_value) VALUES
        ('store_name', 'Eye To Eye Opticians'),
        ('store_email', 'info@eyetoeye.lk'),
        ('store_phone', '+94 11 234 5678'),
        ('store_address', 'Colombo, Sri Lanka'),
        ('loyalty_earn_rate', '100'),
        ('loyalty_redeem_rate', '0.10'),
        ('max_slots_per_day', '8'),
        ('appointment_duration_minutes', '30')
        """
    )


def downgrade() -> None:
    op.drop_table("banners")
    op.drop_table("site_settings")
    op.drop_column("product_images", "is_virtual_try_on")
