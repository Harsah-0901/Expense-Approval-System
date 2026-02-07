"""Unit tests for approval logic."""
import pytest
from app.models.expense import ExpenseStatus
from app.services.approval_service import is_valid_transition


class TestApprovalTransitions:
    """Test valid and invalid status transitions."""

    def test_pending_to_approved(self):
        assert is_valid_transition(ExpenseStatus.PENDING, ExpenseStatus.APPROVED) is True

    def test_pending_to_rejected(self):
        assert is_valid_transition(ExpenseStatus.PENDING, ExpenseStatus.REJECTED) is True

    def test_pending_to_paid_invalid(self):
        assert is_valid_transition(ExpenseStatus.PENDING, ExpenseStatus.PAID) is False

    def test_approved_to_paid(self):
        assert is_valid_transition(ExpenseStatus.APPROVED, ExpenseStatus.PAID) is True

    def test_approved_to_rejected_invalid(self):
        assert is_valid_transition(ExpenseStatus.APPROVED, ExpenseStatus.REJECTED) is False

    def test_approved_to_pending_invalid(self):
        assert is_valid_transition(ExpenseStatus.APPROVED, ExpenseStatus.PENDING) is False

    def test_rejected_no_transitions(self):
        assert is_valid_transition(ExpenseStatus.REJECTED, ExpenseStatus.APPROVED) is False
        assert is_valid_transition(ExpenseStatus.REJECTED, ExpenseStatus.PENDING) is False
        assert is_valid_transition(ExpenseStatus.REJECTED, ExpenseStatus.PAID) is False

    def test_paid_no_transitions(self):
        assert is_valid_transition(ExpenseStatus.PAID, ExpenseStatus.APPROVED) is False
        assert is_valid_transition(ExpenseStatus.PAID, ExpenseStatus.PENDING) is False
        assert is_valid_transition(ExpenseStatus.PAID, ExpenseStatus.REJECTED) is False

    def test_string_status_values(self):
        """Test that string status values work."""
        assert is_valid_transition("PENDING", "APPROVED") is True
        assert is_valid_transition("APPROVED", "PAID") is True
        assert is_valid_transition("PENDING", "PAID") is False
