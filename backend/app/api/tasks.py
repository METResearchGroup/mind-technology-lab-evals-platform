"""API endpoints for evaluation tasks."""

import json
import logging

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.eval_tasks import EvalTask
from app.schemas.task_schemas import TaskCreate, TaskResponse, TaskUpdate
from app.utils.exceptions import TaskNotFoundError

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/tasks", tags=["tasks"])


@router.get("", response_model=list[TaskResponse])
def list_tasks(
    task_type: str | None = Query(None, description="Filter by task type"),
    project: str | None = Query(None, description="Filter by project"),
    tags: str | None = Query(None, description="Filter by tags (comma-separated)"),
    db: Session = Depends(get_db),
) -> list[TaskResponse]:
    """List all evaluation tasks with optional filtering.

    Args:
        task_type: Filter by task type (classification/generation)
        project: Filter by project name
        tags: Filter by tags (comma-separated)
        db: Database session

    Returns:
        List of evaluation tasks
    """
    query = db.query(EvalTask)

    if task_type:
        query = query.filter(EvalTask.task_type == task_type)

    if project:
        query = query.filter(EvalTask.project == project)

    if tags:
        # Filter by tags - check if any of the provided tags exist in the task's tags
        tag_list = [t.strip() for t in tags.split(",")]
        for tag in tag_list:
            query = query.filter(EvalTask.tags.like(f"%{tag}%"))

    tasks = query.all()
    logger.info(f"Listed {len(tasks)} tasks")
    return [TaskResponse.from_orm(task) for task in tasks]


@router.post("", response_model=TaskResponse, status_code=201)
def create_task(
    task_data: TaskCreate,
    db: Session = Depends(get_db),
) -> TaskResponse:
    """Create a new evaluation task.

    Args:
        task_data: Task creation data
        db: Database session

    Returns:
        Created task
    """
    # Convert tags to JSON string (even if empty)
    task_dict = task_data.model_dump()
    if "tags" in task_dict:
        task_dict["tags"] = json.dumps(task_dict["tags"])

    task = EvalTask(**task_dict)
    db.add(task)
    db.commit()
    db.refresh(task)

    logger.info(f"Created task: id={task.id}, name='{task.name}'")
    return TaskResponse.from_orm(task)


@router.get("/{task_id}", response_model=TaskResponse)
def get_task(
    task_id: int,
    db: Session = Depends(get_db),
) -> TaskResponse:
    """Get a specific evaluation task by ID.

    Args:
        task_id: Task ID
        db: Database session

    Returns:
        Task data

    Raises:
        TaskNotFoundError: If task not found
    """
    task = db.query(EvalTask).filter(EvalTask.id == task_id).first()
    if not task:
        raise TaskNotFoundError(f"Task with id {task_id} not found")

    return TaskResponse.from_orm(task)


@router.put("/{task_id}", response_model=TaskResponse)
def update_task(
    task_id: int,
    task_data: TaskUpdate,
    db: Session = Depends(get_db),
) -> TaskResponse:
    """Update an existing evaluation task.

    Args:
        task_id: Task ID
        task_data: Updated task data
        db: Database session

    Returns:
        Updated task

    Raises:
        TaskNotFoundError: If task not found
    """
    task = db.query(EvalTask).filter(EvalTask.id == task_id).first()
    if not task:
        raise TaskNotFoundError(f"Task with id {task_id} not found")

    # Update fields
    update_dict = task_data.model_dump(exclude_unset=True)
    if "tags" in update_dict and update_dict["tags"] is not None:
        update_dict["tags"] = json.dumps(update_dict["tags"])

    for key, value in update_dict.items():
        setattr(task, key, value)

    db.commit()
    db.refresh(task)

    logger.info(f"Updated task: id={task.id}")
    return TaskResponse.from_orm(task)


@router.delete("/{task_id}", status_code=204)
def delete_task(
    task_id: int,
    db: Session = Depends(get_db),
) -> None:
    """Delete an evaluation task.

    Args:
        task_id: Task ID
        db: Database session

    Raises:
        TaskNotFoundError: If task not found
    """
    task = db.query(EvalTask).filter(EvalTask.id == task_id).first()
    if not task:
        raise TaskNotFoundError(f"Task with id {task_id} not found")

    db.delete(task)
    db.commit()

    logger.info(f"Deleted task: id={task_id}")
    return None
