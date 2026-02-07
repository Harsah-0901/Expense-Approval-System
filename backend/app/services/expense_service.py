"""Expense CRUD and business logic service."""
from datetime import datetime

from sqlalchemy import select, func, or_, cast, String
from sqlalchemy.orm import joinedload
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.user import User, UserRole
from app.models.expense import Expense, AuditEntry, ExpenseStatus, ExpenseCategory
from app.schemas.expense import ExpenseCreate, ExpenseResponse, AuditEntryResponse, PaginationParams
from app.services.approval_service import is_valid_transition
from app.core.exceptions import NotFoundError, ForbiddenError, InvalidTransitionError


def expense_to_response(expense: Expense) -> ExpenseResponse:
    """Convert Expense model to ExpenseResponse schema."""
    audit_trail = [
        AuditEntryResponse(
            id=a.id,
            expenseId=a.expense_id,
            action=a.action,
            fromStatus=a.from_status,
            toStatus=a.to_status,
            performedBy=a.performed_by,
            performedByName=a.performed_by_name,
            comment=a.comment,
            timestamp=a.timestamp.isoformat() if hasattr(a.timestamp, "isoformat") else str(a.timestamp),
        )
        for a in expense.audit_entries
    ]
    return ExpenseResponse(
        id=expense.id,
        employeeId=expense.employee_id,
        employeeName=expense.employee.name,
        department=expense.employee.department,
        amount=expense.amount,
        category=expense.category.value,
        date=expense.date,
        description=expense.description,
        receiptUrl=f"/api/uploads/{expense.receipt_path}" if expense.receipt_path else None,
        receiptName=expense.receipt_name,
        status=expense.status.value,
        managerId=expense.manager_id,
        managerName=expense.manager.name if expense.manager else None,
        submittedAt=expense.submitted_at.isoformat() if expense.submitted_at else expense.submitted_at,
        approvedAt=expense.approved_at.isoformat() if expense.approved_at else None,
        rejectedAt=expense.rejected_at.isoformat() if expense.rejected_at else None,
        paidAt=expense.paid_at.isoformat() if expense.paid_at else None,
        rejectionComment=expense.rejection_comment,
        approvalComment=expense.approval_comment,
        auditTrail=sorted(audit_trail, key=lambda x: x.timestamp),
    )


async def create_expense(
    db: AsyncSession,
    user: User,
    data: ExpenseCreate,
    receipt_path: str | None = None,
    receipt_name: str | None = None,
) -> Expense:
    """Create a new expense for the current user."""
    if user.role not in (UserRole.EMPLOYEE, UserRole.ADMIN):
        raise ForbiddenError("Only employees can submit expenses")

    # Generate expense ID
    count_result = await db.execute(select(func.count(Expense.id)))
    count = count_result.scalar() or 0
    exp_id = f"EXP-{str(count + 1).zfill(4)}"

    manager_id = user.manager_id if user.role == UserRole.EMPLOYEE else None
    manager = None
    if manager_id:
        m_result = await db.execute(select(User).where(User.id == manager_id))
        manager = m_result.scalar_one_or_none()

    expense = Expense(
        id=exp_id,
        employee_id=user.id,
        amount=data.amount,
        category=ExpenseCategory(data.category),
        date=data.date,
        description=data.description,
        receipt_path=receipt_path,
        receipt_name=receipt_name,
        status=ExpenseStatus.PENDING,
        manager_id=manager_id,
    )

    audit = AuditEntry(
        id=f"aud-{exp_id}-1",
        expense_id=exp_id,
        action="Submitted",
        to_status="PENDING",
        performed_by=user.id,
        performed_by_name=user.name,
        timestamp=datetime.utcnow(),
    )

    db.add(expense)
    db.add(audit)
    await db.flush()
    await db.refresh(expense)
    return expense


async def get_expense_by_id(db: AsyncSession, expense_id: str, user: User) -> Expense:
    """Get expense by ID - enforces role-based access."""
    result = await db.execute(
        select(Expense)
        .where(Expense.id == expense_id)
        .options(
            joinedload(Expense.employee),
            joinedload(Expense.manager),
            joinedload(Expense.audit_entries),
        )
    )
    expense = result.scalar_one_or_none()
    if not expense:
        raise NotFoundError("Expense not found")

    # Role-based access
    if user.role == UserRole.ADMIN:
        pass  # Admin can see all
    elif user.role == UserRole.MANAGER:
        if expense.manager_id != user.id and expense.employee_id != user.id:
            raise ForbiddenError("Access denied - not your team's expense")
    elif user.role == UserRole.EMPLOYEE:
        if expense.employee_id != user.id:
            raise ForbiddenError("Access denied - not your expense")

    return expense


