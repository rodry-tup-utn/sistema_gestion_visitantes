from fastapi import APIRouter, Depends, Query, Path, status
from typing import Annotated
from sqlmodel import Session
from app.core.database import get_session
from app.modules.auth.dependencies import require_role
from app.modules.internacion.service import (
    ServicioInternacionService,
    InternacionService,
    ServicioAmbulatorioService,
    OcupacionPacienteService,
)
from app.modules.internacion.schemas import (
    ServicioInternacionCreate,
    ServicioInternacionUpdate,
    ServicioInternacionResponse,
    ServicioInternacionPaginatedRead,
    InternacionFiltro,
    InternacionCreate,
    InternacionUpdate,
    InternacionResponse,
    InternacionPaginatedRead,
    ServicioAmbulatorioCreate,
    ServicioAmbulatorioUpdate,
    ServicioAmbulatorioResponse,
    ServicioAmbulatorioPaginatedRead,
    OcupacionPacienteCreate,
    OcupacionPacienteResponse,
    OcupacionPacientePaginatedRead,
)


def get_si_service(session: Session = Depends(get_session)):
    return ServicioInternacionService(session)


def get_int_service(session: Session = Depends(get_session)):
    return InternacionService(session)


def get_sa_service(session: Session = Depends(get_session)):
    return ServicioAmbulatorioService(session)


# ─── ServicioInternacion ───

servicio_internacion_router = APIRouter(
    prefix="/admin/servicio-internacion",
    tags=["Servicios de Internación"],
    dependencies=[Depends(require_role(["ADMIN"]))],
)


@servicio_internacion_router.post("/", response_model=ServicioInternacionResponse, status_code=status.HTTP_201_CREATED)
def create_si(data: ServicioInternacionCreate, svc: ServicioInternacionService = Depends(get_si_service)):
    return svc.create(data)


@servicio_internacion_router.get("/", response_model=ServicioInternacionPaginatedRead)
def get_all_si(
    offset: Annotated[int, Query(ge=0)] = 0,
    limit: Annotated[int, Query(ge=1)] = 20,
    query: Annotated[str | None, Query(min_length=2, max_length=50)] = None,
    svc: ServicioInternacionService = Depends(get_si_service),
):
    if query:
        return svc.search(query, offset, limit)
    return svc.get_all(offset, limit)


@servicio_internacion_router.patch("/{id}", response_model=ServicioInternacionResponse)
def update_si(
    id: Annotated[int, Path(ge=1)],
    data: ServicioInternacionUpdate,
    svc: ServicioInternacionService = Depends(get_si_service),
):
    return svc.update(id, data)


# ─── Internacion (Camas) ───

internacion_router = APIRouter(
    prefix="/admin/internacion",
    tags=["Camas de Internación"],
    dependencies=[Depends(require_role(["ADMIN"]))],
)


@internacion_router.post("/", response_model=InternacionResponse, status_code=status.HTTP_201_CREATED)
def create_int(data: InternacionCreate, svc: InternacionService = Depends(get_int_service)):
    return svc.create(data)


@internacion_router.get("/", response_model=InternacionPaginatedRead)
def get_all_int(
    filtro: InternacionFiltro = Depends(),
    svc: InternacionService = Depends(get_int_service),
):
    return svc.get_filtered(filtro)


@internacion_router.patch("/{id}", response_model=InternacionResponse)
def update_int(
    id: Annotated[int, Path(ge=1)],
    data: InternacionUpdate,
    svc: InternacionService = Depends(get_int_service),
):
    return svc.update(id, data)


# ─── ServicioAmbulatorio ───

servicio_ambulatorio_router = APIRouter(
    prefix="/admin/servicio-ambulatorio",
    tags=["Servicios Ambulatorios"],
    dependencies=[Depends(require_role(["ADMIN"]))],
)


@servicio_ambulatorio_router.post("/", response_model=ServicioAmbulatorioResponse, status_code=status.HTTP_201_CREATED)
def create_sa(data: ServicioAmbulatorioCreate, svc: ServicioAmbulatorioService = Depends(get_sa_service)):
    return svc.create(data)


@servicio_ambulatorio_router.get("/", response_model=ServicioAmbulatorioPaginatedRead)
def get_all_sa(
    offset: Annotated[int, Query(ge=0)] = 0,
    limit: Annotated[int, Query(ge=1)] = 20,
    query: Annotated[str | None, Query(min_length=2, max_length=50)] = None,
    svc: ServicioAmbulatorioService = Depends(get_sa_service),
):
    if query:
        return svc.search(query, offset, limit)
    return svc.get_all(offset, limit)


@servicio_ambulatorio_router.patch("/{id}", response_model=ServicioAmbulatorioResponse)
def update_sa(
    id: Annotated[int, Path(ge=1)],
    data: ServicioAmbulatorioUpdate,
    svc: ServicioAmbulatorioService = Depends(get_sa_service),
):
    return svc.update(id, data)


# ─── OcupacionPaciente ───

def get_oc_service(session: Session = Depends(get_session)):
    return OcupacionPacienteService(session)


ocupacion_router = APIRouter(
    prefix="/admin/ocupacion",
    tags=["Ocupación de Pacientes"],
    dependencies=[Depends(require_role(["ADMIN"]))],
)


@ocupacion_router.post("/admitir", response_model=OcupacionPacienteResponse, status_code=status.HTTP_201_CREATED)
def admitir(data: OcupacionPacienteCreate, svc: OcupacionPacienteService = Depends(get_oc_service)):
    return svc.admit(data)


@ocupacion_router.get("/", response_model=OcupacionPacientePaginatedRead)
def get_all_oc(
    offset: Annotated[int, Query(ge=0)] = 0,
    limit: Annotated[int, Query(ge=1)] = 20,
    solo_activos: Annotated[bool, Query()] = True,
    query: Annotated[str | None, Query(min_length=2, max_length=50)] = None,
    svc: OcupacionPacienteService = Depends(get_oc_service),
):
    if query:
        return svc.search(query, offset, limit)
    if solo_activos:
        return svc.get_active(offset, limit)
    return svc.get_all(offset, limit)


@ocupacion_router.patch("/{id}/alta", response_model=OcupacionPacienteResponse)
def dar_alta(
    id: Annotated[int, Path(ge=1)],
    svc: OcupacionPacienteService = Depends(get_oc_service),
):
    return svc.discharge(id)


@ocupacion_router.patch("/{id}/fallecido", response_model=OcupacionPacienteResponse)
def registrar_fallecimiento(
    id: Annotated[int, Path(ge=1)],
    svc: OcupacionPacienteService = Depends(get_oc_service),
):
    return svc.register_death(id)
