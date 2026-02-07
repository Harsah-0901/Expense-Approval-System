"""Approval workflow router."""
from fastapi import APIRouter, Query

from app.dependencies import AsyncSessionDep, CurrentUser, RequireManager, RequireAdmin
from app.schemas.expense import ExpenseResponse, ExpenseListResponse, RejectRequest
from app.services import expense_service

router = APIRouter(prefix="/approvals", tags=["Approvals"])


@router.get("/pending", response_model=ExpenseListResponse)
async def list_pending_approvals(
    db: AsyncSessionDep,
    current_user: RequireManager,
    status: str | None = Query("PENDING"),
    category: str | None = Query(None),
    search: str | None = Query(None),
    page: int = Query(1, ge=1),
    pageSize: int = Query(10, ge=1, le=100),
):
    """
    List pending expenses for the current manager.
    Only shows expenses assigned to the manager.
    """
    expenses, total = await expense_service.list_expenses_for_user(
        db,
        current_user,
        status=status,
        category=category,
        search=search,
        page=page,
        page_size=pageSize,
    )
    items = [expense_service.expense_to_response(e) for e in expenses]
    total_pages = (total + pageSize - 1) // pageSize if total > 0 else 1
    return ExpenseListResponse(
        expenses=items,
        total=total,
        page=page,
        pageSize=pageSize,
        totalPages=total_pages,
    )


@router.post("/{expense_id}/approve", response_model=ExpenseResponse)
async def approve_expense(
    db: AsyncSessionDep,
    current_user: RequireManager,
    expense_id: str,
    comment: str | None = None,
):
    """Approve an expense."""
    expense = await expense_service.approve_expense(db, expense_id, current_user, comment=comment)
    return expense_service.expense_to_response(expense)


@router.post("/{expense_id}/reject", response_model=ExpenseResponse)
async def reject_expense(
    db: AsyncSessionDep,
    current_user: RequireManager,
    expense_id: str,
    body: RejectRequest,
):
    """Reject an expense. Comment is required."""
    expense = await expense_service.reject_expense(db, expense_id, current_user, comment=body.comment)
    return expense_service.expense_to_response(expense)


@router.post("/{expense_id}/mark-paid", response_model=ExpenseResponse)
async def mark_expense_paid(
    db: AsyncSessionDep,
    current_user: RequireAdmin,
    expense_id: str,
):
    """Mark an approved expense as paid. Admin only."""
    expense = await expense_service.mark_paid(db, expense_id, current_user)
    return expense_service.expense_to_response(expense)
