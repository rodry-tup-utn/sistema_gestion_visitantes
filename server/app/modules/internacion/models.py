from sqlmodel import SQLModel, Field, Relationship
from datetime import datetime, timezone
from sqlalchemy import DateTime, Column
from enum import StrEnum


class EstadoDisponibilidad(StrEnum):
    DISPONIBLE = "Disponible"
    OCUPADA = "Ocupada"
    MANTENIMIENTO = "Mantenimiento"
    NO_DISPONIBLE = "No Disponible"


class EstadoPaciente(StrEnum):
    INTERNADO = "Internado"
    ALTA = "Alta"
    FALLECIDO = "Fallecido"


class EstadoServicio(StrEnum):
    ACTIVO = "Activo"
    INACTIVO = "Inactivo"


class ServicioInternacion(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    nombre_servicio: str = Field(max_length=100, nullable=False)
    bloque_piso: str | None = Field(max_length=50, default=None)
    created_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
        sa_column=Column(DateTime(timezone=True)),
    )
    updated_at: datetime | None = Field(
        default=None,
        sa_column=Column(DateTime(timezone=True)),
    )

    camas: list["Internacion"] = Relationship(back_populates="servicio_internacion")


class Internacion(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    servicio_internacion_id: int = Field(foreign_key="serviciointernacion.id", nullable=False)
    servicio_nombre_cache: str = Field(max_length=100)
    sala: str = Field(max_length=50, nullable=False)
    cama: str = Field(max_length=20, nullable=False)
    estado_disponibilidad: EstadoDisponibilidad = Field(default=EstadoDisponibilidad.DISPONIBLE)
    created_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
        sa_column=Column(DateTime(timezone=True)),
    )
    updated_at: datetime | None = Field(
        default=None,
        sa_column=Column(DateTime(timezone=True)),
    )

    servicio_internacion: ServicioInternacion = Relationship(back_populates="camas")


class ServicioAmbulatorio(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    nombre_servicio: str = Field(max_length=100, nullable=False)
    ubicacion_interna: str | None = Field(max_length=100, default=None)
    estado: EstadoServicio = Field(default=EstadoServicio.ACTIVO)
    created_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
        sa_column=Column(DateTime(timezone=True)),
    )
    updated_at: datetime | None = Field(
        default=None,
        sa_column=Column(DateTime(timezone=True)),
    )


class OcupacionPaciente(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    persona_id: int = Field(foreign_key="persona.id", nullable=False)
    internacion_id: int = Field(foreign_key="internacion.id", nullable=False)
    paciente_nombre_cache: str = Field(max_length=200)
    ubicacion_cache: str = Field(max_length=200)
    fecha_ingreso: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
        sa_column=Column(DateTime(timezone=True)),
    )
    fecha_alta: datetime | None = Field(
        default=None,
        sa_column=Column(DateTime(timezone=True)),
    )
    estado: EstadoPaciente = Field(default=EstadoPaciente.INTERNADO)
