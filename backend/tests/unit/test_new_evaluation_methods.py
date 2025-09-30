"""Unit tests for new evaluation methods: contains, json_exact, levenshtein."""

from sqlalchemy.orm import Session

from app.models.eval_tasks import EvalTask
from app.services.evaluation_engine import EvaluationEngine


class TestContainsMethod:
    """Tests for contains evaluation method."""

    def test_contains_pass(self, test_db: Session) -> None:
        """Test contains method with substring present."""
        task = EvalTask(
            name="Contains Test",
            input="What is the capital of Japan?",
            expected_output="Tokyo",
            task_type="classification",
            evaluation_method="contains",
        )
        test_db.add(task)
        test_db.commit()

        engine = EvaluationEngine()
        result = engine.evaluate_classification(task, "The capital of Japan is Tokyo.")

        assert result["passed"] is True
        assert result["score"] == 1.0
        assert result["metrics"]["substring_found"] is True
        assert result["error_category"] is None

    def test_contains_fail(self, test_db: Session) -> None:
        """Test contains method with substring missing."""
        task = EvalTask(
            name="Contains Test",
            input="What is the capital of Japan?",
            expected_output="Tokyo",
            task_type="classification",
            evaluation_method="contains",
        )
        test_db.add(task)
        test_db.commit()

        engine = EvaluationEngine()
        result = engine.evaluate_classification(task, "The capital of Japan is Kyoto.")

        assert result["passed"] is False
        assert result["score"] == 0.0
        assert result["metrics"]["substring_found"] is False
        assert result["error_category"] == "missing_substring"

    def test_contains_case_insensitive(self, test_db: Session) -> None:
        """Test contains method is case-insensitive."""
        task = EvalTask(
            name="Contains Test",
            input="test",
            expected_output="tokyo",
            task_type="classification",
            evaluation_method="contains",
        )
        test_db.add(task)
        test_db.commit()

        engine = EvaluationEngine()
        result = engine.evaluate_classification(task, "TOKYO is the capital")

        assert result["passed"] is True
        assert result["score"] == 1.0


class TestJSONExactMethod:
    """Tests for json_exact evaluation method."""

    def test_json_exact_pass(self, test_db: Session) -> None:
        """Test JSON exact match with identical objects."""
        task = EvalTask(
            name="JSON Test",
            input="Return user info",
            expected_output='{"name": "John", "age": 30}',
            task_type="classification",
            evaluation_method="json_exact",
        )
        test_db.add(task)
        test_db.commit()

        engine = EvaluationEngine()
        result = engine.evaluate_classification(task, '{"name": "John", "age": 30}')

        assert result["passed"] is True
        assert result["score"] == 1.0
        assert result["metrics"]["expected_json"] == {"name": "John", "age": 30}
        assert result["metrics"]["actual_json"] == {"name": "John", "age": 30}
        assert result["error_category"] is None

    def test_json_exact_different_values(self, test_db: Session) -> None:
        """Test JSON exact match fails with different values."""
        task = EvalTask(
            name="JSON Test",
            input="Return user info",
            expected_output='{"name": "John", "age": 30}',
            task_type="classification",
            evaluation_method="json_exact",
        )
        test_db.add(task)
        test_db.commit()

        engine = EvaluationEngine()
        result = engine.evaluate_classification(task, '{"name": "John", "age": 25}')

        assert result["passed"] is False
        assert result["score"] == 0.0
        assert result["error_category"] == "json_mismatch"

    def test_json_exact_formatting_ignored(self, test_db: Session) -> None:
        """Test JSON exact match ignores formatting differences."""
        task = EvalTask(
            name="JSON Test",
            input="Return user info",
            expected_output='{"name":"John","age":30}',
            task_type="classification",
            evaluation_method="json_exact",
        )
        test_db.add(task)
        test_db.commit()

        engine = EvaluationEngine()
        result = engine.evaluate_classification(
            task,
            """{
                "name": "John",
                "age": 30
            }""",
        )

        assert result["passed"] is True
        assert result["score"] == 1.0

    def test_json_exact_parse_error(self, test_db: Session) -> None:
        """Test JSON exact match handles parse errors."""
        task = EvalTask(
            name="JSON Test",
            input="Return JSON",
            expected_output='{"name": "John"}',
            task_type="classification",
            evaluation_method="json_exact",
        )
        test_db.add(task)
        test_db.commit()

        engine = EvaluationEngine()
        result = engine.evaluate_classification(task, "not valid json")

        assert result["passed"] is False
        assert result["score"] == 0.0
        assert result["error_category"] == "json_parse_error"
        assert result["metrics"]["parse_failed"] is True


