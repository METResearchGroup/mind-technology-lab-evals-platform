"""Pydantic schemas for evaluation results."""

from datetime import datetime
from typing import Any

from pydantic import BaseModel, Field


class EvaluationRequest(BaseModel):
    """Schema for requesting an evaluation run."""

    task_ids: list[int] = Field(..., min_length=1, description="List of task IDs to evaluate")
    model_ids: list[int] = Field(..., min_length=1, description="List of model IDs to use")
    name: str | None = Field(None, description="Name for this evaluation run")
    description: str | None = Field(None, description="Description of this run")


class EvalResultResponse(BaseModel):
    """Schema for evaluation result response."""

    id: int
    task_id: int
    model_id: int
    run_id: str
    model_output: str
    passed: bool | None
    score: float | None = Field(None, ge=0.0, le=1.0)
    metrics: dict[str, Any] | None = None
    error_category: str | None = None
    latency_ms: int | None = None
    cost_usd: float | None = None
    evaluated_at: datetime

    class Config:
        """Pydantic config."""

        from_attributes = True

    @classmethod
    def from_orm(cls, obj: Any) -> "EvalResultResponse":
        """Convert ORM object to response model, handling JSON fields."""
        import json as json_module

        metrics = obj.metrics
        if isinstance(metrics, str):
            try:
                metrics = json_module.loads(metrics) if metrics else None
            except json_module.JSONDecodeError:
                metrics = None

        return cls(
            id=obj.id,
            task_id=obj.task_id,
            model_id=obj.model_id,
            run_id=obj.run_id,
            model_output=obj.model_output,
            passed=obj.passed,
            score=obj.score,
            metrics=metrics,
            error_category=obj.error_category,
            latency_ms=obj.latency_ms,
            cost_usd=obj.cost_usd,
            evaluated_at=obj.evaluated_at,
        )


class RunStatusResponse(BaseModel):
    """Schema for evaluation run status response."""

    id: str
    name: str | None
    description: str | None
    task_ids: list[int] | None = None
    model_ids: list[int] | None = None
    status: str
    started_at: datetime
    completed_at: datetime | None
    total_tasks: int | None
    completed_tasks: int
    failed_tasks: int

    class Config:
        """Pydantic config."""

        from_attributes = True

    @classmethod
    def from_orm(cls, obj: Any) -> "RunStatusResponse":
        """Convert ORM object to response model, handling JSON fields."""
        import json as json_module

        task_ids = obj.task_ids
        if isinstance(task_ids, str):
            try:
                task_ids = json_module.loads(task_ids) if task_ids else None
            except json_module.JSONDecodeError:
                task_ids = None

        model_ids = obj.model_ids
        if isinstance(model_ids, str):
            try:
                model_ids = json_module.loads(model_ids) if model_ids else None
            except json_module.JSONDecodeError:
                model_ids = None

        return cls(
            id=obj.id,
            name=obj.name,
            description=obj.description,
            task_ids=task_ids,
            model_ids=model_ids,
            status=obj.status,
            started_at=obj.started_at,
            completed_at=obj.completed_at,
            total_tasks=obj.total_tasks,
            completed_tasks=obj.completed_tasks,
            failed_tasks=obj.failed_tasks,
        )
