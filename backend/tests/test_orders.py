from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.models.product import Product, ProductVariant

DELIVERY_DETAILS = {
    "delivery_name": "Test Customer",
    "delivery_address": "123 Main Street",
    "delivery_city": "Colombo",
    "delivery_phone": "0771234567",
}


def _create_variant(db_session: Session) -> ProductVariant:
    product = Product(
        name="Classic Round Glasses",
        category="spectacles",
        brand="RayVision",
    )
    db_session.add(product)
    db_session.flush()

    variant = ProductVariant(
        product_id=product.id,
        lens_type="Frame Only",
        sku="SKU-001",
        price=5000.0,
        stock_quantity=10,
    )
    db_session.add(variant)
    db_session.commit()
    db_session.refresh(variant)
    return variant


def test_create_order_empty_cart(auth_client: TestClient) -> None:
    response = auth_client.post("/api/orders/", data=DELIVERY_DETAILS)
    assert response.status_code == 400
    assert response.json()["detail"] == "Cart is empty"


def test_create_order_success(auth_client: TestClient, db_session: Session) -> None:
    variant = _create_variant(db_session)

    cart_response = auth_client.post(
        "/api/cart/", json={"variant_id": variant.id, "quantity": 1}
    )
    assert cart_response.status_code == 200

    order_response = auth_client.post("/api/orders/", data=DELIVERY_DETAILS)
    assert order_response.status_code == 201
    data = order_response.json()
    assert data["order_reference"].startswith("ETE-")

    cart_after = auth_client.get("/api/cart/")
    assert cart_after.json() == []


def test_get_orders_authenticated(auth_client: TestClient, db_session: Session) -> None:
    variant = _create_variant(db_session)
    auth_client.post("/api/cart/", json={"variant_id": variant.id, "quantity": 1})
    auth_client.post("/api/orders/", data=DELIVERY_DETAILS)

    response = auth_client.get("/api/orders/")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1


def test_get_orders_unauthenticated(client: TestClient) -> None:
    response = client.get("/api/orders/")
    assert response.status_code == 401
