from sqlmodel import SQLModel, Field
from datetime import datetime
from pydantic import BaseModel, EmailStr
from app.modules.user.models import Role


class UserCreate(SQLModel):
    name: str = Field(max_length=80, min_length=4)
    lastname: str = Field(max_length=80, min_length=4)
    email: EmailStr = Field(max_length=255)
    password: str = Field(max_length=255, min_length=8)
    role: Role = Field(default=Role.OPERATOR)


class UserRoleUpdate(SQLModel):
    role: Role


class UserResponse(SQLModel):
    id: int
    name: str
    lastname: str
    email: str
    role: Role
    is_active: bool


class UserUpdate(SQLModel):
    name: str | None = None
    lastname: str | None = None
    email: EmailStr | None = None


class UserAdminRead(UserResponse):
    created_at: datetime
    updated_at: datetime | None


class UserAuthData(SQLModel):
    id: int
    name: str
    role: str
    hashed_pass: str


class TokenPayloadData(SQLModel):
    id: int
    name: str
    role: str


class UserPaginatedRead(SQLModel):
    data: list[UserAdminRead]
    total: int


class UpdatePass(BaseModel):
    old_pass: str
    new_pass: str = Field(max_length=255, min_length=8)
