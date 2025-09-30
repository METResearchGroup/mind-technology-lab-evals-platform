"""Comprehensive tests for evaluation engine."""

import pytest

from app.models.eval_tasks import EvalTask
from app.services.evaluation_engine import EvaluationEngine


@pytest.fixture
def engine() -> EvaluationEngine:
    """Create an evaluation engine instance."""
    return EvaluationEngine()


def test_evaluate_classification_exact_match_success(engine: EvaluationEngine) -> None:
    """Test classification with exact match success."""
    task = EvalTask(
        id=1,
        name="Test",
        input="What is 2+2?",
        expected_output="4",
        task_type="classification",
        evaluation_method="code",
    )

    result = engine.evaluate(task, "4")

    assert result["passed"] is True
    assert result["score"] == 1.0
    assert result["metrics"]["accuracy"] == 1.0
    assert result["error_category"] is None


def test_evaluate_classification_exact_match_failure(engine: EvaluationEngine) -> None:
    """Test classification with exact match failure."""
    task = EvalTask(
        id=1,
        name="Test",
        input="What is 2+2?",
        expected_output="4",
        task_type="classification",
        evaluation_method="code",
    )

    result = engine.evaluate(task, "5")

    assert result["passed"] is False
    assert result["score"] == 0.0
    assert result["metrics"]["accuracy"] == 0.0
    assert result["error_category"] == "accuracy"


def test_evaluate_classification_case_insensitive(engine: EvaluationEngine) -> None:
    """Test classification is case insensitive."""
    task = EvalTask(
        id=1,
        name="Test",
        input="What is the capital of France?",
        expected_output="Paris",
        task_type="classification",
        evaluation_method="code",
    )

    result = engine.evaluate(task, "PARIS")

    assert result["passed"] is True
    assert result["score"] == 1.0


def test_evaluate_classification_whitespace_trimmed(engine: EvaluationEngine) -> None:
    """Test classification trims whitespace."""
    task = EvalTask(
        id=1,
        name="Test",
        input="What is 2+2?",
        expected_output="4",
        task_type="classification",
        evaluation_method="code",
    )

    result = engine.evaluate(task, "  4  ")

    assert result["passed"] is True
    assert result["score"] == 1.0


def test_evaluate_classification_llm_judge_placeholder(
    engine: EvaluationEngine,
) -> None:
    """Test classification with LLM-as-judge (placeholder)."""
    task = EvalTask(
        id=1,
        name="Test",
        input="Explain this code",
        task_type="classification",
        evaluation_method="llm_judge",
    )

    result = engine.evaluate(task, "This code does X")

    assert result["passed"] is None  # Placeholder
    assert result["score"] == 0.5
    assert result["metrics"]["llm_judge_placeholder"] is True
    assert result["error_category"] is None


def test_evaluate_classification_hybrid_success(engine: EvaluationEngine) -> None:
    """Test hybrid evaluation when code check passes."""
    task = EvalTask(
        id=1,
        name="Test",
        input="What is 2+2?",
        expected_output="4",
        task_type="classification",
        evaluation_method="hybrid",
    )

    result = engine.evaluate(task, "4")

    assert result["passed"] is True
    assert result["score"] == 1.0
    assert result["metrics"]["accuracy"] == 1.0


def test_evaluate_classification_hybrid_fallback(engine: EvaluationEngine) -> None:
    """Test hybrid evaluation falls back to LLM judge on failure."""
    task = EvalTask(
        id=1,
        name="Test",
        input="What is 2+2?",
        expected_output="4",
        task_type="classification",
        evaluation_method="hybrid",
    )

    result = engine.evaluate(task, "5")

    # Falls back to LLM judge placeholder
    assert result["passed"] is None
    assert result["score"] == 0.5
    assert result["metrics"]["hybrid_llm_placeholder"] is True


def test_evaluate_generation_with_content(engine: EvaluationEngine) -> None:
    """Test generation evaluation with content."""
    task = EvalTask(
        id=1,
        name="Test",
        input="Write a poem",
        task_type="generation",
        evaluation_method="llm_judge",
    )

    result = engine.evaluate(task, "Roses are red, violets are blue")

    assert result["passed"] is True
    assert result["score"] == 0.5  # Placeholder score
    assert result["metrics"]["output_length"] > 0
    assert result["metrics"]["has_content"] is True
    assert result["metrics"]["placeholder"] is True
    assert result["error_category"] is None


def test_evaluate_generation_empty_content(engine: EvaluationEngine) -> None:
    """Test generation evaluation with empty content."""
    task = EvalTask(
        id=1,
        name="Test",
        input="Write a poem",
        task_type="generation",
        evaluation_method="llm_judge",
    )

    result = engine.evaluate(task, "")

    assert result["passed"] is False
    assert result["score"] == 0.0
    assert result["metrics"]["output_length"] == 0
    assert result["metrics"]["has_content"] is False
    assert result["error_category"] == "incomplete"


def test_evaluate_invalid_task_type(engine: EvaluationEngine) -> None:
    """Test evaluation with invalid task type."""
    task = EvalTask(
        id=1,
        name="Test",
        input="Test",
        task_type="invalid_type",
        evaluation_method="code",
    )

    with pytest.raises(ValueError, match="Unknown task type"):
        engine.evaluate(task, "output")


def test_evaluate_invalid_evaluation_method(engine: EvaluationEngine) -> None:
    """Test evaluation with invalid method."""
    task = EvalTask(
        id=1,
        name="Test",
        input="Test",
        task_type="classification",
        evaluation_method="invalid_method",
    )

    with pytest.raises(ValueError, match="Unknown evaluation method"):
        engine.evaluate(task, "output")
