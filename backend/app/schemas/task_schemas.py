"""Pydantic schemas for evaluation tasks."""

from datetime import datetime
from typing import Any, Literal

from pydantic import BaseModel, Field


class TaskBase(BaseModel):
    """Base schema for task data."""

    task_version: str = Field(default="v1.0", description="Task version for reproducibility")
    name: str = Field(..., min_length=1, max_length=255, description="Task name")
    description: str | None = Field(None, description="Task description")
    input: str = Field(..., min_length=1, description="Task input text")
    expected_output: str | None = Field(None, description="Expected output for classification")
    ground_truth: str | None = Field(None, description="Ground truth for generation tasks")
    task_type: Literal["classification", "generation"] = Field(
        ..., description="Type of evaluation task"
    )
    evaluation_method: Literal["code", "llm_judge", "hybrid"] = Field(
        ..., description="Method for evaluation"
    )
    rubric: str | None = Field(None, description="Rubric for LLM-as-judge evaluation")
    tags: list[str] | None = Field(default_factory=list, description="Tags for filtering")
    project: str | None = Field(None, max_length=100, description="Project name")


class TaskCreate(TaskBase):
    """Schema for creating a new task."""

    pass


class TaskUpdate(BaseModel):
    """Schema for updating an existing task."""

    task_version: str | None = None
    name: str | None = Field(None, min_length=1, max_length=255)
    description: str | None = None
    input: str | None = Field(None, min_length=1)
    expected_output: str | None = None
    ground_truth: str | None = None
    task_type: Literal["classification", "generation"] | None = None
    evaluation_method: Literal["code", "llm_judge", "hybrid"] | None = None
    rubric: str | None = None
    tags: list[str] | None = None
    project: str | None = Field(None, max_length=100)


class TaskResponse(BaseModel):
    """Schema for task response."""

    id: int
    task_version: str
    name: str
    description: str | None
    input: str
    expected_output: str | None
    ground_truth: str | None
    task_type: Literal["classification", "generation"]
    evaluation_method: Literal["code", "llm_judge", "hybrid"]
    rubric: str | None
    tags: list[str]
    project: str | None
    created_at: datetime
    updated_at: datetime

    class Config:
        """Pydantic config."""

        from_attributes = True

    @classmethod
    def from_orm(cls, obj: Any) -> "TaskResponse":
        """Convert ORM object to response model, handling JSON fields."""
        import json as json_module

        tags = obj.tags
        if isinstance(tags, str):
            try:
                tags = json_module.loads(tags) if tags else []
            except json_module.JSONDecodeError:
                tags = []

        return cls(
            id=obj.id,
            task_version=obj.task_version,
            name=obj.name,
            description=obj.description,
            input=obj.input,
            expected_output=obj.expected_output,
            ground_truth=obj.ground_truth,
            task_type=obj.task_type,
            evaluation_method=obj.evaluation_method,
            rubric=obj.rubric,
            tags=tags,
            project=obj.project,
            created_at=obj.created_at,
            updated_at=obj.updated_at,
        )
