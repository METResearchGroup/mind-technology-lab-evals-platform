"""EvalTask database model."""

from datetime import datetime

from sqlalchemy import CheckConstraint, Column, DateTime, Integer, String, Text

from app.database import Base


class EvalTask(Base):
    """Evaluation task model."""

    __tablename__ = "eval_tasks"

    id = Column(Integer, primary_key=True, autoincrement=True)
    task_version = Column(String(50), nullable=False, default="v1.0")
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    input = Column(Text, nullable=False)
    expected_output = Column(Text, nullable=True)
    ground_truth = Column(Text, nullable=True)
    task_type = Column(
        String(50),
        CheckConstraint("task_type IN ('classification', 'generation')"),
        nullable=False,
    )
    evaluation_method = Column(
        String(50),
        CheckConstraint(
            "evaluation_method IN ('exact_match', 'contains', 'json_exact', 'levenshtein', 'llm_factuality', 'llm_judge', 'hybrid')"
        ),
        nullable=False,
    )
    rubric = Column(Text, nullable=True)  # For LLM-as-judge evaluations
    tags = Column(Text, nullable=True)  # JSON array of tags
    project = Column(String(100), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def __repr__(self) -> str:
        """String representation of EvalTask."""
        return f"<EvalTask(id={self.id}, name='{self.name}', type='{self.task_type}')>"
