"""Unit tests for evaluation engine."""

import pytest
from sqlalchemy.orm import Session

from app.models.eval_tasks import EvalTask
from app.services.evaluation_engine import EvaluationEngine


def test_evaluate_classification_exact_match_pass(test_db: Session) -> None:
    """Test classification evaluation with exact match (passing)."""
    task = EvalTask(
        name="Test Task",
        input="What is 2+2?",
        expected_output="4",
        task_type="classification",
        evaluation_method="exact_match",
    )
    test_db.add(task)
    test_db.commit()

    engine = EvaluationEngine()
    result = engine.evaluate_classification(task, "4")

    assert result["passed"] is True
    assert result["score"] == 1.0
    assert result["metrics"]["accuracy"] == 1.0
    assert result["error_category"] is None


def test_evaluate_classification_exact_match_fail(test_db: Session) -> None:
    """Test classification evaluation with exact match (failing)."""
    task = EvalTask(
        name="Test Task",
        input="What is 2+2?",
        expected_output="4",
        task_type="classification",
        evaluation_method="exact_match",
    )
    test_db.add(task)
    test_db.commit()

    engine = EvaluationEngine()
    result = engine.evaluate_classification(task, "5")

    assert result["passed"] is False
    assert result["score"] == 0.0
    assert result["error_category"] == "exact_match_mismatch"


def test_evaluate_classification_case_insensitive(test_db: Session) -> None:
    """Test classification evaluation is case-insensitive."""
    task = EvalTask(
        name="Test Task",
        input="What is the capital of France?",
        expected_output="Paris",
        task_type="classification",
        evaluation_method="exact_match",
    )
    test_db.add(task)
    test_db.commit()

    engine = EvaluationEngine()
    result = engine.evaluate_classification(task, "paris")

    assert result["passed"] is True
    assert result["score"] == 1.0


def test_evaluate_classification_whitespace_trimmed(test_db: Session) -> None:
    """Test classification evaluation trims whitespace."""
    task = EvalTask(
        name="Test Task",
        input="What is 2+2?",
        expected_output="4",
        task_type="classification",
        evaluation_method="exact_match",
    )
    test_db.add(task)
    test_db.commit()

    engine = EvaluationEngine()
    result = engine.evaluate_classification(task, "  4  ")

    assert result["passed"] is True
    assert result["score"] == 1.0


def test_evaluate_classification_llm_judge_placeholder(test_db: Session) -> None:
    """Test classification with LLM-as-judge (placeholder implementation)."""
    task = EvalTask(
        name="Test Task",
        input="Explain this code",
        task_type="classification",
        evaluation_method="llm_judge",
    )
    test_db.add(task)
    test_db.commit()

    engine = EvaluationEngine()
    result = engine.evaluate_classification(task, "This code does X")

    assert result["passed"] is None  # Placeholder
    assert result["score"] == 0.5
    assert result["metrics"]["llm_judge_placeholder"] is True
    assert result["error_category"] is None


def test_evaluate_classification_hybrid_code_pass(test_db: Session) -> None:
    """Test hybrid evaluation when code check passes."""
    task = EvalTask(
        name="Test Task",
        input="What is 2+2?",
        expected_output="4",
        task_type="classification",
        evaluation_method="hybrid",
    )
    test_db.add(task)
    test_db.commit()

    engine = EvaluationEngine()
    result = engine.evaluate_classification(task, "4")

    assert result["passed"] is True
    assert result["score"] == 1.0
    assert result["metrics"]["accuracy"] == 1.0
    assert result["metrics"]["hybrid_used"] == "exact_match"


def test_evaluate_classification_hybrid_fallback_to_llm(test_db: Session) -> None:
    """Test hybrid evaluation falls back to LLM judge on code check failure."""
    task = EvalTask(
        name="Test Task",
        input="What is 2+2?",
        expected_output="4",
        task_type="classification",
        evaluation_method="hybrid",
    )
    test_db.add(task)
    test_db.commit()

    engine = EvaluationEngine()
    result = engine.evaluate_classification(task, "5")

    # Falls back to LLM judge placeholder
    assert result["passed"] is None
    assert result["score"] == 0.5
    assert result["metrics"]["hybrid_llm_placeholder"] is True
    assert result["metrics"]["hybrid_used"] == "llm_judge"


def test_evaluate_generation_placeholder(test_db: Session) -> None:
    """Test generation evaluation (placeholder implementation)."""
    task = EvalTask(
        name="Test Task",
        input="Write a haiku about coding",
        ground_truth="N/A",
        task_type="generation",
        evaluation_method="llm_judge",
    )
    test_db.add(task)
    test_db.commit()

    engine = EvaluationEngine()
    result = engine.evaluate_generation(
        task, "Code flows like stream\nBugs hide in shadows deep\nTests bring peace of mind"
    )

    assert "score" in result
    assert "metrics" in result
    assert result["metrics"]["placeholder"] is True
    assert result["passed"] is True  # Has content
    assert result["score"] == 0.5


def test_evaluate_generation_empty_output(test_db: Session) -> None:
    """Test generation evaluation with empty output."""
    task = EvalTask(
        name="Test Task",
        input="Write a haiku",
        task_type="generation",
        evaluation_method="llm_judge",
    )
    test_db.add(task)
    test_db.commit()

    engine = EvaluationEngine()
    result = engine.evaluate_generation(task, "")

    assert result["passed"] is False
    assert result["score"] == 0.0
    assert result["error_category"] == "incomplete"


def test_evaluate_unknown_task_type() -> None:
    """Test evaluation with unknown task type."""
    # Create a mock task with unknown type (bypass database constraints)
    task = EvalTask(
        name="Test Task",
        input="test",
        task_type="classification",  # Valid for DB
        evaluation_method="exact_match",
    )
    # Manually override task_type to test error handling
    task.task_type = "unknown"  # type: ignore

    engine = EvaluationEngine()
    with pytest.raises(ValueError, match="Unknown task type"):
        engine.evaluate(task, "output")


def test_evaluate_unknown_evaluation_method() -> None:
    """Test evaluation with unknown evaluation method."""
    task = EvalTask(
        name="Test Task",
        input="test",
        task_type="classification",
        evaluation_method="exact_match",  # Valid for DB
    )
    # Manually override evaluation_method to test error handling
    task.evaluation_method = "unknown_method"  # type: ignore

    engine = EvaluationEngine()
    with pytest.raises(ValueError, match="Unknown evaluation method"):
        engine.evaluate_classification(task, "output")
