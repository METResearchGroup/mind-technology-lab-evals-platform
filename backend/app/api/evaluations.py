"""API endpoints for running evaluations."""

import json
import logging
import time
import uuid
from datetime import datetime

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.eval_results import EvalResult
from app.models.eval_runs import EvalRun
from app.models.eval_tasks import EvalTask
from app.models.models import Model
from app.schemas.result_schemas import EvaluationRequest, RunStatusResponse
from app.services.evaluation_engine import EvaluationEngine
from app.services.openrouter_client import OpenRouterClient
from app.utils.exceptions import ModelNotFoundError, RunNotFoundError, TaskNotFoundError

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/evaluate", tags=["evaluations"])


@router.post("", response_model=RunStatusResponse, status_code=202)
def run_evaluation(
    request: EvaluationRequest,
    db: Session = Depends(get_db),
) -> RunStatusResponse:
    """Run evaluation on specified tasks with specified models.

    Args:
        request: Evaluation request with task_ids and model_ids
        db: Database session

    Returns:
        Evaluation run status

    Raises:
        TaskNotFoundError: If any task not found
        ModelNotFoundError: If any model not found
    """
    # Validate tasks and models exist
    tasks = db.query(EvalTask).filter(EvalTask.id.in_(request.task_ids)).all()
    if len(tasks) != len(request.task_ids):
        raise TaskNotFoundError("One or more tasks not found")

    models = db.query(Model).filter(Model.id.in_(request.model_ids)).all()
    if len(models) != len(request.model_ids):
        raise ModelNotFoundError("One or more models not found")

    # Create evaluation run
    run_id = str(uuid.uuid4())
    eval_run = EvalRun(
        id=run_id,
        name=request.name,
        description=request.description,
        task_ids=json.dumps(request.task_ids),
        model_ids=json.dumps(request.model_ids),
        status="running",
        total_tasks=len(request.task_ids) * len(request.model_ids),
        completed_tasks=0,
        failed_tasks=0,
    )
    db.add(eval_run)
    db.commit()

    logger.info(f"Starting evaluation run: {run_id}, tasks={len(tasks)}, models={len(models)}")

    # Run evaluations
    openrouter_client = OpenRouterClient()
    eval_engine = EvaluationEngine()

    completed = 0
    failed = 0

    for task in tasks:
        for model in models:
            try:
                # Get model config
                config = json.loads(model.config) if model.config else {}  # type: ignore

                # Call OpenRouter API
                start_time = time.time()
                response = openrouter_client.generate(
                    prompt=task.input,  # type: ignore
                    model=model.model_name,  # type: ignore
                    config=config,
                )
                latency_ms = int((time.time() - start_time) * 1000)

                # Evaluate response
                eval_result = eval_engine.evaluate(task, response["content"])

                # Save result
                result = EvalResult(
                    task_id=task.id,
                    model_id=model.id,
                    run_id=run_id,
                    model_output=response["content"],
                    passed=eval_result["passed"],
                    score=eval_result["score"],
                    metrics=json.dumps(eval_result["metrics"]),
                    error_category=eval_result.get("error_category"),
                    latency_ms=latency_ms,
                    cost_usd=response["cost_usd"],
                )
                db.add(result)
                completed += 1

                logger.info(
                    f"Completed eval: task={task.id}, model={model.id}, "
                    f"passed={result.passed}, score={result.score}"
                )

            except Exception as e:
                logger.error(f"Failed eval: task={task.id}, model={model.id}, error={e}")
                failed += 1

    # Update run status
    eval_run.completed_tasks = completed  # type: ignore
    eval_run.failed_tasks = failed  # type: ignore
    eval_run.status = "completed" if failed == 0 else "failed"  # type: ignore
    eval_run.completed_at = datetime.utcnow()  # type: ignore
    db.commit()
    db.refresh(eval_run)

    logger.info(f"Evaluation run {run_id} completed: " f"success={completed}, failed={failed}")

    return RunStatusResponse.from_orm(eval_run)


@router.get("/runs", response_model=list[RunStatusResponse])
def list_runs(
    limit: int = Query(100, le=1000, description="Maximum number of runs to return"),
    db: Session = Depends(get_db),
) -> list[RunStatusResponse]:
    """List all evaluation runs, ordered by most recent first.

    Args:
        limit: Maximum number of runs to return (default 100, max 1000)
        db: Database session

    Returns:
        List of evaluation runs ordered by started_at descending
    """
    runs = db.query(EvalRun).order_by(EvalRun.started_at.desc()).limit(limit).all()
    logger.info(f"Listed {len(runs)} evaluation runs")
    return [RunStatusResponse.from_orm(run) for run in runs]


@router.get("/{run_id}", response_model=RunStatusResponse)
def get_run_status(
    run_id: str,
    db: Session = Depends(get_db),
) -> RunStatusResponse:
    """Get status of an evaluation run.

    Args:
        run_id: Run ID
        db: Database session

    Returns:
        Run status

    Raises:
        RunNotFoundError: If run not found
    """
    run = db.query(EvalRun).filter(EvalRun.id == run_id).first()
    if not run:
        raise RunNotFoundError(f"Run with id {run_id} not found")

    return RunStatusResponse.from_orm(run)
