from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.settings import Banner, SiteSetting
from app.schemas.admin import (
    BannerCreateRequest,
    BannerReorderRequest,
    BannerResponse,
    BannerUpdateRequest,
    SiteSettingsResponse,
    SiteSettingsUpdateRequest,
)
from app.services.cloudinary_service import delete_file, upload_banner_image

router = APIRouter(tags=["admin-settings"])

SETTINGS_DEFAULTS: dict[str, str] = {
    "store_name": "Eye To Eye Opticians",
    "store_email": "info@eyetoeye.lk",
    "store_phone": "",
    "store_address": "",
    "loyalty_earn_rate": "100",
    "loyalty_redeem_rate": "0.10",
    "max_slots_per_day": "8",
    "appointment_duration_minutes": "30",
}


@router.get("/settings", response_model=SiteSettingsResponse)
def get_settings(db: Session = Depends(get_db)) -> SiteSettingsResponse:
    rows = db.execute(select(SiteSetting)).scalars().all()
    values = {row.setting_key: row.setting_value for row in rows}
    merged = {**SETTINGS_DEFAULTS, **{k: v for k, v in values.items() if v is not None}}

    return SiteSettingsResponse(
        store_name=merged["store_name"],
        store_email=merged["store_email"],
        store_phone=merged["store_phone"],
        store_address=merged["store_address"],
        loyalty_earn_rate=float(merged["loyalty_earn_rate"]),
        loyalty_redeem_rate=float(merged["loyalty_redeem_rate"]),
        max_slots_per_day=int(merged["max_slots_per_day"]),
        appointment_duration_minutes=int(merged["appointment_duration_minutes"]),
    )


@router.patch("/settings", response_model=SiteSettingsResponse)
def update_settings(
    payload: SiteSettingsUpdateRequest, db: Session = Depends(get_db)
) -> SiteSettingsResponse:
    update_data = payload.model_dump(exclude_none=True)

    for key, value in update_data.items():
        row = db.execute(
            select(SiteSetting).where(SiteSetting.setting_key == key)
        ).scalar_one_or_none()
        if row is None:
            row = SiteSetting(setting_key=key, setting_value=str(value))
            db.add(row)
        else:
            row.setting_value = str(value)

    db.commit()
    return get_settings(db)


# --- Banners ---


def _get_banner_or_404(db: Session, banner_id: int) -> Banner:
    banner = db.execute(select(Banner).where(Banner.id == banner_id)).scalar_one_or_none()
    if banner is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Banner not found")
    return banner


@router.get("/banners", response_model=list[BannerResponse])
def list_banners(db: Session = Depends(get_db)) -> list[Banner]:
    banners = db.execute(select(Banner).order_by(Banner.display_order)).scalars().all()
    return list(banners)


@router.post("/banners", response_model=BannerResponse, status_code=status.HTTP_201_CREATED)
def create_banner(
    db: Session = Depends(get_db),
    file: UploadFile = File(...),
    title: str | None = Form(default=None),
    subtitle: str | None = Form(default=None),
    cta_text: str | None = Form(default=None),
    cta_link: str | None = Form(default=None),
) -> Banner:
    file_bytes = file.file.read()
    upload_result = upload_banner_image(file_bytes, file.filename or "banner")

    existing_count = db.execute(select(Banner)).scalars().all()

    banner = Banner(
        image_url=upload_result["url"],
        cloudinary_public_id=upload_result["public_id"],
        title=title,
        subtitle=subtitle,
        cta_text=cta_text,
        cta_link=cta_link,
        display_order=len(existing_count),
    )
    db.add(banner)
    db.commit()
    db.refresh(banner)
    return banner


@router.patch("/banners/reorder", response_model=list[BannerResponse])
def reorder_banners(
    payload: BannerReorderRequest, db: Session = Depends(get_db)
) -> list[Banner]:
    banners_by_id = {banner.id: banner for banner in db.execute(select(Banner)).scalars().all()}
    for item in payload.items:
        if item.id in banners_by_id:
            banners_by_id[item.id].display_order = item.display_order

    db.commit()
    banners = db.execute(select(Banner).order_by(Banner.display_order)).scalars().all()
    return list(banners)


@router.patch("/banners/{banner_id}", response_model=BannerResponse)
def update_banner(
    banner_id: int, payload: BannerUpdateRequest, db: Session = Depends(get_db)
) -> Banner:
    banner = _get_banner_or_404(db, banner_id)

    update_data = payload.model_dump(exclude_none=True)
    for field, value in update_data.items():
        setattr(banner, field, value)

    db.commit()
    db.refresh(banner)
    return banner


@router.delete("/banners/{banner_id}")
def delete_banner(banner_id: int, db: Session = Depends(get_db)) -> dict[str, str]:
    banner = _get_banner_or_404(db, banner_id)

    delete_file(banner.cloudinary_public_id)
    db.delete(banner)
    db.commit()
    return {"message": "Banner deleted"}
