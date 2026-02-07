"""Authentication schemas."""
from pydantic import BaseModel, EmailStr, Field


class LoginRequest(BaseModel):
    """Login credentials."""

    email: EmailStr
    password: str


class SignupRequest(BaseModel):
    """Registration payload."""

    email: EmailStr
    password: str = Field(..., min_length=6)
    name: str = Field(..., min_length=2, max_length=255)
    department: str = Field(..., min_length=2, max_length=255)


class UserLoginResponse(BaseModel):
    """User data returned after login (matches frontend User type)."""

    id: str
    email: str
    name: str
    role: str
    managerId: str | None = None
    department: str


class Token(BaseModel):
    """JWT token response."""

    access_token: str
    token_type: str = "bearer"
    user: UserLoginResponse


class TokenData(BaseModel):
    """Decoded token payload."""

    user_id: str | None = None
