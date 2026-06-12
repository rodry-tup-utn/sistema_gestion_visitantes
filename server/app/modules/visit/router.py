from fastapi import APIRouter, Depends, Path, Query, status
from typing import Annotated
from sqlmodel import Session
from app.core.database import get_session
from app.modules.auth.dependencies import require_role
from app.modules.visit.service import AccesoService
from app.modules.visit.schemas import (
    CreateAccesoInternacionPayload,
    CreateAccesoAmbulatorioPayload,
    AccesoInternacionResponse,
    AccesoAmbulatorioResponse,
    AccesoInternacionPaginated,
    AccesoAmbulatorioPaginated,
    AccesoInternacionFiltro,
    AccesoAmbulatorioFiltro,
    AccesoVencidoList,
    AccesoActivoList,
)


def get_service(session: Session = Depends(get_session)):
    return AccesoService(session)


router = APIRouter(
    prefix="/visit",
    tags=["Visitas y Accesos"],
    dependencies=[Depends(require_role(["ADMIN", "OPERATOR"]))],
)


# ─── AccesoInternación ───

@router.post("/ingreso-internacion", response_model=AccesoInternacionResponse, status_code=status.HTTP_201_CREATED)
def crear_acceso_internacion(
    data: CreateAccesoInternacionPayload,
    svc: AccesoService = Depends(get_service),
):
    return svc.crear_acceso_internacion(data)


@router.get("/accesos-internacion", response_model=AccesoInternacionPaginated)
def get_accesos_internacion(
    filtro: AccesoInternacionFiltro = Depends(),
    svc: AccesoService = Depends(get_service),
):
    return svc.get_accesos_internacion(filtro)


@router.patch("/acceso-internacion/{id}/finalizar", response_model=AccesoInternacionResponse)
def finalizar_acceso_internacion(
    id: Annotated[int, Path(ge=1)],
    svc: AccesoService = Depends(get_service),
):
    return svc.finalizar_acceso_internacion(id)


# ─── AccesoAmbulatorio ───

@router.post("/ingreso-ambulatorio", response_model=AccesoAmbulatorioResponse, status_code=status.HTTP_201_CREATED)
def crear_acceso_ambulatorio(
    data: CreateAccesoAmbulatorioPayload,
    svc: AccesoService = Depends(get_service),
):
    return svc.crear_acceso_ambulatorio(data)


@router.get("/accesos-ambulatorio", response_model=AccesoAmbulatorioPaginated)
def get_accesos_ambulatorio(
    filtro: AccesoAmbulatorioFiltro = Depends(),
    svc: AccesoService = Depends(get_service),
):
    return svc.get_accesos_ambulatorio(filtro)


@router.patch("/acceso-ambulatorio/{id}/finalizar", response_model=AccesoAmbulatorioResponse)
def finalizar_acceso_ambulatorio(
    id: Annotated[int, Path(ge=1)],
    svc: AccesoService = Depends(get_service),
):
    return svc.finalizar_acceso_ambulatorio(id)


# ─── Vencidos y Renovación ───

@router.get("/accesos-vencidos", response_model=AccesoVencidoList)
def get_accesos_vencidos(
    offset: Annotated[int, Query(ge=0)] = 0,
    limit: Annotated[int, Query(ge=1, le=100)] = 50,
    svc: AccesoService = Depends(get_service),
):
    return svc.get_accesos_vencidos(offset, limit)


@router.get("/activos", response_model=AccesoActivoList)
def get_activos(
    query: Annotated[str | None, Query(max_length=50)] = None,
    dni: Annotated[str | None, Query(max_length=20)] = None,
    tipo_acceso: Annotated[str | None, Query(max_length=30)] = None,
    offset: Annotated[int, Query(ge=0)] = 0,
    limit: Annotated[int, Query(ge=1, le=100)] = 50,
    svc: AccesoService = Depends(get_service),
):
    return svc.get_activos(query, dni, tipo_acceso, offset, limit)


@router.patch("/acceso-internacion/{id}/renovar", response_model=AccesoInternacionResponse)
def renovar_acceso_internacion(
    id: Annotated[int, Path(ge=1)],
    svc: AccesoService = Depends(get_service),
):
    return svc.renovar_acceso_internacion(id)


@router.patch("/acceso-ambulatorio/{id}/renovar", response_model=AccesoAmbulatorioResponse)
def renovar_acceso_ambulatorio(
    id: Annotated[int, Path(ge=1)],
    svc: AccesoService = Depends(get_service),
):
    return svc.renovar_acceso_ambulatorio(id)
