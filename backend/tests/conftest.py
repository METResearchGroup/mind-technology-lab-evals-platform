"""Pytest configuration and fixtures."""

import os
from collections.abc import Generator

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker
from sqlalchemy.pool import StaticPool

# Set testing flag before importing app
os.environ["TESTING"] = "true"

from app.database import Base, get_db
from app.main import app

# Create in-memory SQLite database for testing
SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"
engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,  # Use StaticPool to share connection across threads
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


@pytest.fixture(scope="function")
def test_db() -> Generator[Session, None, None]:
    """Create a fresh database for each test.

    Yields:
        Database session
    """
    # Create all tables
    Base.metadata.create_all(bind=engine)
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()
        # Drop all tables after test
        Base.metadata.drop_all(bind=engine)


@pytest.fixture(scope="function")
def client(test_db: Session) -> Generator[TestClient, None, None]:
    """Create a test client with a test database.

    Args:
        test_db: Test database session

    Yields:
        FastAPI test client
    """

    def override_get_db() -> Generator[Session, None, None]:
        try:
            yield test_db
        finally:
            pass

    app.dependency_overrides[get_db] = override_get_db

    # Create tables before client is used
    Base.metadata.create_all(bind=engine)

    with TestClient(app) as test_client:
        yield test_client

    app.dependency_overrides.clear()