async def list_expenses_for_user(
    db: AsyncSession,
    user: User,
    status: str | None = None,
    category: str | None = None,
    date_from: str | None = None,
    date_to: str | None = None,
    employee_id: str | None = None,
    search: str | None = None,
    page: int = 1,
    page_size: int = 10,
    sort_field: str = "date",
    sort_dir: str = "desc",
) -> tuple[list[Expense], int]:
    """List expenses with filters - role-based access."""
    q = select(Expense)
    q = q.options(
        joinedload(Expense.employee),
        joinedload(Expense.manager),
        joinedload(Expense.audit_entries),
    )

    if user.role == UserRole.ADMIN:
        pass
    elif user.role == UserRole.MANAGER:
        q = q.where(Expense.manager_id == user.id)
    else:
        q = q.where(Expense.employee_id == user.id)

    if status and status != "ALL":
        q = q.where(Expense.status == ExpenseStatus(status))
    if category and category != "ALL":
        q = q.where(Expense.category == ExpenseCategory(category))
    if date_from:
        q = q.where(Expense.date >= date_from)
    if date_to:
        q = q.where(Expense.date <= date_to)
    if employee_id and employee_id != "ALL" and user.role in (UserRole.ADMIN, UserRole.MANAGER):
        q = q.where(Expense.employee_id == employee_id)
    if search:
        search_term = f"%{search.lower()}%"
        q = q.join(User, Expense.employee_id == User.id).where(
            or_(
                Expense.id.ilike(search_term),
                Expense.description.ilike(search_term),
                cast(Expense.category, String).ilike(search_term),
                User.name.ilike(search_term),
            )
        )

    count_q = select(func.count()).select_from(q.subquery())
    total_result = await db.execute(count_q)
    total = total_result.scalar() or 0

    sort_col = getattr(Expense, sort_field, Expense.date)
    if sort_dir == "asc":
        q = q.order_by(sort_col.asc())
    else:
        q = q.order_by(sort_col.desc())

    q = q.offset((page - 1) * page_size).limit(page_size)
    result = await db.execute(q)
    expenses = list(result.scalars().all())
    return expenses, total


async def approve_expense(
    db: AsyncSession,
    expense_id: str,
    user: User,
    comment: str | None = None,
) -> Expense:
    """Approve an expense - manager or admin."""
    expense = await get_expense_by_id(db, expense_id, user)
    if user.role == UserRole.EMPLOYEE:
        raise ForbiddenError("Only managers can approve expenses")

    if not is_valid_transition(expense.status, ExpenseStatus.APPROVED):
        raise InvalidTransitionError(expense.status.value, ExpenseStatus.APPROVED.value)

    if expense.manager_id != user.id and user.role != UserRole.ADMIN:
        raise ForbiddenError("You can only approve expenses for your team")

    now = datetime.utcnow()
    expense.status = ExpenseStatus.APPROVED
    expense.approved_at = now
    expense.approval_comment = comment

    audit = AuditEntry(
        id=f"aud-{expense.id}-{len(expense.audit_entries) + 1}",
        expense_id=expense.id,
        action="Approved",
        from_status="PENDING",
        to_status="APPROVED",
        performed_by=user.id,
        performed_by_name=user.name,
        comment=comment,
        timestamp=now,
    )
    db.add(audit)
    await db.flush()
    await db.refresh(expense)
    return expense


async def reject_expense(
    db: AsyncSession,
    expense_id: str,
    user: User,
    comment: str,
) -> Expense:
    """Reject an expense - manager or admin."""
    expense = await get_expense_by_id(db, expense_id, user)
    if user.role == UserRole.EMPLOYEE:
        raise ForbiddenError("Only managers can reject expenses")

    if not is_valid_transition(expense.status, ExpenseStatus.REJECTED):
        raise InvalidTransitionError(expense.status.value, ExpenseStatus.REJECTED.value)

    if expense.manager_id != user.id and user.role != UserRole.ADMIN:
        raise ForbiddenError("You can only reject expenses for your team")

    now = datetime.utcnow()
    expense.status = ExpenseStatus.REJECTED
    expense.rejected_at = now
    expense.rejection_comment = comment

    audit = AuditEntry(
        id=f"aud-{expense.id}-{len(expense.audit_entries) + 1}",
        expense_id=expense.id,
        action="Rejected",
        from_status="PENDING",
        to_status="REJECTED",
        performed_by=user.id,
        performed_by_name=user.name,
        comment=comment,
        timestamp=now,
    )
    db.add(audit)
    await db.flush()
    await db.refresh(expense)
    return expense


async def mark_paid(db: AsyncSession, expense_id: str, user: User) -> Expense:
    """Mark expense as paid - admin only."""
    expense = await get_expense_by_id(db, expense_id, user)
    if user.role != UserRole.ADMIN:
        raise ForbiddenError("Only admins can mark expenses as paid")

    if not is_valid_transition(expense.status, ExpenseStatus.PAID):
        raise InvalidTransitionError(expense.status.value, ExpenseStatus.PAID.value)

    now = datetime.utcnow()
    expense.status = ExpenseStatus.PAID
    expense.paid_at = now

    audit = AuditEntry(
        id=f"aud-{expense.id}-{len(expense.audit_entries) + 1}",
        expense_id=expense.id,
        action="Paid",
        from_status="APPROVED",
        to_status="PAID",
        performed_by=user.id,
        performed_by_name=user.name,
        timestamp=now,
    )
    db.add(audit)
    await db.flush()
    await db.refresh(expense)
    return expense
