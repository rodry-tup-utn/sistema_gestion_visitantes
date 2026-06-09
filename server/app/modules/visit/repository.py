from sqlmodel import Session, select, or_
from app.core.repository import BaseRepository
from app.modules.visit.models import AccesoInternacion, AccesoAmbulatorio


class AccesoInternacionRepository(BaseRepository[AccesoInternacion]):
    def __init__(self, session: Session):
        super().__init__(session, AccesoInternacion)

    def get_by_persona(self, persona_id: int, activos: bool = True):
        stmt = select(AccesoInternacion).where(AccesoInternacion.persona_id == persona_id)
        if activos:
            stmt = stmt.where(AccesoInternacion.estado == "Activo")
        return self.session.exec(stmt.order_by(AccesoInternacion.fecha_ingreso.desc())).all()

    def search(self, query: str, offset: int = 0, limit: int = 20) -> list[AccesoInternacion]:
        like = f"%{query}%"
        return self.session.exec(
            select(AccesoInternacion)
            .where(or_(
                AccesoInternacion.persona_nombre_cache.ilike(like),
                AccesoInternacion.paciente_nombre_cache.ilike(like),
                AccesoInternacion.ubicacion_cache.ilike(like),
            ))
            .offset(offset).limit(limit)
        ).all()

    def count_search_results(self, query: str) -> int:
        like = f"%{query}%"
        return len(self.session.exec(
            select(AccesoInternacion.id)
            .where(or_(
                AccesoInternacion.persona_nombre_cache.ilike(like),
                AccesoInternacion.paciente_nombre_cache.ilike(like),
                AccesoInternacion.ubicacion_cache.ilike(like),
            ))
        ).all())

    def count_activos(self) -> int:
        return len(self.session.exec(
            select(AccesoInternacion.id).where(AccesoInternacion.estado == "Activo")
        ).all())


class AccesoAmbulatorioRepository(BaseRepository[AccesoAmbulatorio]):
    def __init__(self, session: Session):
        super().__init__(session, AccesoAmbulatorio)

    def get_by_persona(self, persona_id: int, activos: bool = True):
        stmt = select(AccesoAmbulatorio).where(AccesoAmbulatorio.persona_id == persona_id)
        if activos:
            stmt = stmt.where(AccesoAmbulatorio.estado == "Activo")
        return self.session.exec(stmt.order_by(AccesoAmbulatorio.fecha_ingreso.desc())).all()

    def search(self, query: str, offset: int = 0, limit: int = 20) -> list[AccesoAmbulatorio]:
        like = f"%{query}%"
        return self.session.exec(
            select(AccesoAmbulatorio)
            .where(or_(
                AccesoAmbulatorio.persona_nombre_cache.ilike(like),
                AccesoAmbulatorio.servicio_nombre_cache.ilike(like),
            ))
            .offset(offset).limit(limit)
        ).all()

    def count_search_results(self, query: str) -> int:
        like = f"%{query}%"
        return len(self.session.exec(
            select(AccesoAmbulatorio.id)
            .where(or_(
                AccesoAmbulatorio.persona_nombre_cache.ilike(like),
                AccesoAmbulatorio.servicio_nombre_cache.ilike(like),
            ))
        ).all())

    def count_activos(self) -> int:
        return len(self.session.exec(
            select(AccesoAmbulatorio.id).where(AccesoAmbulatorio.estado == "Activo")
        ).all())
