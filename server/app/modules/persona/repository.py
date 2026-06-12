from sqlmodel import Session, select, or_, func, col
from app.core.repository import BaseRepository
from app.modules.persona.models import Persona
from app.modules.persona.schemas import PersonaFiltro


class PersonaRepository(BaseRepository[Persona]):
    def __init__(self, session: Session):
        super().__init__(session, Persona)

    def get_by_dni(self, dni: str) -> Persona | None:
        return self.session.exec(select(Persona).where(Persona.dni == dni)).first()

    def exists_by_dni(self, dni: str) -> bool:
        return (
            self.session.exec(select(Persona).where(Persona.dni == dni)).first()
            is not None
        )

    def get_filtered(self, filtro: PersonaFiltro) -> tuple[list[Persona], int]:
        filters: list = []
        if filtro.dni:
            filters.append(Persona.dni == filtro.dni)
        if filtro.query:
            like = f"%{filtro.query}%"
            filters.append(
                or_(
                    col(Persona.dni).ilike(like),
                    col(Persona.nombre).ilike(like),
                    col(Persona.apellido).ilike(like),
                )
            )

        stmt = select(Persona)
        for f in filters:
            stmt = stmt.where(f)

        personas = self.session.exec(
            stmt.offset(filtro.offset).limit(filtro.limit)
        ).all()
        total = self.session.exec(select(func.count(Persona.id)).where(*filters)).one()

        return personas, total
