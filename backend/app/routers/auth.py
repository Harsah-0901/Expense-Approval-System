"""Authentication router."""
from fastapi import APIRouter

from app.dependencies import AsyncSessionDep, CurrentUser
from app.schemas.auth import LoginRequest, SignupRequest, Token, UserLoginResponse
from app.services.auth_service import authenticate_user, register_user, user_to_login_response
from app.core.exceptions import UnauthorizedError

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/register", response_model=Token)
async def signup(data: SignupRequest, db: AsyncSessionDep):
    """
    Register a new employee account.
    Returns JWT access token and user data.
    """
    user, token = await register_user(db, data)
    user_response = user_to_login_response(user)
    return Token(
        access_token=token,
        token_type="bearer",
        user=user_response,
    )


@router.get("/me", response_model=UserLoginResponse)
async def get_current_user_info(current_user: CurrentUser):
    """Get current authenticated user (for frontend session refresh)."""
    return user_to_login_response(current_user)


@router.post("/login", response_model=Token)
async def login(data: LoginRequest, db: AsyncSessionDep):
    """
    Authenticate with email and password.
    Returns JWT access token and user data.
    """
    result = await authenticate_user(db, data.email, data.password)
    if not result:
        raise UnauthorizedError("Invalid email or password")

    user, token = result
    user_response = user_to_login_response(user)
    return Token(
        access_token=token,
        token_type="bearer",
        user=user_response,
    )
