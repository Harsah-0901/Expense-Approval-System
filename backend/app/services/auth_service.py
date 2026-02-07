"""Authentication service."""
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import verify_password, get_password_hash, create_access_token
from app.models.user import User, UserRole
from app.schemas.auth import UserLoginResponse, SignupRequest
from app.core.exceptions import UnauthorizedError, BadRequestError


async def register_user(db: AsyncSession, data: SignupRequest) -> tuple[User, str]:
    """
    Register a new employee user.
    Returns (user, token) on success.
    """
    result = await db.execute(select(User).where(User.email == data.email.lower()))
    if result.scalar_one_or_none():
        raise BadRequestError("Email already registered")

    count_result = await db.execute(select(func.count(User.id)))
    count = count_result.scalar() or 0
    user_id = f"emp-{str(count + 1).zfill(3)}"

    user = User(
        id=user_id,
        email=data.email.lower(),
        name=data.name.strip(),
        hashed_password=get_password_hash(data.password),
        role=UserRole.EMPLOYEE,
        manager_id=None,
        department=data.department.strip(),
    )
    db.add(user)
    await db.flush()

    token = create_access_token(subject=user.id)
    return user, token


async def authenticate_user(db: AsyncSession, email: str, password: str) -> tuple[User, str] | None:
    """
    Authenticate user by email and password.
    Returns (user, token) if successful, None otherwise.
    """
    result = await db.execute(select(User).where(User.email == email.lower()))
    user = result.scalar_one_or_none()
    if not user or not verify_password(password, user.hashed_password):
        return None

    token = create_access_token(subject=user.id)
    return user, token


def get_current_user_or_raise(user: User | None) -> User:
    """Raise UnauthorizedError if user is None."""
    if user is None:
        raise UnauthorizedError("Authentication required")
    return user


def user_to_login_response(user: User) -> UserLoginResponse:
    """Convert User model to UserLoginResponse schema."""
    return UserLoginResponse(
        id=user.id,
        email=user.email,
        name=user.name,
        role=user.role.value,
        managerId=user.manager_id,
        department=user.department,
    )
