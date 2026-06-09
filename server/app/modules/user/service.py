from fastapi import HTTPException, status
from app.modules.user.schemas import (
    UserResponse,
    UserCreate,
    UserRoleUpdate,
    UserUpdate,
    UserAdminRead,
    UserPaginatedRead,
    UserAuthData,
    UpdatePass,
)
from sqlmodel import Session
from app.modules.user.models import User
from datetime import datetime, timezone
from app.core.security import get_password_hash, verify_password
from app.core.unit_of_work import UnitOfWork


class UserService:
    def __init__(self, session: Session) -> None:
        self._session = session

    def _get_or_404(self, uow: UnitOfWork, user_id: int) -> User:
        user = uow.users.get_by_id(user_id)
        if not user:
            raise HTTPException(
                status.HTTP_404_NOT_FOUND,
                f"Usuario con id {user_id} no encontrado",
            )
        return user

    def _get_active_or_404(self, uow: UnitOfWork, user_id: int) -> User:
        user = uow.users.get_by_id(user_id, True)
        if not user:
            raise HTTPException(
                status.HTTP_404_NOT_FOUND,
                f"Usuario con id {user_id} no encontrado",
            )
        return user

    def _assert_email_unique(self, uow: UnitOfWork, email: str):
        if uow.users.exists_by_email(email):
            raise HTTPException(
                status.HTTP_409_CONFLICT,
                f"Ya existe un usuario registrado con el email {email}",
            )

    def create(self, data: UserCreate) -> UserResponse:
        with UnitOfWork(self._session) as uow:
            self._assert_email_unique(uow, data.email)
            hashed_pass = get_password_hash(data.password)
            user_data = data.model_dump(exclude={"password"})
            user_data["hashed_pass"] = hashed_pass
            user = User(**user_data)
            uow.users.add(user)
            result = UserResponse.model_validate(user)
        return result

    def update_profile(self, user_id: int, data: UserUpdate) -> UserAdminRead:
        with UnitOfWork(self._session) as uow:
            user = self._get_active_or_404(uow, user_id)
            update_data = data.model_dump(exclude_unset=True)
            for field, value in update_data.items():
                setattr(user, field, value)
            user.updated_at = datetime.now(timezone.utc)
            uow.users.add(user)
            result = UserAdminRead.model_validate(user)
        return result

    def get_by_id(self, user_id: int) -> UserResponse:
        with UnitOfWork(self._session) as uow:
            user = self._get_or_404(uow, user_id)
            result = UserResponse.model_validate(user)
        return result

    def get_active_by_id(self, user_id: int) -> UserResponse:
        with UnitOfWork(self._session) as uow:
            user = self._get_active_or_404(uow, user_id)
            result = UserResponse.model_validate(user)
        return result

    def get_active_private(self, user_id: int) -> UserAdminRead:
        with UnitOfWork(self._session) as uow:
            user = self._get_active_or_404(uow, user_id)
            result = UserAdminRead.model_validate(user)
        return result

    def get_auth_credentials(self, email: str) -> UserAuthData:
        with UnitOfWork(self._session) as uow:
            credentials = uow.users.get_auth_credential(email)
            if not credentials:
                raise HTTPException(
                    status.HTTP_404_NOT_FOUND, f"Usuario email {email} no encontrado"
                )
            return credentials

    def get_session_data(self, user_id: int) -> UserResponse:
        with UnitOfWork(self._session) as uow:
            user = uow.users.get_by_id(user_id, True)
            if not user:
                raise HTTPException(status.HTTP_404_NOT_FOUND, "Usuario no encontrado")
            result = UserResponse(
                id=user.id,  # type: ignore
                name=user.name,
                lastname=user.lastname,
                email=user.email,
                role=user.role,
                is_active=user.is_active,
            )
        return result

    def deactivate(self, user_id: int, admin_id: int):
        if user_id == admin_id:
            raise HTTPException(
                status.HTTP_400_BAD_REQUEST,
                "Un administrador no puede desactivarse a sí mismo",
            )
        with UnitOfWork(self._session) as uow:
            user = self._get_active_or_404(uow, user_id)
            uow.users.deactivate(user)
        return status.HTTP_204_NO_CONTENT

    def reactivate(self, user_id: int, admin_id: int) -> UserResponse:
        with UnitOfWork(self._session) as uow:
            user = self._get_or_404(uow, user_id)
            uow.users.reactivate(user)
            return UserResponse.model_validate(user)

    def get_all(self, offset: int = 0, limit: int = 20) -> UserPaginatedRead:
        with UnitOfWork(self._session) as uow:
            users = uow.users.get_all(offset, limit)
            total = uow.users.count()
            data = [UserAdminRead.model_validate(u) for u in users]
            result = UserPaginatedRead(data=data, total=total)
        return result

    def get_user_profile(self, user_id: int) -> UserResponse:
        with UnitOfWork(self._session) as uow:
            user = self._get_active_or_404(uow, user_id)
            return UserResponse(
                id=user.id,  # type: ignore
                name=user.name,
                lastname=user.lastname,
                email=user.email,
                role=user.role,
                is_active=user.is_active,
            )

    def search(self, query: str, offset: int = 0, limit: int = 20) -> UserPaginatedRead:
        with UnitOfWork(self._session) as uow:
            users = uow.users.search(query, offset, limit)
            total = uow.users.count_search_results(query)
            data = [UserAdminRead.model_validate(u) for u in users]
            result = UserPaginatedRead(data=data, total=total)
        return result

    def update_role(self, user_id: int, data: UserRoleUpdate) -> UserResponse:
        with UnitOfWork(self._session) as uow:
            user = self._get_or_404(uow, user_id)
            user.role = data.role
            user.updated_at = datetime.now(timezone.utc)
            uow.users.add(user)
            result = UserResponse.model_validate(user)
        return result

    def update_password(self, user_id: int, data: UpdatePass):
        with UnitOfWork(self._session) as uow:
            user = self._get_active_or_404(uow, user_id)
            if not verify_password(data.old_pass, user.hashed_pass):
                raise HTTPException(
                    status.HTTP_401_UNAUTHORIZED, "Contraseña incorrecta"
                )
            new_hashed_pass = get_password_hash(data.new_pass)
            user.hashed_pass = new_hashed_pass
            uow.users.add(user)
        return {"message": "Contraseña cambiada exitosamente"}
