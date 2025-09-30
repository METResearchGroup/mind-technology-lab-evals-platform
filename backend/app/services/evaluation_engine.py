"""Evaluation engine for classification and generation tasks."""

import difflib
import json
import logging
from typing import Any

from app.models.eval_tasks import EvalTask

logger = logging.getLogger(__name__)


class EvaluationEngine:
    """Engine for evaluating model outputs against tasks.

    Supports multiple evaluation methods:
    - exact_match: Exact string comparison (case-insensitive, whitespace trimmed)
    - contains: Substring check (case-insensitive)
    - json_exact: JSON deep equality check
    - levenshtein: Fuzzy string matching using edit distance
    - llm_factuality: LLM-based factual correctness (placeholder)
    - llm_judge: LLM-based quality evaluation (placeholder)
    - hybrid: Code check first, LLM fallback
    """

    def evaluate(
        self,
        task: EvalTask,
        model_output: str,
    ) -> dict[str, Any]:
        """Evaluate model output for a given task.

        Args:
            task: EvalTask to evaluate against
            model_output: Output from the model

        Returns:
            Dictionary with evaluation results (passed, score, metrics)
        """
        if task.task_type == "classification":
            return self.evaluate_classification(task, model_output)
        elif task.task_type == "generation":
            return self.evaluate_generation(task, model_output)
        else:
            raise ValueError(f"Unknown task type: {task.task_type}")

    def evaluate_classification(
        self,
        task: EvalTask,
        model_output: str,
    ) -> dict[str, Any]:
        """Evaluate classification task.

        Args:
            task: Classification task
            model_output: Model's output

        Returns:
            Evaluation results with passed/failed, score, and metrics
        """
        if task.evaluation_method == "exact_match":
            return self._evaluate_exact_match(task, model_output)

        elif task.evaluation_method == "contains":
            return self._evaluate_contains(task, model_output)

        elif task.evaluation_method == "json_exact":
            return self._evaluate_json_exact(task, model_output)

        elif task.evaluation_method == "levenshtein":
            return self._evaluate_levenshtein(task, model_output)

        elif task.evaluation_method == "llm_factuality":
            return self._evaluate_llm_factuality(task, model_output)

        elif task.evaluation_method == "llm_judge":
            # Placeholder for LLM-as-judge (implemented in ticket 5)
            logger.warning(
                f"LLM-as-judge not yet implemented for task {task.id}, "
                "using placeholder evaluation"
            )
            return {
                "passed": None,
                "score": 0.5,
                "metrics": {"llm_judge_placeholder": True},
                "error_category": None,
            }

        elif task.evaluation_method == "hybrid":
            # Try exact match first, fall back to LLM judge if needed
            # Temporarily use exact_match for code check
            expected = (task.expected_output or "").strip().lower()
            actual = model_output.strip().lower()
            passed = expected == actual

            if passed:
                # Code check passed
                return {
                    "passed": True,
                    "score": 1.0,
                    "metrics": {"accuracy": 1.0, "hybrid_used": "exact_match"},
                    "error_category": None,
                }
            else:
                # Placeholder for LLM judge fallback
                logger.warning(f"Hybrid eval falling back to LLM judge for task {task.id}")
                return {
                    "passed": None,
                    "score": 0.5,
                    "metrics": {"hybrid_llm_placeholder": True, "hybrid_used": "llm_judge"},
                    "error_category": None,
                }

        else:
            raise ValueError(f"Unknown evaluation method: {task.evaluation_method}")

    def _evaluate_exact_match(self, task: EvalTask, model_output: str) -> dict[str, Any]:
        """Exact string match (case-insensitive, whitespace trimmed)."""
        expected = (task.expected_output or "").strip().lower()
        actual = model_output.strip().lower()
        passed = expected == actual
        score = 1.0 if passed else 0.0

        logger.info(
            f"Exact match eval: task={task.id}, passed={passed}, "
            f"expected='{expected}', actual='{actual}'"
        )

        return {
            "passed": passed,
            "score": score,
            "metrics": {"accuracy": score, "method": "exact_match"},
            "error_category": None if passed else "exact_match_mismatch",
        }

    def _evaluate_contains(self, task: EvalTask, model_output: str) -> dict[str, Any]:
        """Substring check (case-insensitive)."""
        expected = (task.expected_output or "").strip().lower()
        actual = model_output.strip().lower()
        passed = expected in actual
        score = 1.0 if passed else 0.0

        logger.info(
            f"Contains eval: task={task.id}, passed={passed}, "
            f"expected='{expected}' in actual='{actual}'"
        )

        return {
            "passed": passed,
            "score": score,
            "metrics": {
                "method": "contains",
                "substring_found": passed,
                "expected_length": len(expected),
                "actual_length": len(actual),
            },
            "error_category": None if passed else "missing_substring",
        }

    def _evaluate_json_exact(self, task: EvalTask, model_output: str) -> dict[str, Any]:
        """JSON deep equality check."""
        try:
            expected_json = json.loads(task.expected_output or "{}")
            actual_json = json.loads(model_output)
            passed = expected_json == actual_json
            score = 1.0 if passed else 0.0

            logger.info(f"JSON exact eval: task={task.id}, passed={passed}")

            return {
                "passed": passed,
                "score": score,
                "metrics": {
                    "method": "json_exact",
                    "expected_json": expected_json,
                    "actual_json": actual_json,
                },
                "error_category": None if passed else "json_mismatch",
            }
        except json.JSONDecodeError as e:
            logger.error(
                f"JSON parse error in task {task.id}: {e}, "
                f"expected='{task.expected_output}', actual='{model_output}'"
            )
            return {
                "passed": False,
                "score": 0.0,
                "metrics": {
                    "method": "json_exact",
                    "error": str(e),
                    "parse_failed": True,
                },
                "error_category": "json_parse_error",
            }

    def _evaluate_levenshtein(
        self, task: EvalTask, model_output: str, threshold: float = 0.8
    ) -> dict[str, Any]:
        """Fuzzy string matching using edit distance.

        Args:
            task: Task with expected output
            model_output: Actual model output
            threshold: Minimum similarity ratio to pass (0-1)

        Returns:
            Evaluation results with similarity score
        """
        expected = (task.expected_output or "").strip()
        actual = model_output.strip()

        # Calculate similarity ratio using SequenceMatcher
        similarity = difflib.SequenceMatcher(None, expected, actual).ratio()
        passed = similarity >= threshold

        logger.info(
            f"Levenshtein eval: task={task.id}, similarity={similarity:.3f}, "
            f"threshold={threshold}, passed={passed}"
        )

        return {
            "passed": passed,
            "score": similarity,  # Score is the similarity ratio itself
            "metrics": {
                "method": "levenshtein",
                "similarity": similarity,
                "threshold": threshold,
                "expected_length": len(expected),
                "actual_length": len(actual),
            },
            "error_category": None if passed else "low_similarity",
        }

    def _evaluate_llm_factuality(self, task: EvalTask, model_output: str) -> dict[str, Any]:
        """LLM-based factuality check (placeholder implementation).

        This will be fully implemented in ticket 5 with actual LLM calls.
        For now, returns a placeholder score.
        """
        logger.warning(
            f"LLM factuality check not yet implemented for task {task.id}, "
            "using placeholder evaluation"
        )

        # Placeholder: check if output has content and is not empty
        has_content = len(model_output.strip()) > 0

        return {
            "passed": None,  # Can't determine without real LLM
            "score": 0.5 if has_content else 0.0,
            "metrics": {
                "method": "llm_factuality",
                "placeholder": True,
                "output_length": len(model_output),
            },
            "error_category": None if has_content else "empty_output",
        }

    def evaluate_generation(
        self,
        task: EvalTask,
        model_output: str,
    ) -> dict[str, Any]:
        """Evaluate generation task.

        Args:
            task: Generation task
            model_output: Model's output

        Returns:
            Evaluation results (placeholder for now, full implementation in ticket 5)
        """
        logger.info(
            f"Generation eval for task {task.id}: "
            "Full implementation pending (ticket 5: hallucination detection)"
        )

        # Placeholder evaluation - basic length and presence checks
        output_length = len(model_output)
        has_content = output_length > 0

        # Very basic scoring (to be replaced with proper hallucination detection)
        score = 0.5 if has_content else 0.0

        return {
            "passed": has_content,
            "score": score,
            "metrics": {
                "output_length": output_length,
                "has_content": has_content,
                "placeholder": True,  # Flag this as placeholder implementation
            },
            "error_category": None if has_content else "incomplete",
        }
