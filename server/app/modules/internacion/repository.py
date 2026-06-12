from sqlmodel import Session, select, or_
from app.core.repository import BaseRepository
from app.modules.internacion.models import (
    ServicioInternacion,
    Internacion,
    ServicioAmbulatorio,
    OcupacionPaciente,
)


class ServicioInternacionRepository(BaseRepository[ServicioInternacion]):
    def __init__(self, session: Session):
        super().__init__(session, ServicioInternacion)

    def search(self, query: str, offset: int = 0, limit: int = 20) -> list[ServicioInternacion]:
        like = f"%{query}%"
        return self.session.exec(
            select(ServicioInternacion)
            .where(ServicioInternacion.nombre_servicio.ilike(like))
            .offset(offset).limit(limit)
        ).all()

    def count_search_results(self, query: str) -> int:
        like = f"%{query}%"
        return len(self.session.exec(
            select(ServicioInternacion.id)
            .where(ServicioInternacion.nombre_servicio.ilike(like))
        ).all())


class InternacionRepository(BaseRepository[Internacion]):
    def __init__(self, session: Session):
        super().__init__(session, Internacion)

    def get_by_servicio(self, servicio_id: int) -> list[Internacion]:
        return self.session.exec(
            select(Internacion).where(Internacion.servicio_internacion_id == servicio_id)
        ).all()

    def search(self, query: str, offset: int = 0, limit: int = 20) -> list[Internacion]:
        like = f"%{query}%"
        return self.session.exec(
            select(Internacion)
            .where(or_(
                Internacion.sala.ilike(like),
                Internacion.cama.ilike(like),
                Internacion.servicio_nombre_cache.ilike(like),
            ))
            .offset(offset).limit(limit)
        ).all()

    def count_search_results(self, query: str) -> int:
        like = f"%{query}%"
        return len(self.session.exec(
            select(Internacion.id)
            .where(or_(
                Internacion.sala.ilike(like),
                Internacion.cama.ilike(like),
                Internacion.servicio_nombre_cache.ilike(like),
            ))
        ).all())


class ServicioAmbulatorioRepository(BaseRepository[ServicioAmbulatorio]):
    def __init__(self, session: Session):
        super().__init__(session, ServicioAmbulatorio)

    def search(self, query: str, offset: int = 0, limit: int = 20) -> list[ServicioAmbulatorio]:
        like = f"%{query}%"
        return self.session.exec(
            select(ServicioAmbulatorio)
            .where(ServicioAmbulatorio.nombre_servicio.ilike(like))
            .offset(offset).limit(limit)
        ).all()

    def count_search_results(self, query: str) -> int:
        like = f"%{query}%"
        return len(self.session.exec(
            select(ServicioAmbulatorio.id)
            .where(ServicioAmbulatorio.nombre_servicio.ilike(like))
        ).all())


class OcupacionPacienteRepository(BaseRepository[OcupacionPaciente]):
    def __init__(self, session: Session):
        super().__init__(session, OcupacionPaciente)
