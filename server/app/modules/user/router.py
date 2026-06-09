from fastapi import APIRouter, Depends, Path, status
from sqlmodel import Session
from app.modules.user.service import UserService
from app.modules.user.schemas import (
    UserResponse,
    UserCreate,
    UserRoleUpdate,
    UserUpdate,
    UserAdminRead,
    UserPaginatedRead,
    TokenPayloadData,
    UpdatePass,
    UserFiltro,
)
from typing import Annotated
from app.core.database import get_session
from app.modules.auth.dependencies import (
    require_role,
    get_current_user,
    get_token_payload,
)


def get_user_service(session: Session = Depends(get_session)):
    return UserService(session)


admin_router = APIRouter(
    prefix="/admin/user",
    tags=["Usuarios - Admin"],
    dependencies=[Depends(require_role(["ADMIN"]))],
)

user_router = APIRouter(
    prefix="/profile",
    tags=["Usuarios - Sesion"],
    dependencies=[Depends(get_token_payload)],
)


# --- PROFILE ROUTES ---


@user_router.get("/me", response_model=UserResponse)
def get_my_profile(
    user_data: TokenPayloadData = Depends(get_token_payload),
    svc: UserService = Depends(get_user_service),
):
    return svc.get_user_profile(user_data.id)


@user_router.patch("/update", response_model=UserAdminRead)
def update_profile(
    data: UserUpdate,
    user_data: TokenPayloadData = Depends(get_token_payload),
    svc: UserService = Depends(get_user_service),
):
    return svc.update_profile(user_data.id, data)


@user_router.get("/session", response_model=UserResponse)
def get_session_data(
    user_data: TokenPayloadData = Depends(get_token_payload),
    svc: UserService = Depends(get_user_service),
):
    return svc.get_session_data(user_data.id)


@user_router.patch("/password")
def update_password(
    data: UpdatePass,
    user: UserResponse = Depends(get_current_user),
    svc: UserService = Depends(get_user_service),
):
    return svc.update_password(user.id, data)


# --- ADMIN ROUTES ---


@admin_router.post("/", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def create_user(
    data: UserCreate,
    svc: UserService = Depends(get_user_service),
):
    return svc.create(data)


@admin_router.get("/", response_model=UserPaginatedRead)
def get_all_users(
    filtro: UserFiltro = Depends(),
    svc: UserService = Depends(get_user_service),
):
    if filtro.query:
        return svc.search(filtro.query, filtro.offset, filtro.limit)
    return svc.get_all(filtro.offset, filtro.limit)


@admin_router.get("/{id}", response_model=UserResponse)
def get_user_by_admin(
    id: Annotated[int, Path(ge=1)],
    svc: UserService = Depends(get_user_service),
):
    return svc.get_by_id(id)


@admin_router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_user(
    id: Annotated[int, Path(ge=1)],
    svc: UserService = Depends(get_user_service),
    admin_user: UserResponse = Depends(require_role(["ADMIN"])),
):
    return svc.deactivate(id, admin_user.id)


@admin_router.patch("/update/{user_id}", response_model=UserAdminRead)
def update_by_admin(
    data: UserUpdate,
    user_id: Annotated[int, Path(ge=1)],
    svc: UserService = Depends(get_user_service),
):
    return svc.update_profile(user_id, data)


@admin_router.patch("/{user_id}/role", response_model=UserResponse)
def update_user_role(
    data: UserRoleUpdate,
    user_id: Annotated[int, Path(ge=1)],
    svc: UserService = Depends(get_user_service),
):
    return svc.update_role(user_id, data)


@admin_router.patch("/{user_id}/reactivate", response_model=UserResponse)
def reactivate_user(
    user_id: Annotated[int, Path(ge=1)],
    svc: UserService = Depends(get_user_service),
    admin_user: UserResponse = Depends(require_role(["ADMIN"])),
):
    return svc.reactivate(user_id, admin_user.id)
