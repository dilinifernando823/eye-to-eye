"""Standalone OCR test script.

Run from backend/:
    venv/Scripts/python.exe test_ocr.py path/to/prescription.jpg
    venv/Scripts/python.exe test_ocr.py path/to/prescription.pdf
"""
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))


def test_ocr(filepath: str) -> None:
    print(f"\nTesting OCR on: {filepath}")
    print("=" * 60)

    with open(filepath, "rb") as f:
        file_bytes = f.read()

    filename = os.path.basename(filepath)

    from app.services.ocr_service import extract_prescription_text, format_prescription_notes, parse_prescription_values

    print("\n[1] Raw text extraction:")
    print("-" * 40)
    raw = extract_prescription_text(file_bytes, filename)
    print(raw if raw else "No text extracted.")

    print("\n[2] Parsed prescription values:")
    print("-" * 40)
    parsed = parse_prescription_values(raw)
    for key, value in parsed.items():
        if key != "raw_text":
            print(f"{key}: {value}")

    print("\n[3] Formatted for database storage:")
    print("-" * 40)
    print(format_prescription_notes(raw))

    print("\n" + "=" * 60)
    print("OCR test complete.")


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python test_ocr.py <path_to_prescription_file>")
        print("Example: python test_ocr.py scripts/test_prescription.jpg")
        sys.exit(1)

    path = sys.argv[1]
    if not os.path.exists(path):
        print(f"File not found: {path}")
        sys.exit(1)

    test_ocr(path)
