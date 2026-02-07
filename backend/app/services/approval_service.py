"""Approval workflow service - validates status transitions."""
from app.models.expense import ExpenseStatus

# Valid transitions: from -> [to]
VALID_TRANSITIONS: dict[ExpenseStatus, list[ExpenseStatus]] = {
    ExpenseStatus.PENDING: [ExpenseStatus.APPROVED, ExpenseStatus.REJECTED],
    ExpenseStatus.APPROVED: [ExpenseStatus.PAID],
    ExpenseStatus.REJECTED: [],
    ExpenseStatus.PAID: [],
}


def is_valid_transition(from_status: ExpenseStatus | str, to_status: ExpenseStatus | str) -> bool:
    """Check if the status transition is valid."""
    if isinstance(from_status, str):
        from_status = ExpenseStatus(from_status)
    if isinstance(to_status, str):
        to_status = ExpenseStatus(to_status)
    return to_status in VALID_TRANSITIONS.get(from_status, [])
