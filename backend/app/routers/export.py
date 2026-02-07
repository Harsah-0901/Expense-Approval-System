"""CSV export router."""
import csv
import io
from fastapi import APIRouter, Query
from fastapi.responses import StreamingResponse

from app.dependencies import AsyncSessionDep
from app.dependencies import CurrentUser
from app.services import expense_service
from datetime import datetime

router = APIRouter(prefix="/export", tags=["Export"])


EXPORT_COLUMNS = [
    ("id", "Expense ID"),
    ("employeeName", "Employee Name"),
    ("department", "Department"),
    ("category", "Category"),
    ("amount", "Amount"),
    ("status", "Status"),
    ("date", "Expense Date"),
    ("submittedAt", "Submitted Date"),
    ("description", "Description"),
    ("managerName", "Manager"),
    ("approvedAt", "Approved Date"),
    ("rejectedAt", "Rejected Date"),
    ("paidAt", "Paid Date"),
    ("rejectionComment", "Rejection Comment"),
]


@router.get("/csv")
async def export_expenses_csv(
    db: AsyncSessionDep,
    current_user: CurrentUser,
    status: str | None = Query(None),
    category: str | None = Query(None),
    dateFrom: str | None = Query(None, alias="dateFrom"),
    dateTo: str | None = Query(None, alias="dateTo"),
    employeeId: str | None = Query(None, alias="employeeId"),
):
    """
    Export expenses as CSV.
    Respects role permissions - only exports data the user can access.
    """
    expenses, total = await expense_service.list_expenses_for_user(
        db,
        current_user,
        status=status,
        category=category,
        date_from=dateFrom,
        date_to=dateTo,
        employee_id=employeeId,
        page=1,
        page_size=10000,  # Export limit
    )

    def generate_csv():
        output = io.StringIO()
        writer = csv.writer(output)
        headers = [col[1] for col in EXPORT_COLUMNS]
        writer.writerow(headers)

        for exp in expenses:
            resp = expense_service.expense_to_response(exp)
            row = []
            for key, _ in EXPORT_COLUMNS:
                val = getattr(resp, key, None)
                if val is None:
                    row.append("")
                else:
                    row.append(str(val))
            writer.writerow(row)

        output.seek(0)
        return output.getvalue()

    csv_content = generate_csv()
    filename = f"expenses_export_{datetime.utcnow().strftime('%Y-%m-%d_%H%M%S')}.csv"
    return StreamingResponse(
        iter([csv_content]),
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename={filename}"},
    )
