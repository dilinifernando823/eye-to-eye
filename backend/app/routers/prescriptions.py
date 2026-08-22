from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_user
from app.database import get_db
from app.models.prescription import Prescription
from app.models.user import User
from app.schemas.prescription import (
    PrescriptionListResponse,
    PrescriptionManualInput,
    PrescriptionResponse,
    PrescriptionValuesInput,
    PrescriptionWithMatchesResponse,
)
from app.services.cloudinary_service import upload_prescription
from app.services.lens_recommendation_service import (
    determine_lens_types,
    find_matching_variants,
    generate_advice,
)
from app.services.ocr_service import extract_prescription_text, parse_prescription_values

router = APIRouter()


def _apply_recommendation(db: Session, prescription: Prescription) -> None:
    data = {
        "right_sph": prescription.right_sph,
        "right_cyl": prescription.right_cyl,
        "left_sph": prescription.left_sph,
        "left_cyl": prescription.left_cyl,
        "right_add": prescription.right_add,
        "left_add": prescription.left_add,
    }
    lens_types, reason = determine_lens_types(data)
    matches = find_matching_variants(db, lens_types)

    prescription.recommended_lens_types = lens_types
    prescription.lens_recommendation_reason = reason
    prescription.has_match = len(matches) > 0
    prescription.advice_message = generate_advice(lens_types, prescription.has_match)


def _deactivate_others(db: Session, user_id: int, keep_id: int | None = None) -> None:
    others = db.execute(
        select(Prescription).where(
            Prescription.user_id == user_id, Prescription.id != keep_id
        )
    ).scalars().all()
    for other in others:
        other.is_active = False


def _get_owned_prescription(db: Session, prescription_id: int, user_id: int) -> Prescription:
    prescription = db.execute(
        select(Prescription).where(Prescription.id == prescription_id)
    ).scalar_one_or_none()
    if prescription is None or prescription.user_id != user_id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Prescription not found"
        )
    return prescription


def _with_matches(db: Session, prescription: Prescription) -> dict:
    matches = find_matching_variants(db, prescription.recommended_lens_types or [])
    base = PrescriptionResponse.model_validate(prescription).model_dump()
    return {**base, "matching_variants": matches}


@router.post("/upload", response_model=PrescriptionWithMatchesResponse, status_code=status.HTTP_201_CREATED)
def upload_prescription_file(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> dict:
    file_bytes = file.file.read()
    filename = file.filename or "prescription.jpg"

    file_url: str | None = None
    try:
        upload_result = upload_prescription(file_bytes, filename, current_user.id)
        file_url = upload_result["url"]
    except Exception:
        file_url = None

    ocr_text = extract_prescription_text(file_bytes, filename)
    ocr_success = bool(ocr_text.strip())
    parsed = parse_prescription_values(ocr_text) if ocr_success else {}

    prescription = Prescription(
        user_id=current_user.id,
        file_url=file_url,
        original_filename=filename,
        raw_ocr_text=ocr_text or None,
        ocr_success=ocr_success,
        right_sph=parsed.get("right_sph"),
        right_cyl=parsed.get("right_cyl"),
        right_axis=parsed.get("right_axis"),
        left_sph=parsed.get("left_sph"),
        left_cyl=parsed.get("left_cyl"),
        left_axis=parsed.get("left_axis"),
        pd=parsed.get("pd"),
        is_active=True,
    )
    _apply_recommendation(db, prescription)
    db.add(prescription)
    db.flush()
    _deactivate_others(db, current_user.id, keep_id=prescription.id)
    db.commit()
    db.refresh(prescription)

    return _with_matches(db, prescription)


@router.put("/{prescription_id}/values", response_model=PrescriptionWithMatchesResponse)
def update_prescription_values(
    prescription_id: int,
    payload: PrescriptionValuesInput,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> dict:
    prescription = _get_owned_prescription(db, prescription_id, current_user.id)

    for field, value in payload.model_dump().items():
        setattr(prescription, field, value)

    _apply_recommendation(db, prescription)
    db.commit()
    db.refresh(prescription)

    return _with_matches(db, prescription)


@router.post("/manual", response_model=PrescriptionWithMatchesResponse, status_code=status.HTTP_201_CREATED)
def create_manual_prescription(
    payload: PrescriptionManualInput,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> dict:
    prescription = Prescription(
        user_id=current_user.id,
        ocr_success=False,
        is_active=True,
        **payload.model_dump(),
    )
    _apply_recommendation(db, prescription)
    db.add(prescription)
    db.flush()
    _deactivate_others(db, current_user.id, keep_id=prescription.id)
    db.commit()
    db.refresh(prescription)

    return _with_matches(db, prescription)


@router.get("/", response_model=list[PrescriptionListResponse])
def list_prescriptions(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> list[Prescription]:
    prescriptions = db.execute(
        select(Prescription)
        .where(Prescription.user_id == current_user.id)
        .order_by(Prescription.created_at.desc())
    ).scalars().all()
    return list(prescriptions)


@router.get("/active", response_model=PrescriptionWithMatchesResponse)
def get_active_prescription(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> dict:
    prescription = db.execute(
        select(Prescription).where(
            Prescription.user_id == current_user.id, Prescription.is_active == True  # noqa: E712
        )
    ).scalar_one_or_none()
    if prescription is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="No active prescription"
        )
    return _with_matches(db, prescription)


@router.get("/{prescription_id}", response_model=PrescriptionWithMatchesResponse)
def get_prescription(
    prescription_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> dict:
    prescription = _get_owned_prescription(db, prescription_id, current_user.id)
    return _with_matches(db, prescription)
