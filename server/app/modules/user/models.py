from sqlmodel import SQLModel, Field
from datetime import datetime, timezone
from sqlalchemy import DateTime, Column
from enum import StrEnum


class Role(StrEnum):
    ADMIN = "ADMIN"
    OPERATOR = "OPERATOR"


class User(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    lastname: str = Field(max_length=80, min_length=4, nullable=False)
    name: str = Field(max_length=80, min_length=4, nullable=False)
    email: str = Field(
        max_length=255,
        min_length=8,
        index=True,
        unique=True,
        nullable=False,
    )
    hashed_pass: str = Field()
    role: Role = Field(default=Role.OPERATOR)
    is_active: bool = Field(default=True)
    created_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
        sa_column=Column(DateTime(timezone=True)),
    )
    updated_at: datetime | None = Field(
        default=None,
        sa_column=Column(DateTime(timezone=True)),
    )
