"""Seed the products table with the catalog currently hardcoded in the
frontend's mockData.ts, reusing the same local image paths served from
frontend/public. Run once (or after a DB reset) with:

    venv/Scripts/python.exe -m scripts.seed_products
"""
from sqlalchemy import select

from app.database import SessionLocal
from app.models.product import Product, ProductImage, ProductVariant

PRODUCTS = [
    {
        "name": "Classic Tortoise Frame",
        "description": (
            "A timeless tortoise acetate frame with a classic rectangular shape. "
            "Perfect for everyday wear, offering both style and comfort."
        ),
        "category": "spectacles",
        "brand": "RayBan",
        "gender": "unisex",
        "frame_shape": "Rectangle",
        "frame_material": "Acetate",
        "colour": "Brown",
        "has_3d_model": True,
        "is_featured": True,
        "images": ["/products/spectacles/specone.jpg", "/products/spectacles/spectwo.jpg"],
        "variants": [
            ("Frame Only", "RB-TF-001", 4500, 15),
            ("Single Vision", "RB-TF-002", 7500, 10),
            ("Crizal", "RB-TF-003", 12000, 5),
        ],
    },
    {
        "name": "Slim Metal Aviator",
        "description": (
            "Lightweight titanium aviator frames with a modern slim profile. "
            "Ideal for professionals seeking a sophisticated look."
        ),
        "category": "spectacles",
        "brand": "Oakley",
        "gender": "men",
        "frame_shape": "Aviator",
        "frame_material": "Titanium",
        "colour": "Silver",
        "has_3d_model": False,
        "is_featured": False,
        "images": ["/products/spectacles/specthree.jpg", "/products/spectacles/spectwo.jpg"],
        "variants": [
            ("Frame Only", "OA-SMA-001", 6500, 8),
            ("Single Vision", "OA-SMA-002", 9500, 12),
            ("Bifocal", "OA-SMA-003", 14000, 3),
        ],
    },
    {
        "name": "Retro Round Sunglasses",
        "description": (
            "Stylish round sunglasses with UV400 protection lenses. "
            "A retro-inspired design that suits all face shapes."
        ),
        "category": "sunglasses",
        "brand": "Prada",
        "gender": "women",
        "frame_shape": "Round",
        "frame_material": "Acetate",
        "colour": "Black",
        "has_3d_model": True,
        "is_featured": True,
        "images": ["/products/sunglasses/sunglassone.jpg", "/products/sunglasses/sunglasstwo.jpg"],
        "variants": [
            ("Polarized", "PR-RR-001", 8500, 20),
            ("Gradient", "PR-RR-002", 11000, 7),
        ],
    },
    {
        "name": "Classic Wayfarers",
        "description": (
            "Iconic wayfarer-style sunglasses with durable TR90 frames. "
            "The perfect everyday sunglasses for any outfit."
        ),
        "category": "sunglasses",
        "brand": "RayBan",
        "gender": "unisex",
        "frame_shape": "Square",
        "frame_material": "TR90",
        "colour": "Black",
        "has_3d_model": False,
        "is_featured": False,
        "images": ["/products/sunglasses/sunglassthree.jpg", "/products/sunglasses/sunglasstwo.jpg"],
        "variants": [
            ("UV400", "RB-CW-001", 5500, 25),
            ("Polarized", "RB-CW-002", 9000, 10),
        ],
    },
    {
        "name": "Daily Comfort Lenses",
        "description": (
            "Premium daily disposable contact lenses with high oxygen permeability "
            "for all-day comfort. Suitable for first-time wearers."
        ),
        "category": "contact_lenses",
        "brand": "Local Brand",
        "gender": "unisex",
        "frame_shape": None,
        "frame_material": None,
        "colour": "Clear",
        "has_3d_model": False,
        "is_featured": True,
        "images": ["/products/contact-lenses/lenseone.jpg", "/products/contact-lenses/lenstwo.jpg"],
        "variants": [
            ("Daily (30 pack)", "CL-DC-001", 2500, 50),
            ("Daily (90 pack)", "CL-DC-002", 6500, 30),
        ],
    },
    {
        "name": "Monthly Toric Lenses",
        "description": (
            "Monthly replacement toric contact lenses designed for astigmatism "
            "correction. Outstanding stability and clear vision."
        ),
        "category": "contact_lenses",
        "brand": "Local Brand",
        "gender": "unisex",
        "frame_shape": None,
        "frame_material": None,
        "colour": "Clear",
        "has_3d_model": False,
        "is_featured": False,
        "images": ["/products/contact-lenses/lensthree.jpg", "/products/contact-lenses/lensfour.jpg"],
        "variants": [
            ("Monthly (6 pack)", "CL-MT-001", 4500, 20),
            ("Monthly (12 pack)", "CL-MT-002", 8000, 15),
        ],
    },
]


def seed() -> None:
    db = SessionLocal()
    try:
        for entry in PRODUCTS:
            existing = db.execute(
                select(Product).where(Product.name == entry["name"])
            ).scalar_one_or_none()
            if existing is not None:
                print(f"Skipping existing product: {entry['name']}")
                continue

            product = Product(
                name=entry["name"],
                description=entry["description"],
                category=entry["category"],
                brand=entry["brand"],
                gender=entry["gender"],
                frame_shape=entry["frame_shape"],
                frame_material=entry["frame_material"],
                colour=entry["colour"],
                has_3d_model=entry["has_3d_model"],
                is_featured=entry["is_featured"],
            )
            db.add(product)
            db.flush()

            for order, image_url in enumerate(entry["images"]):
                db.add(
                    ProductImage(
                        product_id=product.id,
                        image_url=image_url,
                        cloudinary_public_id=f"local-seed/{product.id}/{order}",
                        is_primary=(order == 0),
                        display_order=order,
                    )
                )

            for lens_type, sku, price, stock_quantity in entry["variants"]:
                db.add(
                    ProductVariant(
                        product_id=product.id,
                        lens_type=lens_type,
                        sku=sku,
                        price=price,
                        stock_quantity=stock_quantity,
                    )
                )

            print(f"Inserted product: {entry['name']}")

        db.commit()
    finally:
        db.close()


if __name__ == "__main__":
    seed()
