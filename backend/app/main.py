"""FastAPI application entry point."""

import logging

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api import evaluations, models, results, tasks
from app.config import settings
from app.database import init_db
from app.middleware.error_handling import ErrorHandlingMiddleware
from app.utils.logging import setup_logging

# Setup logging
setup_logging(level=logging.INFO if not settings.debug else logging.DEBUG)
logger = logging.getLogger(__name__)

# Create FastAPI app
app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
    description="FastAPI backend for LLM evaluation platform",
    docs_url="/docs",
    redoc_url="/redoc",
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Add custom middleware
app.add_middleware(ErrorHandlingMiddleware)

# Include API routers
app.include_router(tasks.router, prefix=settings.api_v1_prefix)
app.include_router(models.router, prefix=settings.api_v1_prefix)
app.include_router(evaluations.router, prefix=settings.api_v1_prefix)
app.include_router(results.router, prefix=settings.api_v1_prefix)


@app.on_event("startup")
def startup_event() -> None:
    """Initialize application on startup."""
    logger.info("Starting up application...")
    # Skip database initialization during testing
    if not settings.debug or settings.database_url != "sqlite:///:memory:":
        init_db()
        logger.info("Database initialized")
    else:
        logger.info("Skipping database initialization (test mode)")


@app.on_event("shutdown")
def shutdown_event() -> None:
    """Cleanup on shutdown."""
    logger.info("Shutting down application...")


@app.get("/")
def root() -> dict:
    """Root endpoint.

    Returns:
        Welcome message
    """
    return {
        "message": "Evals Harness Platform API",
        "version": settings.app_version,
        "docs": "/docs",
    }


@app.get("/health")
def health_check() -> dict:
    """Health check endpoint.

    Returns:
        Health status
    """
    return {"status": "healthy", "version": settings.app_version}
