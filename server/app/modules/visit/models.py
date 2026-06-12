from sqlmodel import SQLModel, Field
from datetime import datetime, timezone
from sqlalchemy import DateTime, Column
from enum import StrEnum


class TipoAcceso(StrEnum):
    VISITA_ESTANDAR = "Visita Estandar"
    CUIDADOR = "Cuidador"
    URGENCIA = "Urgencia"
    CONSULTA = "Consulta"
    ESTUDIO = "Estudio"


class EstadoAcceso(StrEnum):
    ACTIVO = "Activo"
    FINALIZADO = "Finalizado"


class AccesoInternacion(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    persona_id: int = Field(foreign_key="persona.id", nullable=False)
    ocupacion_paciente_id: int = Field(foreign_key="ocupacionpaciente.id", nullable=False)
    internacion_id: int = Field(foreign_key="internacion.id", nullable=False)
    tipo_acceso: TipoAcceso = Field(default=TipoAcceso.VISITA_ESTANDAR)
    fecha_ingreso: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
        sa_column=Column(DateTime(timezone=True)),
    )
    fecha_salida: datetime | None = Field(
        default=None,
        sa_column=Column(DateTime(timezone=True)),
    )
    estado: EstadoAcceso = Field(default=EstadoAcceso.ACTIVO)
    persona_nombre_cache: str = Field(max_length=200)
    paciente_nombre_cache: str = Field(max_length=200)
    ubicacion_cache: str = Field(max_length=200)


class AccesoAmbulatorio(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    persona_id: int = Field(foreign_key="persona.id", nullable=False)
    servicio_ambulatorio_id: int = Field(foreign_key="servicioambulatorio.id", nullable=False)
    tipo_acceso: TipoAcceso = Field(default=TipoAcceso.CONSULTA)
    fecha_ingreso: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
        sa_column=Column(DateTime(timezone=True)),
    )
    fecha_salida: datetime | None = Field(
        default=None,
        sa_column=Column(DateTime(timezone=True)),
    )
    estado: EstadoAcceso = Field(default=EstadoAcceso.ACTIVO)
    persona_nombre_cache: str = Field(max_length=200)
    servicio_nombre_cache: str = Field(max_length=100)
