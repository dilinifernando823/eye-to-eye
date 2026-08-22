"""add prescriptions table and link to orders

Revision ID: 003
Revises: 002
Create Date: 2026-08-22

"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = "003"
down_revision: Union[str, Sequence[str], None] = "002"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "prescriptions",
        sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column(
            "user_id",
            sa.Integer(),
            sa.ForeignKey("users.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column("file_url", sa.String(500), nullable=True),
        sa.Column("cloudinary_id", sa.String(255), nullable=True),
        sa.Column("original_filename", sa.String(255), nullable=True),
        sa.Column("raw_ocr_text", sa.Text(), nullable=True),
        sa.Column("right_sph", sa.String(10), nullable=True),
        sa.Column("right_cyl", sa.String(10), nullable=True),
        sa.Column("right_axis", sa.String(10), nullable=True),
        sa.Column("right_add", sa.String(10), nullable=True),
        sa.Column("left_sph", sa.String(10), nullable=True),
        sa.Column("left_cyl", sa.String(10), nullable=True),
        sa.Column("left_axis", sa.String(10), nullable=True),
        sa.Column("left_add", sa.String(10), nullable=True),
        sa.Column("pd", sa.String(20), nullable=True),
        sa.Column("recommended_lens_types", sa.JSON(), nullable=True),
        sa.Column("lens_recommendation_reason", sa.Text(), nullable=True),
        sa.Column("advice_message", sa.Text(), nullable=True),
        sa.Column("has_match", sa.Boolean(), server_default=sa.false()),
        sa.Column("is_active", sa.Boolean(), server_default=sa.true()),
        sa.Column("ocr_success", sa.Boolean(), server_default=sa.false()),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
            onupdate=sa.func.now(),
        ),
    )
    op.create_index("ix_prescriptions_user_id", "prescriptions", ["user_id"])

    op.add_column(
        "orders",
        sa.Column(
            "prescription_id",
            sa.Integer(),
            sa.ForeignKey("prescriptions.id", ondelete="SET NULL"),
            nullable=True,
        ),
    )


def downgrade() -> None:
    op.drop_column("orders", "prescription_id")
    op.drop_index("ix_prescriptions_user_id", table_name="prescriptions")
    op.drop_table("prescriptions")
