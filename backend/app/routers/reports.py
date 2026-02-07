"""Reports and analytics router."""
from fastapi import APIRouter, Query

from app.dependencies import AsyncSessionDep
from app.dependencies import CurrentUser, RequireManager
from app.services import report_service
from app.schemas.user import UserResponse

router = APIRouter(prefix="/reports", tags=["Reports"])


@router.get("/monthly-summary")
async def get_monthly_summary(
    db: AsyncSessionDep,
    current_user: CurrentUser,
    dateFrom: str | None = Query(None, alias="dateFrom"),
    dateTo: str | None = Query(None, alias="dateTo"),
    employeeId: str | None = Query(None, alias="employeeId"),
    status: str | None = Query(None),
):
    """
    Get monthly expense summary.
    Managers see only their team; Admin sees all.
    """
    data = await report_service.get_monthly_summary(
        db,
        current_user,
        date_from=dateFrom,
        date_to=dateTo,
        employee_id=employeeId,
        status=status,
    )
    return {"summary": data}


@router.get("/team-members", response_model=list[UserResponse])
async def get_team_members(
    db: AsyncSessionDep,
    current_user: RequireManager,
):
    """Get team members (employees) for the current manager."""
    if current_user.role.value == "admin":
        users = await report_service.get_all_employees(db)
    else:
        users = await report_service.get_team_members(db, current_user.id)

    return [
        UserResponse(
            id=u.id,
            email=u.email,
            name=u.name,
            role=u.role.value,
            managerId=u.manager_id,
            department=u.department,
        )
        for u in users
    ]
