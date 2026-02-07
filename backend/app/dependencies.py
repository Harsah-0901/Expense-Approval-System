"""FastAPI dependencies - auth, db, current user."""
from typing import Annotated

from fastapi import Depends, Header
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.database import get_db
from app.core.security import decode_token
from app.core.exceptions import UnauthorizedError, ForbiddenError
from app.models.user import User, UserRole

AsyncSessionDep = Annotated[AsyncSession, Depends(get_db)]


async def get_current_user(
    db: AsyncSessionDep,
    authorization: Annotated[str | None, Header()] = None,
) -> User | None:
    """
    Extract and validate JWT from Authorization header.
    Returns User if valid, None if no/invalid token.
    """
    if not authorization or not authorization.startswith("Bearer "):
        return None

    token = authorization.replace("Bearer ", "")
    payload = decode_token(token)
    if not payload or "sub" not in payload:
        return None

    user_id = payload["sub"]
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    return user


async def require_auth(
    current_user: Annotated[User | None, Depends(get_current_user)]
) -> User:
    """Require authentication - raises 401 if not logged in."""
    if current_user is None:
        raise UnauthorizedError("Authentication required")
    return current_user


CurrentUser = Annotated[User, Depends(require_auth)]


def require_role(*roles: UserRole):
    """Dependency factory - require specific role(s)."""

    async def role_checker(user: CurrentUser) -> User:
        if user.role not in roles:
            raise ForbiddenError(f"Access denied. Required role: {[r.value for r in roles]}")
        return user

    return role_checker


RequireEmployee = Annotated[User, Depends(require_role(UserRole.EMPLOYEE, UserRole.MANAGER, UserRole.ADMIN))]
RequireManager = Annotated[User, Depends(require_role(UserRole.MANAGER, UserRole.ADMIN))]
RequireAdmin = Annotated[User, Depends(require_role(UserRole.ADMIN))]
