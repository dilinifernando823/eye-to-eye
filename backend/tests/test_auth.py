from fastapi.testclient import TestClient

from app.models.user import User


def test_register_success(client: TestClient) -> None:
    response = client.post(
        "/api/auth/register",
        json={
            "email": "newuser@example.com",
            "full_name": "New User",
            "password": "password123",
        },
    )
    assert response.status_code == 200
    data = response.json()
    assert data["email"] == "newuser@example.com"
    assert "password" not in data
    assert "hashed_password" not in data


def test_register_duplicate_email(client: TestClient) -> None:
    payload = {
        "email": "duplicate@example.com",
        "full_name": "Duplicate User",
        "password": "password123",
    }
    first_response = client.post("/api/auth/register", json=payload)
    assert first_response.status_code == 200

    second_response = client.post("/api/auth/register", json=payload)
    assert second_response.status_code == 400


def test_login_success(client: TestClient, test_user: User) -> None:
    response = client.post(
        "/api/auth/login",
        json={"email": test_user.email, "password": "password123"},
    )
    assert response.status_code == 200
    assert "access_token" in response.cookies


def test_login_wrong_password(client: TestClient, test_user: User) -> None:
    response = client.post(
        "/api/auth/login",
        json={"email": test_user.email, "password": "wrongpassword"},
    )
    assert response.status_code == 401


def test_get_me_authenticated(auth_client: TestClient, test_user: User) -> None:
    response = auth_client.get("/api/auth/me")
    assert response.status_code == 200
    data = response.json()
    assert data["email"] == test_user.email


def test_get_me_unauthenticated(client: TestClient) -> None:
    response = client.get("/api/auth/me")
    assert response.status_code == 401


def test_logout(auth_client: TestClient) -> None:
    response = auth_client.post("/api/auth/logout")
    assert response.status_code == 200
    assert response.json() == {"message": "Logged out successfully"}

    me_response = auth_client.get("/api/auth/me")
    assert me_response.status_code == 401
