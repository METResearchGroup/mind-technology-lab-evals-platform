"""API endpoints for querying evaluation results."""

import logging

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.eval_results import EvalResult
from app.schemas.result_schemas import EvalResultResponse

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/results", tags=["results"])


@router.get("", response_model=list[EvalResultResponse])
def list_results(
    run_id: str | None = Query(None, description="Filter by run ID"),
    task_id: int | None = Query(None, description="Filter by task ID"),
    model_id: int | None = Query(None, description="Filter by model ID"),
    passed: bool | None = Query(None, description="Filter by passed/failed status"),
    limit: int = Query(100, le=1000, description="Maximum number of results"),
    db: Session = Depends(get_db),
) -> list[EvalResultResponse]:
    """List evaluation results with optional filtering.

    Args:
        run_id: Filter by run ID
        task_id: Filter by task ID
        model_id: Filter by model ID
        passed: Filter by passed/failed status
        limit: Maximum number of results to return
        db: Database session

    Returns:
        List of evaluation results
    """
    query = db.query(EvalResult)

    if run_id:
        query = query.filter(EvalResult.run_id == run_id)

    if task_id:
        query = query.filter(EvalResult.task_id == task_id)

    if model_id:
        query = query.filter(EvalResult.model_id == model_id)

    if passed is not None:
        query = query.filter(EvalResult.passed == passed)

    # Order by most recent first
    query = query.order_by(EvalResult.evaluated_at.desc())

    results = query.limit(limit).all()
    logger.info(f"Listed {len(results)} results")
    return [EvalResultResponse.from_orm(result) for result in results]


@router.get("/{run_id}", response_model=list[EvalResultResponse])
def get_run_results(
    run_id: str,
    db: Session = Depends(get_db),
) -> list[EvalResultResponse]:
    """Get all results for a specific evaluation run.

    Args:
        run_id: Run ID
        db: Database session

    Returns:
        List of results for the run
    """
    results = db.query(EvalResult).filter(EvalResult.run_id == run_id).all()
    logger.info(f"Retrieved {len(results)} results for run {run_id}")
    return [EvalResultResponse.from_orm(result) for result in results]
