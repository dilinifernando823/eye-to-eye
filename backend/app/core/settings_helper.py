from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.settings import SiteSetting


def get_setting(db: Session, key: str, default: str) -> str:
    row = db.execute(
        select(SiteSetting).where(SiteSetting.setting_key == key)
    ).scalar_one_or_none()
    return row.setting_value if row is not None and row.setting_value is not None else default
