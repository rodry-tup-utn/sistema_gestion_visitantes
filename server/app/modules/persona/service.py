from fastapi import HTTPException, status
from sqlmodel import Session
from app.core.unit_of_work import UnitOfWork
from app.modules.persona.schemas import PersonaCreate, PersonaUpdate, PersonaResponse, PersonaPaginatedRead


class PersonaService:
    def __init__(self, session: Session) -> None:
        self._session = session

    def _get_or_404(self, uow: UnitOfWork, persona_id: int):
        persona = uow.personas.get_by_id(persona_id)
        if not persona:
            raise HTTPException(status.HTTP_404_NOT_FOUND, f"Persona con id {persona_id} no encontrada")
        return persona

    def create(self, data: PersonaCreate) -> PersonaResponse:
        with UnitOfWork(self._session) as uow:
            if uow.personas.exists_by_dni(data.dni):
                raise HTTPException(status.HTTP_409_CONFLICT, f"Ya existe una persona con DNI {data.dni}")
            persona = uow.personas.add_from_schema(data)
            result = PersonaResponse.model_validate(persona)
        return result

    def get_all(self, offset: int = 0, limit: int = 20) -> PersonaPaginatedRead:
        with UnitOfWork(self._session) as uow:
            personas = uow.personas.get_all(offset, limit)
            total = uow.personas.count()
            data = [PersonaResponse.model_validate(p) for p in personas]
        return PersonaPaginatedRead(data=data, total=total)

    def get_by_id(self, persona_id: int) -> PersonaResponse:
        with UnitOfWork(self._session) as uow:
            persona = self._get_or_404(uow, persona_id)
            result = PersonaResponse.model_validate(persona)
        return result

    def update(self, persona_id: int, data: PersonaUpdate) -> PersonaResponse:
        with UnitOfWork(self._session) as uow:
            persona = self._get_or_404(uow, persona_id)
            update_data = data.model_dump(exclude_unset=True)
            if "dni" in update_data and update_data["dni"] != persona.dni:
                if uow.personas.exists_by_dni(update_data["dni"]):
                    raise HTTPException(status.HTTP_409_CONFLICT, f"Ya existe una persona con DNI {update_data['dni']}")
            for field, value in update_data.items():
                setattr(persona, field, value)
            persona.updated_at = __import__("datetime").datetime.now(__import__("datetime").timezone.utc)
            uow.personas.add(persona)
            result = PersonaResponse.model_validate(persona)
        return result

    def search(self, query: str, offset: int = 0, limit: int = 20) -> PersonaPaginatedRead:
        with UnitOfWork(self._session) as uow:
            personas = uow.personas.search(query, offset, limit)
            total = uow.personas.count_search_results(query)
            data = [PersonaResponse.model_validate(p) for p in personas]
        return PersonaPaginatedRead(data=data, total=total)
