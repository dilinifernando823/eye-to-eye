from datetime import date as date_type
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select
from sqlalchemy.orm import Session, joinedload

from app.core.dependencies import get_current_user
from app.database import get_db
from app.models.appointment import Appointment
from app.models.loyalty import LoyaltyTransaction
from app.models.user import User
from app.schemas.appointment import AppointmentCreate, AppointmentResponse, AppointmentSlot
from app.services.email_service import send_appointment_confirmation

router = APIRouter()

ALL_SLOTS = [
    "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
    "13:00", "13:30", "14:00", "14:30", "15:00", "15:30",
    "16:00", "16:30", "17:00",
]

APPOINTMENT_BOOKING_POINTS = 5


@router.get("/slots", response_model=list[AppointmentSlot])
def get_slots(
    date: str = Query(...),
    db: Session = Depends(get_db),
) -> list[AppointmentSlot]:
    try:
        requested_date = datetime.strptime(date, "%Y-%m-%d").date()
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid date format"
        )

    if requested_date < date_type.today():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Cannot book a past date"
        )

    booked_times = set(
        db.execute(
            select(Appointment.appointment_time).where(
                Appointment.appointment_date == requested_date,
                Appointment.status != "cancelled",
            )
        )
        .scalars()
        .all()
    )
    booked_time_strings = {t.strftime("%H:%M") for t in booked_times}

    return [
        AppointmentSlot(time=slot, available=slot not in booked_time_strings)
        for slot in ALL_SLOTS
    ]


@router.post("/", response_model=AppointmentResponse, status_code=status.HTTP_201_CREATED)
def create_appointment(
    payload: AppointmentCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> Appointment:
    if payload.appointment_date < date_type.today():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Cannot book a past date"
        )

    existing = db.execute(
        select(Appointment).where(
            Appointment.appointment_date == payload.appointment_date,
            Appointment.appointment_time == payload.appointment_time,
            Appointment.status != "cancelled",
        )
    ).scalar_one_or_none()
    if existing is not None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Slot already booked"
        )

    appointment = Appointment(
        user_id=current_user.id,
        appointment_date=payload.appointment_date,
        appointment_time=payload.appointment_time,
        notes=payload.notes,
    )
    db.add(appointment)
    db.flush()

    db.add(
        LoyaltyTransaction(
            user_id=current_user.id,
            transaction_type="earned_appointment",
            points=APPOINTMENT_BOOKING_POINTS,
            reference_id=appointment.id,
            description="Earned from booking an appointment",
        )
    )

    db.commit()
    db.refresh(appointment)

    try:
        send_appointment_confirmation(current_user.email, appointment)
    except Exception:
        pass

    return db.execute(
        select(Appointment)
        .where(Appointment.id == appointment.id)
        .options(joinedload(Appointment.user))
    ).unique().scalar_one()


@router.get("/", response_model=list[AppointmentResponse])
def list_appointments(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> list[Appointment]:
    result = (
        db.execute(
            select(Appointment)
            .where(Appointment.user_id == current_user.id)
            .options(joinedload(Appointment.user))
            .order_by(Appointment.appointment_date.desc())
        )
        .unique()
        .scalars()
        .all()
    )
    return list(result)


@router.get("/{appointment_id}", response_model=AppointmentResponse)
def get_appointment(
    appointment_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> Appointment:
    appointment = (
        db.execute(
            select(Appointment)
            .where(Appointment.id == appointment_id)
            .options(joinedload(Appointment.user))
        )
        .unique()
        .scalar_one_or_none()
    )
    if appointment is None or appointment.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Appointment not found"
        )
    return appointment