class TestLevenshteinMethod:
    """Tests for levenshtein evaluation method."""

    def test_levenshtein_exact_match(self, test_db: Session) -> None:
        """Test levenshtein with exact match."""
        task = EvalTask(
            name="Levenshtein Test",
            input="What is 2+2?",
            expected_output="4",
            task_type="classification",
            evaluation_method="levenshtein",
        )
        test_db.add(task)
        test_db.commit()

        engine = EvaluationEngine()
        result = engine.evaluate_classification(task, "4")

        assert result["passed"] is True
        assert result["score"] == 1.0  # Perfect similarity
        assert result["metrics"]["similarity"] == 1.0
        assert result["error_category"] is None

    def test_levenshtein_minor_typo(self, test_db: Session) -> None:
        """Test levenshtein accepts minor typos."""
        task = EvalTask(
            name="Levenshtein Test",
            input="Spell 'hello'",
            expected_output="hello",
            task_type="classification",
            evaluation_method="levenshtein",
        )
        test_db.add(task)
        test_db.commit()

        engine = EvaluationEngine()
        result = engine.evaluate_classification(task, "helo")  # Missing one 'l'

        assert result["passed"] is True  # Should pass with default threshold 0.8
        assert result["score"] > 0.8  # High similarity
        assert result["metrics"]["similarity"] > 0.8

    def test_levenshtein_too_different(self, test_db: Session) -> None:
        """Test levenshtein fails with very different strings."""
        task = EvalTask(
            name="Levenshtein Test",
            input="test",
            expected_output="Tokyo",
            task_type="classification",
            evaluation_method="levenshtein",
        )
        test_db.add(task)
        test_db.commit()

        engine = EvaluationEngine()
        result = engine.evaluate_classification(task, "Paris")

        assert result["passed"] is False
        assert result["score"] < 0.8  # Low similarity
        assert result["error_category"] == "low_similarity"

    def test_levenshtein_similarity_score(self, test_db: Session) -> None:
        """Test levenshtein returns similarity as score."""
        task = EvalTask(
            name="Levenshtein Test",
            input="test",
            expected_output="testing",
            task_type="classification",
            evaluation_method="levenshtein",
        )
        test_db.add(task)
        test_db.commit()

        engine = EvaluationEngine()
        result = engine.evaluate_classification(task, "test")

        # "test" vs "testing" should have decent but not perfect similarity
        assert 0.5 < result["score"] < 1.0
        assert result["metrics"]["similarity"] == result["score"]


class TestLLMFactualityMethod:
    """Tests for llm_factuality evaluation method (placeholder)."""

    def test_llm_factuality_placeholder(self, test_db: Session) -> None:
        """Test LLM factuality returns placeholder result."""
        task = EvalTask(
            name="Factuality Test",
            input="What is the capital of France?",
            expected_output="Paris",
            task_type="classification",
            evaluation_method="llm_factuality",
        )
        test_db.add(task)
        test_db.commit()

        engine = EvaluationEngine()
        result = engine.evaluate_classification(task, "The capital is Paris")

        assert result["passed"] is None  # Placeholder can't determine
        assert result["score"] == 0.5  # Has content
        assert result["metrics"]["placeholder"] is True
        assert result["metrics"]["method"] == "llm_factuality"

    def test_llm_factuality_empty_output(self, test_db: Session) -> None:
        """Test LLM factuality with empty output."""
        task = EvalTask(
            name="Factuality Test",
            input="test",
            expected_output="test",
            task_type="classification",
            evaluation_method="llm_factuality",
        )
        test_db.add(task)
        test_db.commit()

        engine = EvaluationEngine()
        result = engine.evaluate_classification(task, "")

        assert result["passed"] is None
        assert result["score"] == 0.0  # No content
        assert result["error_category"] == "empty_output"
