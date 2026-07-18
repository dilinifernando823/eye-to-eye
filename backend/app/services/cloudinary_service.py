import cloudinary
import cloudinary.uploader

from app.core.config import settings

cloudinary.config(
    cloud_name=settings.CLOUDINARY_CLOUD_NAME,
    api_key=settings.CLOUDINARY_API_KEY,
    api_secret=settings.CLOUDINARY_API_SECRET,
    secure=True,
)


def upload_product_image(file_bytes: bytes, filename: str, product_id: int) -> dict[str, str]:
    result = cloudinary.uploader.upload(
        file_bytes,
        folder=f"eye-to-eye/products/{product_id}",
        filename=filename,
        quality="auto",
        fetch_format="auto",
        transformation=[{"width": 800, "height": 800, "crop": "limit"}],
    )
    return {"url": result["secure_url"], "public_id": result["public_id"]}


def upload_prescription(file_bytes: bytes, filename: str, order_id: int) -> dict[str, str]:
    result = cloudinary.uploader.upload(
        file_bytes,
        folder=f"eye-to-eye/prescriptions/{order_id}",
        filename=filename,
        resource_type="auto",
    )
    return {"url": result["secure_url"], "public_id": result["public_id"]}


def upload_gltf_model(file_bytes: bytes, filename: str, product_id: int) -> dict[str, str]:
    result = cloudinary.uploader.upload(
        file_bytes,
        folder=f"eye-to-eye/models/{product_id}",
        filename=filename,
        resource_type="raw",
    )
    return {"url": result["secure_url"], "public_id": result["public_id"]}


def delete_file(public_id: str) -> None:
    cloudinary.uploader.destroy(public_id)
