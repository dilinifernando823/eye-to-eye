import io
import re

import pytesseract
from PIL import Image, ImageEnhance

from app.core.config import settings

if settings.TESSERACT_CMD:
    pytesseract.pytesseract.tesseract_cmd = settings.TESSERACT_CMD


def preprocess_image(image_bytes: bytes) -> Image.Image:
    image = Image.open(io.BytesIO(image_bytes))
    grayscale = image.convert("L")
    enhancer = ImageEnhance.Contrast(grayscale)
    return enhancer.enhance(2.0)


def extract_prescription_text(file_bytes: bytes, filename: str = "file.jpg") -> str:
    try:
        extension = filename.rsplit(".", 1)[-1].lower()

        if extension == "pdf":
            from pdf2image import convert_from_bytes

            pages = convert_from_bytes(
                file_bytes,
                poppler_path=settings.POPPLER_PATH if settings.POPPLER_PATH else None,
            )
            text_parts = []
            for page in pages:
                text_parts.append(pytesseract.image_to_string(page.convert("L")))
            return "\n".join(text_parts)

        processed_image = preprocess_image(file_bytes)
        return pytesseract.image_to_string(processed_image)
    except Exception:
        return ""


def parse_prescription_values(text: str) -> dict[str, str | None]:
    """Extracts SPH/CYL/AXIS/ADD/PD from raw OCR text.

    Prescription slips commonly lay out each field as one row with both
    eyes' values on the same line (e.g. "SPH  -2.50  -1.75"), rather than
    the label appearing once per eye. find_pair() tries the same-line
    layout first and falls back to two separate label occurrences
    (e.g. a "Right Eye: SPH ..." / "Left Eye: SPH ..." layout) if that
    doesn't match.
    """

    def find_pair(label: str, value: str) -> tuple[str | None, str | None]:
        same_line = re.search(
            rf"{label}[^\d\n]{{0,10}}{value}[^\d\n]{{1,15}}{value}", text, re.IGNORECASE
        )
        if same_line:
            return same_line.group(1), same_line.group(2)

        all_matches = re.findall(rf"{label}[^\d\n]{{0,10}}{value}", text, re.IGNORECASE)
        right = all_matches[0] if len(all_matches) > 0 else None
        left = all_matches[1] if len(all_matches) > 1 else None
        return right, left

    def find_value(label: str, value: str, gap: int = 10) -> str | None:
        match = re.search(rf"{label}[^\d\n]{{0,{gap}}}{value}", text, re.IGNORECASE)
        return match.group(1) if match else None

    def normalise_power(value: str | None) -> str | None:
        if value is None:
            return None
        return "0.00" if value.lower() in ("plano", "pl", "pl.") else value

    power = r"(plano|pl\.?|[+-]?\d+\.\d{1,2})"
    axis_value = r"(\d{1,3})"

    right_sph, left_sph = find_pair("SPH(?:ERE)?", power)
    right_cyl, left_cyl = find_pair("CYL(?:INDER)?", power)
    right_axis, left_axis = find_pair("AXIS", axis_value)

    return {
        "right_sph": normalise_power(right_sph),
        "right_cyl": normalise_power(right_cyl),
        "right_axis": right_axis,
        "left_sph": normalise_power(left_sph),
        "left_cyl": normalise_power(left_cyl),
        "left_axis": left_axis,
        "add": normalise_power(find_value("ADD(?:ITION)?", power)),
        "pd": find_value(
            "PD", r"(\d{2}(?:\.\d)?(?:\s*/\s*\d{2}(?:\.\d)?)?)", gap=40
        ),
        "raw_text": text,
    }


def format_prescription_notes(text: str) -> str:
    """Combine parsed structured values with the raw OCR text for storage.

    Structured values come first so both admin and customer views can show
    a scannable summary, with the raw text kept below a separator so
    nothing is lost if parsing misses a field.
    """
    if not text.strip():
        return ""

    parsed = parse_prescription_values(text)

    def format_eye(sph: str | None, cyl: str | None, axis: str | None) -> str:
        parts = []
        if sph:
            parts.append(f"SPH {sph}")
        if cyl:
            parts.append(f"CYL {cyl}")
        if axis:
            parts.append(f"AXIS {axis}")
        return " | ".join(parts) if parts else "Not detected"

    lines = [
        f"RIGHT EYE: {format_eye(parsed['right_sph'], parsed['right_cyl'], parsed['right_axis'])}",
        f"LEFT EYE:  {format_eye(parsed['left_sph'], parsed['left_cyl'], parsed['left_axis'])}",
    ]
    if parsed["add"]:
        lines.append(f"ADD: {parsed['add']}")
    if parsed["pd"]:
        lines.append(f"PD: {parsed['pd']}mm")

    lines.append("---")
    lines.append(text)

    return "\n".join(lines)
