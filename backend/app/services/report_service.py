"""Reports and analytics service."""
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import joinedload

from app.models.user import User, UserRole
from app.models.expense import Expense, ExpenseStatus, ExpenseCategory


async def get_monthly_summary(
    db: AsyncSession,
    user: User,
    date_from: str | None = None,
    date_to: str | None = None,
    employee_id: str | None = None,
    status: str | None = None,
) -> list[dict]:
    """Get monthly expense summary - respects role permissions."""
    q = select(Expense).options(
        joinedload(Expense.employee),
        joinedload(Expense.manager),
    )

    if user.role == UserRole.ADMIN:
        pass
    elif user.role == UserRole.MANAGER:
        q = q.where(Expense.manager_id == user.id)
    else:
        q = q.where(Expense.employee_id == user.id)

    if date_from:
        q = q.where(Expense.date >= date_from)
    if date_to:
        q = q.where(Expense.date <= date_to)
    if employee_id and employee_id != "ALL" and user.role in (UserRole.ADMIN, UserRole.MANAGER):
        q = q.where(Expense.employee_id == employee_id)
    if status and status != "ALL":
        q = q.where(Expense.status == ExpenseStatus(status))

    result = await db.execute(q)
    expenses = result.scalars().unique().all()

    # Aggregate by month
    months: dict[str, dict] = {}
    for exp in expenses:
        month_key = exp.date[:7] if len(exp.date) >= 7 else exp.date  # YYYY-MM
        if month_key not in months:
            months[month_key] = {
                "month": month_key,
                "total": 0.0,
                "count": 0,
                "categories": {"Travel": 0, "Food": 0, "Office": 0, "Other": 0},
            }
        months[month_key]["total"] += exp.amount
        months[month_key]["count"] += 1
        cat = exp.category.value
        if cat in months[month_key]["categories"]:
            months[month_key]["categories"][cat] += exp.amount

    return sorted(months.values(), key=lambda x: x["month"])


async def get_team_members(db: AsyncSession, manager_id: str) -> list[User]:
    """Get team members (employees) for a manager."""
    result = await db.execute(
        select(User).where(User.manager_id == manager_id, User.role == UserRole.EMPLOYEE)
    )
    return list(result.scalars().all())


async def get_all_employees(db: AsyncSession) -> list[User]:
    """Get all employees - admin only."""
    result = await db.execute(select(User).where(User.role == UserRole.EMPLOYEE))
    return list(result.scalars().all())
