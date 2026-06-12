from sqlmodel import SQLModel, Field
from datetime import datetime
from app.modules.internacion.models import (
    EstadoDisponibilidad,
    EstadoServicio,
    EstadoPaciente,
)
from pydantic import Field as PydanticField

# ─── ServicioInternacion ───


class ServicioInternacionCreate(SQLModel):
    nombre_servicio: str = Field(max_length=100)
    bloque_piso: str | None = Field(max_length=50, default=None)


class ServicioInternacionUpdate(SQLModel):
    nombre_servicio: str | None = Field(max_length=100, default=None)
    bloque_piso: str | None = Field(max_length=50, default=None)


class ServicioInternacionResponse(SQLModel):
    id: int
    nombre_servicio: str
    bloque_piso: str | None
    created_at: datetime
    updated_at: datetime | None


class ServicioInternacionPaginatedRead(SQLModel):
    data: list[ServicioInternacionResponse]
    total: int


# ─── Internacion (Camas) ───


class InternacionFiltro(SQLModel):
    query: str | None = PydanticField(default=None, max_length=50)
    offset: int = PydanticField(default=0, ge=0)
    limit: int = PydanticField(default=20, ge=1, le=100)
    servicio_id: int | None = PydanticField(default=None, ge=1)
    estado_disponibilidad: EstadoDisponibilidad | None = None


class InternacionCreate(SQLModel):
    servicio_internacion_id: int = Field(ge=1)
    sala: str = Field(max_length=50)
    cama: str = Field(max_length=20)
    estado_disponibilidad: EstadoDisponibilidad = Field(
        default=EstadoDisponibilidad.DISPONIBLE
    )


class InternacionUpdate(SQLModel):
    servicio_internacion_id: int | None = Field(ge=1, default=None)
    sala: str | None = Field(max_length=50, default=None)
    cama: str | None = Field(max_length=20, default=None)
    estado_disponibilidad: EstadoDisponibilidad | None = None


class InternacionEstadoUpdate(SQLModel):
    estado_disponibilidad: EstadoDisponibilidad


class InternacionResponse(SQLModel):
    id: int
    servicio_internacion_id: int
    servicio_nombre_cache: str
    sala: str
    cama: str
    estado_disponibilidad: EstadoDisponibilidad
    created_at: datetime
    updated_at: datetime | None


class InternacionPaginatedRead(SQLModel):
    data: list[InternacionResponse]
    total: int


# ─── ServicioAmbulatorio ───


class ServicioAmbulatorioCreate(SQLModel):
    nombre_servicio: str = Field(max_length=100)
    ubicacion_interna: str | None = Field(max_length=100, default=None)
    estado: EstadoServicio = Field(default=EstadoServicio.ACTIVO)


class ServicioAmbulatorioUpdate(SQLModel):
    nombre_servicio: str | None = Field(max_length=100, default=None)
    ubicacion_interna: str | None = Field(max_length=100, default=None)
    estado: EstadoServicio | None = None


class ServicioAmbulatorioResponse(SQLModel):
    id: int
    nombre_servicio: str
    ubicacion_interna: str | None
    estado: EstadoServicio
    created_at: datetime
    updated_at: datetime | None


class ServicioAmbulatorioPaginatedRead(SQLModel):
    data: list[ServicioAmbulatorioResponse]
    total: int


# ─── OcupacionPaciente ───


class OcupacionCamaUpdate(SQLModel):
    internacion_id: int = Field(ge=1)


class OcupacionPacienteCreate(SQLModel):
    persona_id: int = Field(ge=1)
    internacion_id: int = Field(ge=1)


class OcupacionPacienteResponse(SQLModel):
    id: int
    persona_id: int
    internacion_id: int
    paciente_nombre_cache: str
    ubicacion_cache: str
    fecha_ingreso: datetime
    fecha_alta: datetime | None
    estado: EstadoPaciente


class OcupacionPacientePaginatedRead(SQLModel):
    data: list[OcupacionPacienteResponse]
    total: int
