from sqlmodel import SQLModel, Field
from datetime import datetime, timezone, date
from sqlalchemy import DateTime, Column


class Persona(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    dni: str = Field(max_length=20, index=True, unique=True, nullable=False)
    nombre: str = Field(max_length=80, min_length=2, nullable=False)
    apellido: str = Field(max_length=80, min_length=2, nullable=False)
    fecha_nacimiento: date | None = Field(default=None)
    telefono: str | None = Field(max_length=20, default=None)
    created_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
        sa_column=Column(DateTime(timezone=True)),
    )
    updated_at: datetime | None = Field(
        default=None,
        sa_column=Column(DateTime(timezone=True)),
    )
