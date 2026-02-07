"""Expense and AuditEntry models."""
from datetime import datetime
from sqlalchemy import String, Float, Text, DateTime, ForeignKey, Enum
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base
import enum


class ExpenseStatus(str, enum.Enum):
    PENDING = "PENDING"
    APPROVED = "APPROVED"
    REJECTED = "REJECTED"
    PAID = "PAID"


class ExpenseCategory(str, enum.Enum):
    TRAVEL = "Travel"
    FOOD = "Food"
    OFFICE = "Office"
    OTHER = "Other"


class Expense(Base):
    """Expense report model."""

    __tablename__ = "expenses"

    id: Mapped[str] = mapped_column(String(50), primary_key=True)
    employee_id: Mapped[str] = mapped_column(String(50), ForeignKey("users.id"), nullable=False, index=True)
    amount: Mapped[float] = mapped_column(Float, nullable=False)
    category: Mapped[ExpenseCategory] = mapped_column(Enum(ExpenseCategory), nullable=False)
    date: Mapped[str] = mapped_column(String(10), nullable=False)  # YYYY-MM-DD
    description: Mapped[str] = mapped_column(Text, nullable=False)
    receipt_path: Mapped[str | None] = mapped_column(String(500), nullable=True)
    receipt_name: Mapped[str | None] = mapped_column(String(255), nullable=True)
    status: Mapped[ExpenseStatus] = mapped_column(Enum(ExpenseStatus), nullable=False, default=ExpenseStatus.PENDING, index=True)
    manager_id: Mapped[str | None] = mapped_column(String(50), ForeignKey("users.id"), nullable=True, index=True)

    submitted_at: Mapped[datetime] = mapped_column(DateTime, nullable=False, default=datetime.utcnow)
    approved_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    rejected_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    paid_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    rejection_comment: Mapped[str | None] = mapped_column(Text, nullable=True)
    approval_comment: Mapped[str | None] = mapped_column(Text, nullable=True)

    employee: Mapped["User"] = relationship("User", back_populates="submitted_expenses", foreign_keys=[employee_id])
    manager: Mapped["User | None"] = relationship("User", back_populates="managed_expenses", foreign_keys=[manager_id])
    audit_entries: Mapped[list["AuditEntry"]] = relationship("AuditEntry", back_populates="expense", order_by="AuditEntry.timestamp")

    def __repr__(self) -> str:
        return f"<Expense {self.id} {self.status.value}>"


class AuditEntry(Base):
    """Audit trail entry for expense status changes."""

    __tablename__ = "audit_entries"

    id: Mapped[str] = mapped_column(String(50), primary_key=True)
    expense_id: Mapped[str] = mapped_column(String(50), ForeignKey("expenses.id", ondelete="CASCADE"), nullable=False, index=True)
    action: Mapped[str] = mapped_column(String(50), nullable=False)
    from_status: Mapped[str | None] = mapped_column(String(20), nullable=True)
    to_status: Mapped[str | None] = mapped_column(String(20), nullable=True)
    performed_by: Mapped[str] = mapped_column(String(50), ForeignKey("users.id"), nullable=False)
    performed_by_name: Mapped[str] = mapped_column(String(255), nullable=False)
    comment: Mapped[str | None] = mapped_column(Text, nullable=True)
    timestamp: Mapped[datetime] = mapped_column(DateTime, nullable=False, default=datetime.utcnow)

    expense: Mapped["Expense"] = relationship("Expense", back_populates="audit_entries")
