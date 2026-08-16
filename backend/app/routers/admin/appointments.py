import math
from datetime import date

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import Select, func, select
from sqlalchemy.orm import Session, joinedload

from app.database import get_db
from app.models.appointment import Appointment
from app.schemas.admin import AdminAppointmentUpdateRequest, PaginatedResponse
from app.schemas.appointment import AppointmentResponse

router = APIRouter(prefix="/appointments", tags=["admin-appointments"])

ALLOWED_TRANSITIONS: dict[str, set[str]] = {
    "pending": {"confirmed", "cancelled"},
    "confirmed": {"completed", "cancelled"},
    "completed": set(),
    "cancelled": set(),
}


def _appointment_query() -> Select:
    return select(Appointment).options(joinedload(Appointment.user))


def _apply_filters(
    stmt: Select,
    status_filter: str | None,
    date_from: date | None,
    date_to: date | None,
) -> Select:
    if status_filter:
        stmt = stmt.where(Appointment.status == status_filter)
    if date_from:
        stmt = stmt.where(Appointment.appointment_date >= date_from)
    if date_to:
        stmt = stmt.where(Appointment.appointment_date <= date_to)
    return stmt


@router.get("", response_model=PaginatedResponse[AppointmentResponse])
def list_appointments(
    db: Session = Depends(get_db),
    page: int = Query(default=1, ge=1),
    size: int = Query(default=20, ge=1, le=100),
    status_filter: str | None = Query(default=None, alias="status"),
    date_from: date | None = Query(default=None),
    date_to: date | None = Query(default=None),
) -> PaginatedResponse[AppointmentResponse]:
    count_query = _apply_filters(select(Appointment), status_filter, date_from, date_to)
    total = db.execute(
        select(func.count()).select_from(count_query.with_only_columns(Appointment.id).subquery())
    ).scalar_one()

    query = _apply_filters(_appointment_query(), status_filter, date_from, date_to)
    query = (
        query.order_by(Appointment.appointment_date.desc(), Appointment.appointment_time.desc())
        .offset((page - 1) * size)
        .limit(size)
    )
    items = db.execute(query).unique().scalars().all()

    return PaginatedResponse(
        items=list(items),
        total=total,
        page=page,
        size=size,
        pages=max(1, math.ceil(total / size)),
    )


@router.get("/{appointment_id}", response_model=AppointmentResponse)
def get_appointment(appointment_id: int, db: Session = Depends(get_db)) -> Appointment:
    appointment = db.execute(
        _appointment_query().where(Appointment.id == appointment_id)
    ).unique().scalar_one_or_none()
    if appointment is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Appointment not found"
        )
    return appointment


@router.patch("/{appointment_id}", response_model=AppointmentResponse)
def update_appointment(
    appointment_id: int,
    payload: AdminAppointmentUpdateRequest,
    db: Session = Depends(get_db),
) -> Appointment:
    appointment = db.execute(
        select(Appointment).where(Appointment.id == appointment_id)
    ).scalar_one_or_none()
    if appointment is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Appointment not found"
        )

    if payload.status is not None:
        allowed = ALLOWED_TRANSITIONS.get(appointment.status, set())
        if payload.status not in allowed:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=(
                    f"Cannot transition appointment from '{appointment.status}' "
                    f"to '{payload.status}'"
                ),
            )
        appointment.status = payload.status
    if payload.notes is not None:
        appointment.notes = payload.notes

    db.commit()
    return db.execute(
        _appointment_query().where(Appointment.id == appointment_id)
    ).unique().scalar_one()
