"""Expense schemas (matching frontend types)."""
from datetime import datetime
from pydantic import BaseModel, Field, field_validator

EXPENSE_CATEGORIES = ["Travel", "Food", "Office", "Other"]
EXPENSE_STATUSES = ["PENDING", "APPROVED", "REJECTED", "PAID"]


class ExpenseCreate(BaseModel):
    """Schema for creating an expense."""

    amount: float = Field(gt=0, le=10000)
    category: str = Field(..., pattern="^(Travel|Food|Office|Other)$")
    date: str = Field(..., pattern=r"^\d{4}-\d{2}-\d{2}$")
    description: str = Field(..., min_length=10, max_length=500)

    @field_validator("description")
    @classmethod
    def description_not_empty(cls, v: str) -> str:
        if not v or not v.strip():
            raise ValueError("Description is required")
        return v.strip()


class ExpenseUpdate(BaseModel):
    """Schema for approval/rejection update."""

    comment: str | None = None


class RejectRequest(BaseModel):
    """Schema for rejection (comment required)."""

    comment: str = Field(..., min_length=1)


class AuditEntryResponse(BaseModel):
    """Audit trail entry response."""

    id: str
    expenseId: str
    action: str
    fromStatus: str | None = None
    toStatus: str | None = None
    performedBy: str
    performedByName: str
    comment: str | None = None
    timestamp: str

    class Config:
        from_attributes = True


class ExpenseResponse(BaseModel):
    """Expense response (matches frontend Expense type)."""

    id: str
    employeeId: str
    employeeName: str
    department: str
    amount: float
    category: str
    date: str
    description: str
    receiptUrl: str | None = None
    receiptName: str | None = None
    status: str
    managerId: str | None = None
    managerName: str | None = None
    submittedAt: str
    approvedAt: str | None = None
    rejectedAt: str | None = None
    paidAt: str | None = None
    rejectionComment: str | None = None
    approvalComment: str | None = None
    auditTrail: list[AuditEntryResponse]

    class Config:
        from_attributes = True


class ExpenseListResponse(BaseModel):
    """Paginated expense list response."""

    expenses: list[ExpenseResponse]
    total: int
    page: int
    pageSize: int
    totalPages: int


class ExpenseFilters(BaseModel):
    """Query filters for expense list."""

    status: str | None = None  # PENDING, APPROVED, REJECTED, PAID, or ALL
    category: str | None = None
    dateFrom: str | None = None
    dateTo: str | None = None
    employeeId: str | None = None
    search: str | None = None


class PaginationParams(BaseModel):
    """Pagination parameters."""

    page: int = Field(default=1, ge=1)
    pageSize: int = Field(default=10, ge=1, le=100)


class MonthlySummary(BaseModel):
    """Monthly expense summary."""

    month: str
    total: float
    count: int
    categories: dict[str, float]
