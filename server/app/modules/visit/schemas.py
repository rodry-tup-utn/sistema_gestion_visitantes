from sqlmodel import SQLModel, Field
from datetime import datetime
from pydantic import Field as PydanticField
from app.modules.visit.models import TipoAcceso, EstadoAcceso

# ─── AccesoInternacion ───


class CreateAccesoInternacionPayload(SQLModel):
    persona_dni: str = Field(max_length=20)
    persona_nombre: str = Field(max_length=80)
    persona_apellido: str = Field(max_length=80)
    ocupacion_paciente_id: int = Field(ge=1)
    tipo_acceso: TipoAcceso = Field(default=TipoAcceso.VISITA_ESTANDAR)


class AccesoInternacionFiltro(SQLModel):
    query: str | None = PydanticField(default=None, max_length=50)
    offset: int = PydanticField(default=0, ge=0)
    limit: int = PydanticField(default=20, ge=1, le=100)
    activos: bool = True
    persona_id: int | None = PydanticField(default=None, ge=1)


class AccesoInternacionResponse(SQLModel):
    id: int
    persona_id: int
    ocupacion_paciente_id: int
    internacion_id: int
    tipo_acceso: TipoAcceso
    fecha_ingreso: datetime
    fecha_salida: datetime | None
    estado: EstadoAcceso
    persona_nombre_cache: str
    paciente_nombre_cache: str
    ubicacion_cache: str
    minutos_transcurridos: int = 0
    vencido: bool = False


class AccesoInternacionPaginated(SQLModel):
    data: list[AccesoInternacionResponse]
    total: int


# ─── AccesoAmbulatorio ───


class CreateAccesoAmbulatorioPayload(SQLModel):
    persona_dni: str = Field(max_length=20)
    persona_nombre: str = Field(max_length=80)
    persona_apellido: str = Field(max_length=80)
    servicio_ambulatorio_id: int = Field(ge=1)
    tipo_acceso: TipoAcceso = Field(default=TipoAcceso.CONSULTA)


class AccesoAmbulatorioFiltro(SQLModel):
    query: str | None = PydanticField(default=None, max_length=50)
    offset: int = PydanticField(default=0, ge=0)
    limit: int = PydanticField(default=20, ge=1, le=100)
    activos: bool = True
    persona_id: int | None = PydanticField(default=None, ge=1)


class AccesoAmbulatorioResponse(SQLModel):
    id: int
    persona_id: int
    servicio_ambulatorio_id: int
    tipo_acceso: TipoAcceso
    fecha_ingreso: datetime
    fecha_salida: datetime | None
    estado: EstadoAcceso
    persona_nombre_cache: str
    servicio_nombre_cache: str
    minutos_transcurridos: int = 0
    vencido: bool = False


class AccesoAmbulatorioPaginated(SQLModel):
    data: list[AccesoAmbulatorioResponse]
    total: int


# ─── Vencidos unificado ───


class AccesoVencidoItem(SQLModel):
    id: int
    tipo: str
    persona_nombre_cache: str
    destino_cache: str
    tipo_acceso: TipoAcceso
    fecha_ingreso: datetime
    minutos_transcurridos: int


class AccesoVencidoList(SQLModel):
    data: list[AccesoVencidoItem]
    total: int


# ─── Activos unificado (vista visitantes) ───


class AccesoActivoItem(SQLModel):
    id: int
    tipo: str
    persona_nombre_cache: str
    persona_dni: str
    destino_cache: str
    tipo_acceso: str
    fecha_ingreso: datetime
    minutos_transcurridos: int
    vencido: bool


class AccesoActivoList(SQLModel):
    data: list[AccesoActivoItem]
    total: int
