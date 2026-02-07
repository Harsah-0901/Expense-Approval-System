"""User model."""
from sqlalchemy import String, Enum
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base
import enum


class UserRole(str, enum.Enum):
    EMPLOYEE = "employee"
    MANAGER = "manager"
    ADMIN = "admin"


class User(Base):
    """User model for employees, managers, and admins."""

    __tablename__ = "users"

    id: Mapped[str] = mapped_column(String(50), primary_key=True)
    email: Mapped[str] = mapped_column(String(255), unique=True, nullable=False, index=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    hashed_password: Mapped[str] = mapped_column(String(255), nullable=False)
    role: Mapped[UserRole] = mapped_column(Enum(UserRole), nullable=False, default=UserRole.EMPLOYEE)
    manager_id: Mapped[str | None] = mapped_column(String(50), nullable=True, index=True)
    department: Mapped[str] = mapped_column(String(255), nullable=False)

    # Relationships
    submitted_expenses = relationship("Expense", back_populates="employee", foreign_keys="Expense.employee_id")
    managed_expenses = relationship("Expense", back_populates="manager", foreign_keys="Expense.manager_id")

    def __repr__(self) -> str:
        return f"<User {self.email} ({self.role.value})>"
