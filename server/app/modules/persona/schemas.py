from sqlmodel import SQLModel, Field
from datetime import datetime, date
from pydantic import Field as PydanticField


class PersonaCreate(SQLModel):
    dni: str = Field(max_length=20, min_length=6)
    nombre: str = Field(max_length=80, min_length=2)
    apellido: str = Field(max_length=80, min_length=2)
    fecha_nacimiento: date | None = None
    telefono: str | None = Field(max_length=20, default=None)


class PersonaUpdate(SQLModel):
    dni: str | None = Field(max_length=20, min_length=6, default=None)
    nombre: str | None = Field(max_length=80, min_length=2, default=None)
    apellido: str | None = Field(max_length=80, min_length=2, default=None)
    fecha_nacimiento: date | None = None
    telefono: str | None = Field(max_length=20, default=None)


class PersonaResponse(SQLModel):
    id: int
    dni: str
    nombre: str
    apellido: str
    fecha_nacimiento: date | None
    telefono: str | None
    created_at: datetime
    updated_at: datetime | None


class PersonaFiltro(SQLModel):
    query: str | None = PydanticField(default=None, max_length=50)
    offset: int = PydanticField(default=0, ge=0)
    limit: int = PydanticField(default=20, ge=1, le=100)


class PersonaPaginatedRead(SQLModel):
    data: list[PersonaResponse]
    total: int
