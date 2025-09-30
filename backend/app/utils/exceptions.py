"""Custom exceptions for the application."""


class TaskNotFoundError(Exception):
    """Task not found in database."""

    pass


class ModelNotFoundError(Exception):
    """Model not found in database."""

    pass


class RunNotFoundError(Exception):
    """Evaluation run not found in database."""

    pass


class ValidationError(Exception):
    """Data validation error."""

    pass
