from datetime import date, datetime, time

from pydantic import BaseModel, ConfigDict

from app.schemas.user import UserResponse


class AppointmentCreate(BaseModel):
    appointment_date: date
    appointment_time: time
    notes: str | None = None


class AppointmentResponse(BaseModel):
    id: int
    user_id: int
    appointment_date: date
    appointment_time: time
    status: str
    notes: str | None
    created_at: datetime
    user: UserResponse

    model_config = ConfigDict(from_attributes=True)


class AppointmentSlot(BaseModel):
    time: str
    available: bool


class AppointmentStatusUpdate(BaseModel):
    status: str
