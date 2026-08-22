FRAME_ONLY = "Frame Only"
SINGLE_VISION = "Single Vision"
BIFOCAL = "Bifocal"


def _has_value(value: str | None) -> bool:
    if value is None:
        return False
    try:
        return float(value) != 0.0
    except ValueError:
        return False


def determine_lens_types(prescription_data: dict[str, str | None]) -> tuple[list[str], str]:
    """Maps parsed/manual prescription values to the lens types this store sells.

    Returns (recommended_lens_types, reason).
    """
    has_error = any(
        _has_value(prescription_data.get(field))
        for field in ("right_sph", "right_cyl", "left_sph", "left_cyl")
    )
    has_add = any(
        _has_value(prescription_data.get(field)) for field in ("right_add", "left_add")
    )

    if has_add:
        return (
            [BIFOCAL],
            "A reading addition (ADD) was detected, which indicates presbyopia — "
            "bifocal lenses correct both distance and near vision in one lens.",
        )
    if has_error:
        return (
            [SINGLE_VISION],
            "Distance-only refractive correction was detected — single vision lenses "
            "are recommended.",
        )
    return (
        [FRAME_ONLY],
        "No refractive correction was detected, so any frame with non-prescription "
        "(plano) lenses will work.",
    )
