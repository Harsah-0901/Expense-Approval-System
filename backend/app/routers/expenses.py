"""Expense management router."""
from fastapi import APIRouter, Query, UploadFile, File, Form
from typing import Annotated
import os
import uuid

from app.dependencies import AsyncSessionDep
from app.dependencies import CurrentUser
from app.schemas.expense import (
    ExpenseCreate,
    ExpenseResponse,
    ExpenseListResponse,
)
from app.services import expense_service
from app.config import get_settings

router = APIRouter(prefix="/expenses", tags=["Expenses"])


@router.post("", response_model=ExpenseResponse)
async def create_expense(
    db: AsyncSessionDep,
    current_user: CurrentUser,
    amount: Annotated[float, Form()],
    category: Annotated[str, Form()],
    date: Annotated[str, Form()],
    description: Annotated[str, Form()],
    receipt: UploadFile | None = File(None),
):
    """
    Submit a new expense.
    Accepts multipart/form-data for optional receipt upload.
    """
    data = ExpenseCreate(amount=amount, category=category, date=date, description=description)
    receipt_path = None
    receipt_name = None

    if receipt and receipt.filename:
        settings = get_settings()
        ext = os.path.splitext(receipt.filename)[1].lower()
        if ext not in settings.ALLOWED_EXTENSIONS:
            from app.core.exceptions import BadRequestError
            raise BadRequestError(f"Invalid file type. Allowed: {settings.ALLOWED_EXTENSIONS}")
        os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
        filename = f"{uuid.uuid4()}{ext}"
        filepath = os.path.join(settings.UPLOAD_DIR, filename)
        content = await receipt.read()
        if len(content) > settings.MAX_UPLOAD_SIZE_MB * 1024 * 1024:
            from app.core.exceptions import BadRequestError
            raise BadRequestError(f"File too large. Max {settings.MAX_UPLOAD_SIZE_MB}MB")
        with open(filepath, "wb") as f:
            f.write(content)
        receipt_path = filename
        receipt_name = receipt.filename

    expense = await expense_service.create_expense(
        db, current_user, data, receipt_path=receipt_path, receipt_name=receipt_name
    )
    return expense_service.expense_to_response(expense)


@router.post("/json", response_model=ExpenseResponse)
async def create_expense_json(
    db: AsyncSessionDep,
    current_user: CurrentUser,
    data: ExpenseCreate,
):
    """Submit expense (JSON body, no file upload)."""
    expense = await expense_service.create_expense(db, current_user, data)
    return expense_service.expense_to_response(expense)


@router.get("", response_model=ExpenseListResponse)
async def list_expenses(
    db: AsyncSessionDep,
    current_user: CurrentUser,
    status: str | None = Query(None),
    category: str | None = Query(None),
    dateFrom: str | None = Query(None, alias="dateFrom"),
    dateTo: str | None = Query(None, alias="dateTo"),
    employeeId: str | None = Query(None, alias="employeeId"),
    search: str | None = Query(None),
    page: int = Query(1, ge=1),
    pageSize: int = Query(10, ge=1, le=100, alias="pageSize"),
    sortField: str = Query("date", alias="sortField"),
    sortDir: str = Query("desc", alias="sortDir"),
):
    """
    List expenses with filters and pagination.
    Role-based: employees see own, managers see team, admin sees all.
    """
    expenses, total = await expense_service.list_expenses_for_user(
        db,
        current_user,
        status=status,
        category=category,
        date_from=dateFrom,
        date_to=dateTo,
        employee_id=employeeId,
        search=search,
        page=page,
        page_size=pageSize,
        sort_field=sortField if sortField in ("date", "amount", "status") else "date",
        sort_dir=sortDir if sortDir in ("asc", "desc") else "desc",
    )
    items = [expense_service._expense_to_response(e) for e in expenses]
    total_pages = (total + pageSize - 1) // pageSize if total > 0 else 1
    return ExpenseListResponse(
        expenses=items,
        total=total,
        page=page,
        pageSize=pageSize,
        totalPages=total_pages,
    )


@router.get("/{expense_id}", response_model=ExpenseResponse)
async def get_expense(
    db: AsyncSessionDep,
    current_user: CurrentUser,
    expense_id: str,
):
    """Get expense by ID."""
    expense = await expense_service.get_expense_by_id(db, expense_id, current_user)
    return expense_service.expense_to_response(expense)
