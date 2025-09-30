"""EvalResult database model."""

from datetime import datetime

from sqlalchemy import Boolean, Column, DateTime, Float, ForeignKey, Integer, String, Text

from app.database import Base


class EvalResult(Base):
    """Evaluation result model."""

    __tablename__ = "eval_results"

    id = Column(Integer, primary_key=True, autoincrement=True)
    task_id = Column(Integer, ForeignKey("eval_tasks.id"), nullable=False)
    model_id = Column(Integer, ForeignKey("models.id"), nullable=False)
    run_id = Column(String(100), nullable=False)  # Groups results from same run
    model_output = Column(Text, nullable=False)
    passed = Column(Boolean, nullable=True)
    score = Column(Float, nullable=True)  # 0.0 to 1.0
    metrics = Column(Text, nullable=True)  # JSON: {"accuracy": 0.95, "f1": 0.87}
    error_category = Column(String(100), nullable=True)  # 'hallucination', 'accuracy', etc.
    latency_ms = Column(Integer, nullable=True)
    cost_usd = Column(Float, nullable=True)
    evaluated_at = Column(DateTime, default=datetime.utcnow)

    def __repr__(self) -> str:
        """String representation of EvalResult."""
        return (
            f"<EvalResult(id={self.id}, task_id={self.task_id}, "
            f"model_id={self.model_id}, passed={self.passed})>"
        )
