from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import Boolean, DateTime, Enum, Integer, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base

if TYPE_CHECKING:
    from app.models.appointment import Appointment
    from app.models.loyalty import LoyaltyTransaction
    from app.models.order import CartItem, Order, WishlistItem
    from app.models.prescription import Prescription


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True, autoincrement=True)
    email: Mapped[str] = mapped_column(String(255), unique=True, nullable=False, index=True)
    full_name: Mapped[str] = mapped_column(String(255), nullable=False)
    hashed_password: Mapped[str] = mapped_column(String(255), nullable=False)
    phone: Mapped[str | None] = mapped_column(String(20), nullable=True)
    role: Mapped[str] = mapped_column(
        Enum("customer", "admin", name="user_role"), default="customer", nullable=False
    )
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    delivery_address: Mapped[str | None] = mapped_column(Text, nullable=True)
    city: Mapped[str | None] = mapped_column(String(100), nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
    updated_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), onupdate=func.now(), nullable=True
    )

    orders: Mapped[list["Order"]] = relationship(back_populates="user")
    appointments: Mapped[list["Appointment"]] = relationship(back_populates="user")
    cart_items: Mapped[list["CartItem"]] = relationship(
        back_populates="user", cascade="all, delete-orphan"
    )
    wishlist_items: Mapped[list["WishlistItem"]] = relationship(
        back_populates="user", cascade="all, delete-orphan"
    )
    loyalty_transactions: Mapped[list["LoyaltyTransaction"]] = relationship(
        back_populates="user"
    )
    prescriptions: Mapped[list["Prescription"]] = relationship(
        back_populates="user",
        cascade="all, delete-orphan",
        order_by="Prescription.created_at.desc()",
    )
