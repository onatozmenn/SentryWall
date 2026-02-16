from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_health_endpoint_returns_expected_payload() -> None:
    response = client.get("/health")

    assert response.status_code == 200
    assert response.json() == {"status": "SentryWall Secure Gateway Active"}


def test_cors_preflight_allows_frontend_origin() -> None:
    response = client.options(
        "/health",
        headers={
            "Origin": "http://localhost:3000",
            "Access-Control-Request-Method": "GET",
            "Access-Control-Request-Headers": "content-type",
        },
    )

    assert response.status_code == 200
    assert response.headers["access-control-allow-origin"] == "http://localhost:3000"
    assert "GET" in response.headers.get("access-control-allow-methods", "")
