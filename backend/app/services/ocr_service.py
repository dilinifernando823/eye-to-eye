import io
import re

import pytesseract
from PIL import Image, ImageEnhance


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

            pages = convert_from_bytes(file_bytes)
            text_parts = []
            for page in pages:
                text_parts.append(pytesseract.image_to_string(page.convert("L")))
            return "\n".join(text_parts)

        processed_image = preprocess_image(file_bytes)
        return pytesseract.image_to_string(processed_image)
    except Exception:
        return ""


def parse_prescription_values(text: str) -> dict[str, str | None]:
    def find_value(pattern: str) -> str | None:
        match = re.search(pattern, text, re.IGNORECASE)
        return match.group(1) if match else None

    sph_matches = re.findall(r"SPH\D{0,5}([+-]?\d+\.\d{1,2})", text, re.IGNORECASE)
    cyl_matches = re.findall(r"CYL\D{0,5}([+-]?\d+\.\d{1,2})", text, re.IGNORECASE)
    axis_matches = re.findall(r"AXIS\D{0,5}(\d{1,3})", text, re.IGNORECASE)

    return {
        "right_sph": sph_matches[0] if len(sph_matches) > 0 else None,
        "right_cyl": cyl_matches[0] if len(cyl_matches) > 0 else None,
        "right_axis": axis_matches[0] if len(axis_matches) > 0 else None,
        "left_sph": sph_matches[1] if len(sph_matches) > 1 else None,
        "left_cyl": cyl_matches[1] if len(cyl_matches) > 1 else None,
        "left_axis": axis_matches[1] if len(axis_matches) > 1 else None,
        "add": find_value(r"ADD\D{0,5}([+-]?\d+\.\d{1,2})"),
        "raw_text": text,
    }
