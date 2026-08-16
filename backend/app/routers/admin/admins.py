from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.admin_deps import get_admin_user
from app.core.security import hash_password
from app.database import get_db
from app.models.user import User
from app.schemas.admin import AdminAccountCreateRequest, AdminAccountResponse

router = APIRouter(prefix="/admins", tags=["admin-accounts"])


@router.get("", response_model=list[AdminAccountResponse])
def list_admins(db: Session = Depends(get_db)) -> list[User]:
    admins = db.execute(
        select(User).where(User.role == "admin").order_by(User.created_at.desc())
    ).scalars().all()
    return list(admins)


@router.post("", response_model=AdminAccountResponse, status_code=status.HTTP_201_CREATED)
def create_admin(payload: AdminAccountCreateRequest, db: Session = Depends(get_db)) -> User:
    existing = db.execute(
        select(User).where(User.email == payload.email)
    ).scalar_one_or_none()
    if existing is not None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Email already registered"
        )

    admin = User(
        email=payload.email,
        full_name=payload.full_name,
        hashed_password=hash_password(payload.password),
        role="admin",
        is_active=True,
    )
    db.add(admin)
    db.commit()
    db.refresh(admin)
    return admin


@router.delete("/{admin_id}")
def delete_admin(
    admin_id: int,
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_admin_user),
) -> dict[str, str]:
    if admin_id == current_admin.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="You cannot delete your own account"
        )

    admin = db.execute(
        select(User).where(User.id == admin_id, User.role == "admin")
    ).scalar_one_or_none()
    if admin is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Admin not found")

    db.delete(admin)
    db.commit()
    return {"message": "Admin account deleted"}
