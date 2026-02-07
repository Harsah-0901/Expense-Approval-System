"""Users router - for listing employees (admin/manager)."""
from fastapi import APIRouter
from sqlalchemy import select

from app.dependencies import AsyncSessionDep
from app.dependencies import CurrentUser, RequireAdmin
from app.models.user import User, UserRole
from app.schemas.user import UserResponse

router = APIRouter(prefix="/users", tags=["Users"])


@router.get("", response_model=list[UserResponse])
async def list_users(
    db: AsyncSessionDep,
    current_user: CurrentUser,
    role: str | None = None,
):
    """
    List users. Admin can see all; Manager can see team; Employee sees nothing (403).
    """
    if current_user.role == UserRole.ADMIN:
        q = select(User)
        if role:
            q = q.where(User.role == UserRole(role))
        result = await db.execute(q)
        users = list(result.scalars().all())
    elif current_user.role == UserRole.MANAGER:
        result = await db.execute(
            select(User).where(User.manager_id == current_user.id)
        )
        users = list(result.scalars().all())
    else:
        from app.core.exceptions import ForbiddenError
        raise ForbiddenError("Only managers and admins can list users")

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
