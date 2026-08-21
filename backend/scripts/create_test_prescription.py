"""Generates a synthetic prescription image for OCR testing.

Run from backend/:
    venv/Scripts/python.exe -m scripts.create_test_prescription
"""
import os

from PIL import Image, ImageDraw, ImageFont


def create_test_prescription() -> str:
    img = Image.new("RGB", (800, 600), color="white")
    draw = ImageDraw.Draw(img)

    try:
        font_large = ImageFont.truetype("arial.ttf", 24)
        font_medium = ImageFont.truetype("arial.ttf", 18)
        font_small = ImageFont.truetype("arial.ttf", 14)
    except Exception:
        font_large = ImageFont.load_default()
        font_medium = font_large
        font_small = font_large

    black = (0, 0, 0)

    draw.text((40, 30), "EYE TO EYE OPTICIANS", fill=black, font=font_large)
    draw.text((40, 60), "Prescription Record", fill=black, font=font_medium)
    draw.text((40, 85), "Patient: Test Patient", fill=black, font=font_small)
    draw.text((40, 105), "Date: 2026-08-21", fill=black, font=font_small)

    draw.line([(40, 130), (760, 130)], fill=black, width=2)

    draw.text((300, 145), "RIGHT EYE", fill=black, font=font_medium)
    draw.text((540, 145), "LEFT EYE", fill=black, font=font_medium)
    draw.line([(40, 170), (760, 170)], fill=black, width=1)

    rows = [
        ("Sphere (SPH)", "-2.50", "-1.75"),
        ("Cylinder (CYL)", "-0.75", "-0.50"),
        ("Axis", "180", "170"),
        ("Addition (ADD)", "+2.00", "+2.00"),
    ]

    y = 180
    for label, right, left in rows:
        draw.text((40, y), label, fill=black, font=font_small)
        draw.text((300, y), right, fill=black, font=font_medium)
        draw.text((540, y), left, fill=black, font=font_medium)
        y += 40

    draw.line([(40, y), (760, y)], fill=black, width=1)
    y += 10
    draw.text((40, y), "PD (Pupillary Distance)", fill=black, font=font_small)
    draw.text((300, y), "64mm", fill=black, font=font_medium)

    y += 60
    draw.text(
        (40, y), "Prescribed by: Dr. Gayan Silva, Optometrist", fill=black, font=font_small
    )

    output_path = os.path.join(os.path.dirname(__file__), "test_prescription.jpg")
    img.save(output_path, "JPEG", quality=95)
    print(f"Test prescription image saved: {output_path}")
    return output_path


if __name__ == "__main__":
    path = create_test_prescription()
    print(f"Now test OCR: venv/Scripts/python.exe test_ocr.py {path}")
