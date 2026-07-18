from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.models.product import Product


def _create_product(
    db_session: Session,
    name: str = "Classic Round Glasses",
    category: str = "spectacles",
) -> Product:
    product = Product(
        name=name,
        description="A great pair of glasses",
        category=category,
        brand="RayVision",
        gender="unisex",
        frame_shape="round",
        frame_material="metal",
        colour="black",
    )
    db_session.add(product)
    db_session.commit()
    db_session.refresh(product)
    return product


def test_get_products_empty(client: TestClient) -> None:
    response = client.get("/api/products/")
    assert response.status_code == 200
    assert response.json() == []


def test_get_products_with_data(client: TestClient, db_session: Session) -> None:
    _create_product(db_session)
    response = client.get("/api/products/")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1
    assert data[0]["name"] == "Classic Round Glasses"


def test_get_products_filter_by_category(client: TestClient, db_session: Session) -> None:
    _create_product(db_session, name="Spectacle Frame", category="spectacles")
    _create_product(db_session, name="Sunny Shades", category="sunglasses")

    response = client.get("/api/products/", params={"category": "spectacles"})
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1
    assert data[0]["category"] == "spectacles"


def test_get_product_by_id(client: TestClient, db_session: Session) -> None:
    product = _create_product(db_session)
    response = client.get(f"/api/products/{product.id}")
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == product.id
    assert data["name"] == product.name


def test_get_product_not_found(client: TestClient) -> None:
    response = client.get("/api/products/99999")
    assert response.status_code == 404
