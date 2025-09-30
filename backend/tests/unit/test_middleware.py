"""Tests for middleware error handling."""

import pytest
from fastapi import FastAPI, HTTPException
from fastapi.testclient import TestClient
from sqlalchemy.exc import SQLAlchemyError

from app.middleware.error_handling import ErrorHandlingMiddleware
from app.utils.exceptions import (
    ModelNotFoundError,
    RunNotFoundError,
    TaskNotFoundError,
)


@pytest.fixture
def test_app() -> FastAPI:
    """Create a test FastAPI app with middleware."""
    app = FastAPI()
    app.add_middleware(ErrorHandlingMiddleware)

    @app.get("/test")
    def test_endpoint():
        return {"message": "success"}

    @app.get("/http-error")
    def http_error_endpoint():
        raise HTTPException(status_code=404, detail="Not found")

    @app.get("/task-not-found")
    def task_not_found_endpoint():
        raise TaskNotFoundError(1)

    @app.get("/model-not-found")
    def model_not_found_endpoint():
        raise ModelNotFoundError(1)

    @app.get("/run-not-found")
    def run_not_found_endpoint():
        raise RunNotFoundError("test-run-id")

    @app.get("/sqlalchemy-error")
    def sqlalchemy_error_endpoint():
        raise SQLAlchemyError("Database error")

    @app.get("/generic-error")
    def generic_error_endpoint():
        raise ValueError("Something went wrong")

    return app


def test_middleware_success_response(test_app: FastAPI) -> None:
    """Test middleware allows successful responses."""
    client = TestClient(test_app)
    response = client.get("/test")

    assert response.status_code == 200
    assert response.json() == {"message": "success"}


def test_middleware_http_exception(test_app: FastAPI) -> None:
    """Test middleware handles HTTPException."""
    client = TestClient(test_app)
    response = client.get("/http-error")

    assert response.status_code == 404
    assert "Not found" in response.text


def test_middleware_task_not_found(test_app: FastAPI) -> None:
    """Test middleware handles TaskNotFoundError."""
    client = TestClient(test_app)
    response = client.get("/task-not-found")

    assert response.status_code == 404
    data = response.json()
    assert data["error"] == "task_not_found"
    assert "Task with ID 1 not found" in data["detail"]


def test_middleware_model_not_found(test_app: FastAPI) -> None:
    """Test middleware handles ModelNotFoundError."""
    client = TestClient(test_app)
    response = client.get("/model-not-found")

    assert response.status_code == 404
    data = response.json()
    assert data["error"] == "model_not_found"
    assert "Model with ID 1 not found" in data["detail"]


def test_middleware_run_not_found(test_app: FastAPI) -> None:
    """Test middleware handles RunNotFoundError."""
    client = TestClient(test_app)
    response = client.get("/run-not-found")

    assert response.status_code == 404
    data = response.json()
    assert data["error"] == "run_not_found"
    assert "Run with ID test-run-id not found" in data["detail"]


def test_middleware_sqlalchemy_error(test_app: FastAPI) -> None:
    """Test middleware handles SQLAlchemyError."""
    client = TestClient(test_app)
    response = client.get("/sqlalchemy-error")

    assert response.status_code == 500
    data = response.json()
    assert data["error"] == "internal_error"  # Generic exceptions return internal_error
    assert "Internal server error" in data["detail"]


def test_middleware_generic_exception(test_app: FastAPI) -> None:
    """Test middleware handles generic exceptions."""
    client = TestClient(test_app)
    response = client.get("/generic-error")

    assert response.status_code == 500
    data = response.json()
    assert data["error"] == "internal_error"
    assert "Internal server error" in data["detail"]
