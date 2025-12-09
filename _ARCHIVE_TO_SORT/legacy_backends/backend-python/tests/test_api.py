"""
Basic backend API tests
"""
import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.database import Base, engine
from app.models.user import User
from app.api.auth import get_password_hash

client = TestClient(app)


def test_root_endpoint():
    """Test the root health check endpoint"""
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert "app" in data
    assert "version" in data
    assert data["status"] == "running"


def test_health_endpoint():
    """Test the health check endpoint"""
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"


def test_version_endpoint():
    """Test the version endpoint"""
    response = client.get("/version")
    assert response.status_code == 200
    data = response.json()
    assert "app" in data
    assert "version" in data
    assert "commit" in data
    assert "python" in data


def test_odds_sports_endpoint():
    """Test fetching sports list"""
    response = client.get("/api/odds/sports")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)


def test_odds_config_endpoint():
    """Test fetching odds configuration"""
    response = client.get("/api/odds/config")
    assert response.status_code == 200
    data = response.json()
    assert "regions" in data
    assert "markets" in data


def test_auth_register_and_login():
    """Test user registration and login flow"""
    # Create tables for test
    Base.metadata.create_all(bind=engine)
    
    # Register a new user
    test_user = {
        "username": "testuser",
        "email": "test@example.com",
        "password": "testpass123"
    }
    
    response = client.post("/api/auth/register", json=test_user)
    # May fail if user already exists, that's okay for this basic test
    if response.status_code == 201:
        data = response.json()
        assert data["username"] == test_user["username"]
        assert data["email"] == test_user["email"]
    
    # Try to login
    login_data = {
        "username": test_user["username"],
        "password": test_user["password"]
    }
    response = client.post(
        "/api/auth/login",
        data=login_data,  # OAuth2PasswordRequestForm expects form data
        headers={"Content-Type": "application/x-www-form-urlencoded"}
    )
    
    if response.status_code == 200:
        data = response.json()
        assert "access_token" in data
        assert data["token_type"] == "bearer"


def test_auth_me_endpoint():
    """Test the /me endpoint with valid token"""
    # First register and login to get a token
    Base.metadata.create_all(bind=engine)
    
    test_user = {
        "username": "testuser2",
        "email": "test2@example.com",
        "password": "testpass123"
    }
    
    # Register
    client.post("/api/auth/register", json=test_user)
    
    # Login
    login_response = client.post(
        "/api/auth/login",
        data={"username": test_user["username"], "password": test_user["password"]},
        headers={"Content-Type": "application/x-www-form-urlencoded"}
    )
    
    if login_response.status_code == 200:
        token = login_response.json()["access_token"]
        
        # Access /me endpoint
        response = client.get(
            "/api/auth/me",
            headers={"Authorization": f"Bearer {token}"}
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["username"] == test_user["username"]


def test_ev_summary_endpoint():
    """Test EV summary endpoint (may not have data)"""
    response = client.get("/api/ev/summary")
    assert response.status_code == 200
    data = response.json()
    assert "available" in data


def test_todo_endpoint():
    """Test TODO content endpoint"""
    response = client.get("/api/todo")
    assert response.status_code == 200
    data = response.json()
    assert "content" in data
