from sqlmodel import Session, select, or_
from app.core.repository import BaseRepository
from app.modules.persona.models import Persona


class PersonaRepository(BaseRepository[Persona]):
    def __init__(self, session: Session):
        super().__init__(session, Persona)

    def get_by_dni(self, dni: str) -> Persona | None:
        return self.session.exec(
            select(Persona).where(Persona.dni == dni)
        ).first()

    def exists_by_dni(self, dni: str) -> bool:
        return self.session.exec(
            select(Persona).where(Persona.dni == dni)
        ).first() is not None

    def search(self, query: str, offset: int = 0, limit: int = 20) -> list[Persona]:
        like = f"%{query}%"
        return self.session.exec(
            select(Persona)
            .where(or_(Persona.dni.ilike(like), Persona.nombre.ilike(like), Persona.apellido.ilike(like)))
            .offset(offset)
            .limit(limit)
        ).all()

    def count_search_results(self, query: str) -> int:
        like = f"%{query}%"
        return len(
            self.session.exec(
                select(Persona.id)
                .where(or_(Persona.dni.ilike(like), Persona.nombre.ilike(like), Persona.apellido.ilike(like)))
            ).all()
        )
