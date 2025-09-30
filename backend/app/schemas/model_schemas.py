"""Pydantic schemas for LLM models."""

from datetime import datetime
from typing import Any

from pydantic import BaseModel, Field


class ModelBase(BaseModel):
    """Base schema for model data."""

    provider: str = Field(..., description="LLM provider (e.g., 'openrouter')")
    model_name: str = Field(..., description="Model name (e.g., 'gpt-4', 'claude-3-opus')")
    prompt_version: str = Field(default="v1.0", description="Prompt version")
    config: dict[str, Any] | None = Field(
        default_factory=dict,
        description="Model configuration (temperature, max_tokens, etc.)",
    )


class ModelCreate(ModelBase):
    """Schema for creating a new model."""

    pass


class ModelUpdate(BaseModel):
    """Schema for updating an existing model."""

    provider: str | None = None
    model_name: str | None = None
    prompt_version: str | None = None
    config: dict[str, Any] | None = None


class ModelResponse(BaseModel):
    """Schema for model response."""

    id: int
    provider: str
    model_name: str
    prompt_version: str
    config: dict[str, Any]
    created_at: datetime

    class Config:
        """Pydantic config."""

        from_attributes = True

    @classmethod
    def from_orm(cls, obj: Any) -> "ModelResponse":
        """Convert ORM object to response model, handling JSON fields."""
        import json as json_module

        config = obj.config
        if isinstance(config, str):
            try:
                config = json_module.loads(config) if config else {}
            except json_module.JSONDecodeError:
                config = {}

        return cls(
            id=obj.id,
            provider=obj.provider,
            model_name=obj.model_name,
            prompt_version=obj.prompt_version,
            config=config,
            created_at=obj.created_at,
        )
