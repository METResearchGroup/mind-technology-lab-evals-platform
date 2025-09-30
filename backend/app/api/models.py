"""API endpoints for LLM models."""

import json
import logging

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.models import Model
from app.schemas.model_schemas import ModelCreate, ModelResponse, ModelUpdate
from app.utils.exceptions import ModelNotFoundError

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/models", tags=["models"])


@router.get("", response_model=list[ModelResponse])
def list_models(
    db: Session = Depends(get_db),
) -> list[ModelResponse]:
    """List all LLM models.

    Args:
        db: Database session

    Returns:
        List of models
    """
    models = db.query(Model).all()
    logger.info(f"Listed {len(models)} models")
    return [ModelResponse.from_orm(model) for model in models]


@router.post("", response_model=ModelResponse, status_code=201)
def create_model(
    model_data: ModelCreate,
    db: Session = Depends(get_db),
) -> ModelResponse:
    """Create a new LLM model configuration.

    Args:
        model_data: Model creation data
        db: Database session

    Returns:
        Created model
    """
    # Convert config to JSON string
    model_dict = model_data.model_dump()
    if model_dict.get("config"):
        model_dict["config"] = json.dumps(model_dict["config"])

    model = Model(**model_dict)
    db.add(model)
    db.commit()
    db.refresh(model)

    logger.info(f"Created model: id={model.id}, name='{model.model_name}'")
    return ModelResponse.from_orm(model)


@router.get("/{model_id}", response_model=ModelResponse)
def get_model(
    model_id: int,
    db: Session = Depends(get_db),
) -> ModelResponse:
    """Get a specific LLM model by ID.

    Args:
        model_id: Model ID
        db: Database session

    Returns:
        Model data

    Raises:
        ModelNotFoundError: If model not found
    """
    model = db.query(Model).filter(Model.id == model_id).first()
    if not model:
        raise ModelNotFoundError(f"Model with id {model_id} not found")

    return ModelResponse.from_orm(model)


@router.put("/{model_id}", response_model=ModelResponse)
def update_model(
    model_id: int,
    model_data: ModelUpdate,
    db: Session = Depends(get_db),
) -> ModelResponse:
    """Update an existing LLM model.

    Args:
        model_id: Model ID
        model_data: Updated model data
        db: Database session

    Returns:
        Updated model

    Raises:
        ModelNotFoundError: If model not found
    """
    model = db.query(Model).filter(Model.id == model_id).first()
    if not model:
        raise ModelNotFoundError(f"Model with id {model_id} not found")

    # Update fields
    update_dict = model_data.model_dump(exclude_unset=True)
    if "config" in update_dict and update_dict["config"] is not None:
        update_dict["config"] = json.dumps(update_dict["config"])

    for key, value in update_dict.items():
        setattr(model, key, value)

    db.commit()
    db.refresh(model)

    logger.info(f"Updated model: id={model.id}")
    return ModelResponse.from_orm(model)
