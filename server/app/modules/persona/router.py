from fastapi import APIRouter, Depends, Path, status
from typing import Annotated
from sqlmodel import Session
from app.core.database import get_session
from app.modules.auth.dependencies import require_role
from app.modules.persona.service import PersonaService
from app.modules.persona.schemas import PersonaCreate, PersonaUpdate, PersonaResponse, PersonaPaginatedRead, PersonaFiltro


def get_service(session: Session = Depends(get_session)):
    return PersonaService(session)


admin_router = APIRouter(
    prefix="/admin/persona",
    tags=["Personas"],
    dependencies=[Depends(require_role(["ADMIN"]))],
)


@admin_router.post("/", response_model=PersonaResponse, status_code=status.HTTP_201_CREATED)
def create(data: PersonaCreate, svc: PersonaService = Depends(get_service)):
    return svc.create(data)


@admin_router.get("/", response_model=PersonaPaginatedRead)
def get_all(
    filtro: PersonaFiltro = Depends(),
    svc: PersonaService = Depends(get_service),
):
    if filtro.query:
        return svc.search(filtro.query, filtro.offset, filtro.limit)
    return svc.get_all(filtro.offset, filtro.limit)


@admin_router.get("/{id}", response_model=PersonaResponse)
def get_by_id(id: Annotated[int, Path(ge=1)], svc: PersonaService = Depends(get_service)):
    return svc.get_by_id(id)


@admin_router.patch("/{id}", response_model=PersonaResponse)
def update(
    id: Annotated[int, Path(ge=1)],
    data: PersonaUpdate,
    svc: PersonaService = Depends(get_service),
):
    return svc.update(id, data)
