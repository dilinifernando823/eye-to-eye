from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import JSON, Boolean, DateTime, ForeignKey, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base

if TYPE_CHECKING:
    from app.models.user import User


class Prescription(Base):
    __tablename__ = "prescriptions"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )

    file_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    cloudinary_id: Mapped[str | None] = mapped_column(String(255), nullable=True)
    original_filename: Mapped[str | None] = mapped_column(String(255), nullable=True)

    raw_ocr_text: Mapped[str | None] = mapped_column(Text, nullable=True)
    ocr_success: Mapped[bool] = mapped_column(Boolean, default=False)

    right_sph: Mapped[str | None] = mapped_column(String(10), nullable=True)
    right_cyl: Mapped[str | None] = mapped_column(String(10), nullable=True)
    right_axis: Mapped[str | None] = mapped_column(String(10), nullable=True)
    right_add: Mapped[str | None] = mapped_column(String(10), nullable=True)

    left_sph: Mapped[str | None] = mapped_column(String(10), nullable=True)
    left_cyl: Mapped[str | None] = mapped_column(String(10), nullable=True)
    left_axis: Mapped[str | None] = mapped_column(String(10), nullable=True)
    left_add: Mapped[str | None] = mapped_column(String(10), nullable=True)

    pd: Mapped[str | None] = mapped_column(String(20), nullable=True)

    recommended_lens_types: Mapped[list[str] | None] = mapped_column(JSON, nullable=True)
    lens_recommendation_reason: Mapped[str | None] = mapped_column(Text, nullable=True)
    advice_message: Mapped[str | None] = mapped_column(Text, nullable=True)
    has_match: Mapped[bool] = mapped_column(Boolean, default=False)

    is_active: Mapped[bool] = mapped_column(Boolean, default=True)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
    updated_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), onupdate=func.now(), nullable=True
    )

    user: Mapped["User"] = relationship(back_populates="prescriptions")
