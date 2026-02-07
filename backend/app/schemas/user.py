"""User schemas."""
from pydantic import BaseModel, EmailStr


class UserBase(BaseModel):
    """Base user schema."""

    email: EmailStr
    name: str
    role: str
    department: str
    manager_id: str | None = None


class UserResponse(BaseModel):
    """User response (matches frontend User type)."""

    id: str
    email: str
    name: str
    role: str
    managerId: str | None = None
    department: str

    class Config:
        from_attributes = True


class UserList(BaseModel):
    """List of users."""

    users: list[UserResponse]
    total: int
