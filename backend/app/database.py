"""Database connection and session management with automatic backup."""

import logging
import shutil
from collections.abc import Generator
from pathlib import Path

from sqlalchemy import create_engine, event
from sqlalchemy.orm import Session, declarative_base, sessionmaker

from app.config import settings

logger = logging.getLogger(__name__)

# Create primary SQLAlchemy engine
engine = create_engine(
    settings.database_url,
    connect_args={"check_same_thread": False} if "sqlite" in settings.database_url else {},
    echo=settings.debug,
)

# Create backup engine (only for SQLite)
backup_engine = None
if "sqlite" in settings.database_url:
    # Extract database path and create backup path
    db_path = settings.database_url.replace("sqlite:///", "")
    backup_path = db_path.replace(".db", "_backup.db")
    backup_url = f"sqlite:///{backup_path}"

    backup_engine = create_engine(
        backup_url,
        connect_args={"check_same_thread": False},
        echo=False,  # Don't echo backup operations
    )
    logger.info(f"Backup database configured: {backup_path}")

# Create session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base class for ORM models
Base = declarative_base()


# Event listener to sync to backup database after commits
if backup_engine is not None:

    @event.listens_for(Session, "after_commit")
    def sync_to_backup(session: Session) -> None:
        """Automatically sync all changes to backup database after commit."""
        try:
            # Get the database file path
            db_path = settings.database_url.replace("sqlite:///", "")
            backup_path = db_path.replace(".db", "_backup.db")

            # Copy database file to backup (atomic operation)
            shutil.copy2(db_path, backup_path)

        except Exception as e:
            logger.error(f"Failed to sync to backup database: {e}")
            # Don't raise - backup failure shouldn't break the main app


def get_db() -> Generator[Session, None, None]:
    """Dependency for getting database sessions.

    Yields:
        Database session that will be automatically closed after use.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db() -> None:
    """Initialize database by creating all tables.

    Also initializes backup database if configured.
    """
    # Initialize primary database
    Base.metadata.create_all(bind=engine)

    # Initialize backup database
    if backup_engine is not None:
        Base.metadata.create_all(bind=backup_engine)

        # Create initial backup by copying primary to backup
        try:
            db_path = settings.database_url.replace("sqlite:///", "")
            backup_path = db_path.replace(".db", "_backup.db")

            if Path(db_path).exists():
                shutil.copy2(db_path, backup_path)
                logger.info(f"Initial backup created: {backup_path}")
        except Exception as e:
            logger.warning(f"Could not create initial backup: {e}")
