"""Unit tests for database models."""

import json

from sqlalchemy.orm import Session

from app.models.eval_results import EvalResult
from app.models.eval_runs import EvalRun
from app.models.eval_tasks import EvalTask
from app.models.models import Model


def test_create_eval_task(test_db: Session) -> None:
    """Test creating an evaluation task."""
    expected_result = {
        "name": "Test Task",
        "input": "What is 2+2?",
        "expected_output": "4",
        "task_type": "classification",
        "evaluation_method": "code",
        "tags": json.dumps(["math", "test"]),
    }

    task = EvalTask(
        name=expected_result["name"],
        input=expected_result["input"],
        expected_output=expected_result["expected_output"],
        task_type=expected_result["task_type"],
        evaluation_method=expected_result["evaluation_method"],
        tags=expected_result["tags"],
    )

    test_db.add(task)
    test_db.commit()
    test_db.refresh(task)

    assert task.id is not None
    assert task.name == expected_result["name"]
    assert task.input == expected_result["input"]
    assert task.expected_output == expected_result["expected_output"]
    assert task.task_type == expected_result["task_type"]
    assert task.evaluation_method == expected_result["evaluation_method"]
    assert task.tags == expected_result["tags"]
    assert task.created_at is not None
    assert task.updated_at is not None


def test_create_model(test_db: Session) -> None:
    """Test creating a model configuration."""
    expected_result = {
        "provider": "openrouter",
        "model_name": "gpt-4",
        "prompt_version": "v1.0",
        "config": json.dumps({"temperature": 0.7, "max_tokens": 1000}),
    }

    model = Model(
        provider=expected_result["provider"],
        model_name=expected_result["model_name"],
        prompt_version=expected_result["prompt_version"],
        config=expected_result["config"],
    )

    test_db.add(model)
    test_db.commit()
    test_db.refresh(model)

    assert model.id is not None
    assert model.provider == expected_result["provider"]
    assert model.model_name == expected_result["model_name"]
    assert model.prompt_version == expected_result["prompt_version"]
    assert model.config == expected_result["config"]
    assert model.created_at is not None


def test_create_eval_result(test_db: Session) -> None:
    """Test creating an evaluation result."""
    # Create task and model first
    task = EvalTask(
        name="Test Task",
        input="test",
        task_type="classification",
        evaluation_method="code",
    )
    test_db.add(task)

    model = Model(
        provider="openrouter",
        model_name="gpt-4",
        prompt_version="v1.0",
    )
    test_db.add(model)
    test_db.commit()

    expected_result = {
        "run_id": "test-run-123",
        "model_output": "test output",
        "passed": True,
        "score": 0.95,
        "metrics": json.dumps({"accuracy": 0.95}),
        "latency_ms": 250,
        "cost_usd": 0.001,
    }

    result = EvalResult(
        task_id=task.id,
        model_id=model.id,
        run_id=expected_result["run_id"],
        model_output=expected_result["model_output"],
        passed=expected_result["passed"],
        score=expected_result["score"],
        metrics=expected_result["metrics"],
        latency_ms=expected_result["latency_ms"],
        cost_usd=expected_result["cost_usd"],
    )

    test_db.add(result)
    test_db.commit()
    test_db.refresh(result)

    assert result.id is not None
    assert result.task_id == task.id
    assert result.model_id == model.id
    assert result.run_id == expected_result["run_id"]
    assert result.model_output == expected_result["model_output"]
    assert result.passed == expected_result["passed"]
    assert result.score == expected_result["score"]
    assert result.metrics == expected_result["metrics"]
    assert result.latency_ms == expected_result["latency_ms"]
    assert result.cost_usd == expected_result["cost_usd"]
    assert result.evaluated_at is not None


def test_create_eval_run(test_db: Session) -> None:
    """Test creating an evaluation run."""
    expected_result = {
        "id": "run-123",
        "name": "Test Run",
        "description": "A test evaluation run",
        "task_ids": json.dumps([1, 2, 3]),
        "model_ids": json.dumps([1, 2]),
        "status": "running",
        "total_tasks": 6,
        "completed_tasks": 0,
        "failed_tasks": 0,
    }

    run = EvalRun(
        id=expected_result["id"],
        name=expected_result["name"],
        description=expected_result["description"],
        task_ids=expected_result["task_ids"],
        model_ids=expected_result["model_ids"],
        status=expected_result["status"],
        total_tasks=expected_result["total_tasks"],
        completed_tasks=expected_result["completed_tasks"],
        failed_tasks=expected_result["failed_tasks"],
    )

    test_db.add(run)
    test_db.commit()
    test_db.refresh(run)

    assert run.id == expected_result["id"]
    assert run.name == expected_result["name"]
    assert run.description == expected_result["description"]
    assert run.task_ids == expected_result["task_ids"]
    assert run.model_ids == expected_result["model_ids"]
    assert run.status == expected_result["status"]
    assert run.total_tasks == expected_result["total_tasks"]
    assert run.completed_tasks == expected_result["completed_tasks"]
    assert run.failed_tasks == expected_result["failed_tasks"]
    assert run.started_at is not None
