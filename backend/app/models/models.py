"""Model (LLM configuration) database model."""

from datetime import datetime

from sqlalchemy import Column, DateTime, Integer, String, Text

from app.database import Base


class Model(Base):
    """LLM model configuration."""

    __tablename__ = "models"

    id = Column(Integer, primary_key=True, autoincrement=True)
    provider = Column(String(50), nullable=False)  # 'openrouter'
    model_name = Column(String(100), nullable=False)  # 'gpt-4', 'claude-3-opus'
    prompt_version = Column(String(50), nullable=False, default="v1.0")
    config = Column(Text, nullable=True)  # JSON: {"temperature": 0.7, "max_tokens": 1000}
    api_key_hash = Column(String(255), nullable=True)  # Hashed API key for security
    created_at = Column(DateTime, default=datetime.utcnow)

    def __repr__(self) -> str:
        """String representation of Model."""
        return f"<Model(id={self.id}, provider='{self.provider}', model='{self.model_name}')>"
