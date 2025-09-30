"""EvalRun database model."""

from datetime import datetime

from sqlalchemy import Column, DateTime, Integer, String, Text

from app.database import Base


class EvalRun(Base):
    """Evaluation run model for tracking batch evaluations."""

    __tablename__ = "eval_runs"

    id = Column(String(100), primary_key=True)
    name = Column(String(255), nullable=True)
    description = Column(Text, nullable=True)
    task_ids = Column(Text, nullable=True)  # JSON array of task IDs
    model_ids = Column(Text, nullable=True)  # JSON array of model IDs
    status = Column(String(50), default="running")  # 'running', 'completed', 'failed'
    started_at = Column(DateTime, default=datetime.utcnow)
    completed_at = Column(DateTime, nullable=True)
    total_tasks = Column(Integer, nullable=True)
    completed_tasks = Column(Integer, default=0)
    failed_tasks = Column(Integer, default=0)

    def __repr__(self) -> str:
        """String representation of EvalRun."""
        return f"<EvalRun(id='{self.id}', status='{self.status}', tasks={self.total_tasks})>"
