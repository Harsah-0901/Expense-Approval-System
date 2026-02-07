"""Seed database with demo users and sample expenses."""
import asyncio
import sys
import os

# Add parent to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy import select
from app.database import async_session_factory, init_db
from app.models.user import User, UserRole
from app.models.expense import Expense, AuditEntry, ExpenseStatus, ExpenseCategory
from app.core.security import get_password_hash


SEED_USERS = [
    {
        "id": "emp-001",
        "email": "alice@company.com",
        "name": "Alice Johnson",
        "role": UserRole.EMPLOYEE,
        "manager_id": "mgr-001",
        "department": "Engineering",
    },
    {
        "id": "emp-002",
        "email": "bob@company.com",
        "name": "Bob Williams",
        "role": UserRole.EMPLOYEE,
        "manager_id": "mgr-001",
        "department": "Engineering",
    },
    {
        "id": "emp-003",
        "email": "carol@company.com",
        "name": "Carol Davis",
        "role": UserRole.EMPLOYEE,
        "manager_id": "mgr-002",
        "department": "Marketing",
    },
    {
        "id": "emp-004",
        "email": "david@company.com",
        "name": "David Lee",
        "role": UserRole.EMPLOYEE,
        "manager_id": "mgr-002",
        "department": "Marketing",
    },
    {
        "id": "emp-005",
        "email": "emma@company.com",
        "name": "Emma Wilson",
        "role": UserRole.EMPLOYEE,
        "manager_id": "mgr-001",
        "department": "Engineering",
    },
    {
        "id": "mgr-001",
        "email": "frank@company.com",
        "name": "Frank Martinez",
        "role": UserRole.MANAGER,
        "manager_id": None,
        "department": "Engineering",
    },
    {
        "id": "mgr-002",
        "email": "grace@company.com",
        "name": "Grace Chen",
        "role": UserRole.MANAGER,
        "manager_id": None,
        "department": "Marketing",
    },
    {
        "id": "adm-001",
        "email": "admin@company.com",
        "name": "Henry Admin",
        "role": UserRole.ADMIN,
        "manager_id": None,
        "department": "Operations",
    },
]

# Default password for all seed users (demo)
DEFAULT_PASSWORD = "demo"


async def seed():
    """Run seed."""
    await init_db()

    async with async_session_factory() as db:
        # Check if users exist
        result = await db.execute(select(User).limit(1))
        existing = result.scalar_one_or_none()
        if existing:
            print("Database already seeded. Skipping.")
            return

        hashed = get_password_hash(DEFAULT_PASSWORD)
        for u in SEED_USERS:
            usr = User(
                id=u["id"],
                email=u["email"],
                name=u["name"],
                hashed_password=hashed,
                role=u["role"],
                manager_id=u["manager_id"],
                department=u["department"],
            )
            db.add(usr)

        await db.flush()
        await db.commit()
        print(f"Seeded {len(SEED_USERS)} users. Password for all: {DEFAULT_PASSWORD}")

        # Add sample expenses
        from datetime import datetime, timedelta
        import random

        categories = list(ExpenseCategory)
        employees = [u for u in SEED_USERS if u["role"] == UserRole.EMPLOYEE]
        expense_id = 1

        for emp in employees:
            manager = next((u for u in SEED_USERS if u["id"] == emp["manager_id"]), None)
            manager_name = manager["name"] if manager else None

            for _ in range(random.randint(2, 5)):
                exp_id = f"EXP-{str(expense_id).zfill(4)}"
                days_ago = random.randint(1, 60)
                exp_date = datetime.utcnow() - timedelta(days=days_ago)
                amount = round(random.uniform(25, 500), 2)
                category = random.choice(categories)

                status = ExpenseStatus.PENDING
                if days_ago > 30:
                    r = random.random()
                    if r < 0.4:
                        status = ExpenseStatus.APPROVED
                    elif r < 0.6:
                        status = ExpenseStatus.REJECTED

                expense = Expense(
                    id=exp_id,
                    employee_id=emp["id"],
                    amount=amount,
                    category=category,
                    date=exp_date.strftime("%Y-%m-%d"),
                    description=f"Sample expense for {category.value}",
                    status=status,
                    manager_id=emp["manager_id"],
                    submitted_at=exp_date,
                )
                db.add(expense)

                audit = AuditEntry(
                    id=f"aud-{exp_id}-1",
                    expense_id=exp_id,
                    action="Submitted",
                    to_status="PENDING",
                    performed_by=emp["id"],
                    performed_by_name=emp["name"],
                    timestamp=exp_date,
                )
                db.add(audit)

                if status == ExpenseStatus.APPROVED:
                    expense.approved_at = exp_date + timedelta(hours=2)
                    expense.approval_comment = "Approved"
                    audit2 = AuditEntry(
                        id=f"aud-{exp_id}-2",
                        expense_id=exp_id,
                        action="Approved",
                        from_status="PENDING",
                        to_status="APPROVED",
                        performed_by=emp["manager_id"],
                        performed_by_name=manager_name or "Manager",
                        timestamp=expense.approved_at,
                    )
                    db.add(audit2)
                elif status == ExpenseStatus.REJECTED:
                    expense.rejected_at = exp_date + timedelta(hours=2)
                    expense.rejection_comment = "Please provide additional documentation."
                    audit2 = AuditEntry(
                        id=f"aud-{exp_id}-2",
                        expense_id=exp_id,
                        action="Rejected",
                        from_status="PENDING",
                        to_status="REJECTED",
                        performed_by=emp["manager_id"],
                        performed_by_name=manager_name or "Manager",
                        comment=expense.rejection_comment,
                        timestamp=expense.rejected_at,
                    )
                    db.add(audit2)

                expense_id += 1

        await db.commit()
        print(f"Seeded {expense_id - 1} sample expenses.")


if __name__ == "__main__":
    asyncio.run(seed())
