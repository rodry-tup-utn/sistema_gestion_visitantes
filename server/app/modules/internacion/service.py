from fastapi import HTTPException, status
from sqlmodel import Session, select, or_, func, col
from app.core.unit_of_work import UnitOfWork
from app.modules.internacion.schemas import (
    ServicioInternacionCreate,
    ServicioInternacionUpdate,
    ServicioInternacionResponse,
    ServicioInternacionPaginatedRead,
    InternacionCreate,
    InternacionUpdate,
    InternacionEstadoUpdate,
    InternacionResponse,
    InternacionPaginatedRead,
    InternacionFiltro,
    ServicioAmbulatorioCreate,
    ServicioAmbulatorioUpdate,
    ServicioAmbulatorioResponse,
    ServicioAmbulatorioPaginatedRead,
    OcupacionPacienteCreate,
    OcupacionPacienteResponse,
    OcupacionPacientePaginatedRead,
)
from app.modules.internacion.models import (
    EstadoDisponibilidad,
    EstadoPaciente,
    Internacion,
    OcupacionPaciente,
)
from app.modules.visit.models import AccesoInternacion, EstadoAcceso
from datetime import datetime, timezone


class ServicioInternacionService:
    def __init__(self, session: Session):
        self._session = session

    def create(self, data: ServicioInternacionCreate) -> ServicioInternacionResponse:
        with UnitOfWork(self._session) as uow:
            entity = uow.servicios_internacion.add_from_schema(data)
            result = ServicioInternacionResponse.model_validate(entity)
        return result

    def get_all(
        self, offset: int = 0, limit: int = 20
    ) -> ServicioInternacionPaginatedRead:
        with UnitOfWork(self._session) as uow:
            items = uow.servicios_internacion.get_all(offset, limit)
            total = uow.servicios_internacion.count()
            data = [ServicioInternacionResponse.model_validate(i) for i in items]
        return ServicioInternacionPaginatedRead(data=data, total=total)

    def search(
        self, query: str, offset: int = 0, limit: int = 20
    ) -> ServicioInternacionPaginatedRead:
        with UnitOfWork(self._session) as uow:
            items = uow.servicios_internacion.search(query, offset, limit)
            total = uow.servicios_internacion.count_search_results(query)
            data = [ServicioInternacionResponse.model_validate(i) for i in items]
        return ServicioInternacionPaginatedRead(data=data, total=total)

    def update(
        self, entity_id: int, data: ServicioInternacionUpdate
    ) -> ServicioInternacionResponse:
        with UnitOfWork(self._session) as uow:
            entity = uow.servicios_internacion.get_by_id(entity_id)
            if not entity:
                raise HTTPException(
                    status.HTTP_404_NOT_FOUND, "Servicio de internación no encontrado"
                )
            update_data = data.model_dump(exclude_unset=True)
            for field, value in update_data.items():
                setattr(entity, field, value)
            entity.updated_at = datetime.now(timezone.utc)
            uow.servicios_internacion.add(entity)
            result = ServicioInternacionResponse.model_validate(entity)
        return result


class InternacionService:
    def __init__(self, session: Session):
        self._session = session

    def create(self, data: InternacionCreate) -> InternacionResponse:
        with UnitOfWork(self._session) as uow:
            servicio = uow.servicios_internacion.get_by_id(data.servicio_internacion_id)
            if not servicio:
                raise HTTPException(
                    status.HTTP_404_NOT_FOUND, "Servicio de internación no encontrado"
                )
            entity = uow.internaciones.add_from_schema(data)
            entity.servicio_nombre_cache = servicio.nombre_servicio
            uow.internaciones.add(entity)
            result = InternacionResponse.model_validate(entity)
        return result

    def get_filtered(self, filtro: InternacionFiltro) -> InternacionPaginatedRead:
        with UnitOfWork(self._session) as uow:
            stmt = select(Internacion)
            count_stmt = select(func.count()).select_from(Internacion)

            if filtro.estado_disponibilidad is not None:
                stmt = stmt.where(
                    Internacion.estado_disponibilidad == filtro.estado_disponibilidad
                )
                count_stmt = count_stmt.where(
                    Internacion.estado_disponibilidad == filtro.estado_disponibilidad
                )
            if filtro.servicio_id is not None:
                stmt = stmt.where(
                    Internacion.servicio_internacion_id == filtro.servicio_id
                )
                count_stmt = count_stmt.where(
                    Internacion.servicio_internacion_id == filtro.servicio_id
                )
            if filtro.query:
                like = f"%{filtro.query}%"
                expr = or_(
                    col(Internacion.sala).ilike(like),
                    col(Internacion.cama).ilike(like),
                    col(Internacion.servicio_nombre_cache).ilike(like),
                )
                stmt = stmt.where(expr)
                count_stmt = count_stmt.where(expr)

            items = uow.internaciones.session.exec(
                stmt.offset(filtro.offset).limit(filtro.limit)
            ).all()
            total = uow.internaciones.session.exec(count_stmt).one()
            data = [InternacionResponse.model_validate(i) for i in items]
        return InternacionPaginatedRead(data=data, total=total)

    def update(self, entity_id: int, data: InternacionUpdate) -> InternacionResponse:
        with UnitOfWork(self._session) as uow:
            entity = uow.internaciones.get_by_id(entity_id)
            if not entity:
                raise HTTPException(status.HTTP_404_NOT_FOUND, "Cama no encontrada")
            update_data = data.model_dump(exclude_unset=True)
            if "servicio_internacion_id" in update_data:
                servicio = uow.servicios_internacion.get_by_id(
                    update_data["servicio_internacion_id"]
                )
                if not servicio:
                    raise HTTPException(
                        status.HTTP_404_NOT_FOUND,
                        "Servicio de internación no encontrado",
                    )
                entity.servicio_nombre_cache = servicio.nombre_servicio
            for field, value in update_data.items():
                setattr(entity, field, value)
            entity.updated_at = datetime.now(timezone.utc)
            uow.internaciones.add(entity)
            result = InternacionResponse.model_validate(entity)
        return result

    def update_estado(
        self, entity_id: int, data: InternacionEstadoUpdate
    ) -> InternacionResponse:
        with UnitOfWork(self._session) as uow:
            entity = uow.internaciones.get_by_id(entity_id)
            if not entity:
                raise HTTPException(status.HTTP_404_NOT_FOUND, "Cama no encontrada")

            if entity.estado_disponibilidad == EstadoDisponibilidad.OCUPADA:
                ocupacion_activa = uow.ocupaciones.session.exec(
                    select(OcupacionPaciente).where(
                        OcupacionPaciente.internacion_id == entity_id,
                        OcupacionPaciente.estado == EstadoPaciente.INTERNADO,
                    )
                ).first()
                if ocupacion_activa:
                    raise HTTPException(
                        status.HTTP_400_BAD_REQUEST,
                        "No se puede cambiar el estado: la cama tiene un paciente internado. Debe darle el alta primero.",
                    )

            entity.estado_disponibilidad = data.estado_disponibilidad
            entity.updated_at = datetime.now(timezone.utc)
            uow.internaciones.add(entity)
            result = InternacionResponse.model_validate(entity)
        return result


class ServicioAmbulatorioService:
    def __init__(self, session: Session):
        self._session = session

    def create(self, data: ServicioAmbulatorioCreate) -> ServicioAmbulatorioResponse:
        with UnitOfWork(self._session) as uow:
            entity = uow.servicios_ambulatorios.add_from_schema(data)
            result = ServicioAmbulatorioResponse.model_validate(entity)
        return result

    def get_all(
        self, offset: int = 0, limit: int = 20
    ) -> ServicioAmbulatorioPaginatedRead:
        with UnitOfWork(self._session) as uow:
            items = uow.servicios_ambulatorios.get_all(offset, limit)
            total = uow.servicios_ambulatorios.count()
            data = [ServicioAmbulatorioResponse.model_validate(i) for i in items]
        return ServicioAmbulatorioPaginatedRead(data=data, total=total)

    def search(
        self, query: str, offset: int = 0, limit: int = 20
    ) -> ServicioAmbulatorioPaginatedRead:
        with UnitOfWork(self._session) as uow:
            items = uow.servicios_ambulatorios.search(query, offset, limit)
            total = uow.servicios_ambulatorios.count_search_results(query)
            data = [ServicioAmbulatorioResponse.model_validate(i) for i in items]
        return ServicioAmbulatorioPaginatedRead(data=data, total=total)

    def update(
        self, entity_id: int, data: ServicioAmbulatorioUpdate
    ) -> ServicioAmbulatorioResponse:
        with UnitOfWork(self._session) as uow:
            entity = uow.servicios_ambulatorios.get_by_id(entity_id)
            if not entity:
                raise HTTPException(
                    status.HTTP_404_NOT_FOUND, "Servicio ambulatorio no encontrado"
                )
            update_data = data.model_dump(exclude_unset=True)
            for field, value in update_data.items():
                setattr(entity, field, value)
            entity.updated_at = datetime.now(timezone.utc)
            uow.servicios_ambulatorios.add(entity)
            result = ServicioAmbulatorioResponse.model_validate(entity)
        return result


class OcupacionPacienteService:
    def __init__(self, session: Session):
        self._session = session

    def admit(self, data: OcupacionPacienteCreate) -> OcupacionPacienteResponse:
        with UnitOfWork(self._session) as uow:
            persona = uow.personas.get_by_id(data.persona_id)
            if not persona:
                raise HTTPException(status.HTTP_404_NOT_FOUND, "Persona no encontrada")

            internacion = uow.internaciones.get_by_id(data.internacion_id)
            if not internacion:
                raise HTTPException(status.HTTP_404_NOT_FOUND, "Cama no encontrada")
            if internacion.estado_disponibilidad != EstadoDisponibilidad.DISPONIBLE:
                raise HTTPException(
                    status.HTTP_400_BAD_REQUEST, "La cama no está disponible"
                )

            existing = uow.ocupaciones.session.exec(
                select(OcupacionPaciente).where(
                    OcupacionPaciente.persona_id == data.persona_id,
                    OcupacionPaciente.estado == EstadoPaciente.INTERNADO,
                )
            ).first()
            if existing:
                raise HTTPException(
                    status.HTTP_400_BAD_REQUEST, "La persona ya está internada"
                )

            ubicacion = f"{internacion.servicio_nombre_cache} - Sala {internacion.sala} - Cama {internacion.cama}"
            entity = OcupacionPaciente(
                persona_id=data.persona_id,
                internacion_id=data.internacion_id,
                paciente_nombre_cache=f"{persona.nombre} {persona.apellido}",
                ubicacion_cache=ubicacion,
                estado=EstadoPaciente.INTERNADO,
            )
            uow.ocupaciones.add(entity)

            internacion.estado_disponibilidad = EstadoDisponibilidad.OCUPADA
            uow.internaciones.add(internacion)

            result = OcupacionPacienteResponse.model_validate(entity)
        return result

    def _finalizar_accesos_ocupacion(self, uow: UnitOfWork, ocupacion_id: int) -> None:
        ahora = datetime.now(timezone.utc)
        accesos = uow.accesos_internacion.session.exec(
            select(AccesoInternacion).where(
                AccesoInternacion.ocupacion_paciente_id == ocupacion_id,
                AccesoInternacion.estado == EstadoAcceso.ACTIVO,
            )
        ).all()
        for a in accesos:
            a.estado = EstadoAcceso.FINALIZADO
            a.fecha_salida = ahora
            uow.accesos_internacion.add(a)

    def discharge(self, entity_id: int) -> OcupacionPacienteResponse:
        with UnitOfWork(self._session) as uow:
            entity = uow.ocupaciones.get_by_id(entity_id)
            if not entity:
                raise HTTPException(
                    status.HTTP_404_NOT_FOUND, "Ocupación no encontrada"
                )
            if entity.estado != EstadoPaciente.INTERNADO:
                raise HTTPException(
                    status.HTTP_400_BAD_REQUEST, "La ocupación ya fue finalizada"
                )

            self._finalizar_accesos_ocupacion(uow, entity_id)

            entity.estado = EstadoPaciente.ALTA
            entity.fecha_alta = datetime.now(timezone.utc)
            uow.ocupaciones.add(entity)

            internacion = uow.internaciones.get_by_id(entity.internacion_id)
            if internacion:
                internacion.estado_disponibilidad = EstadoDisponibilidad.DISPONIBLE
                uow.internaciones.add(internacion)

            result = OcupacionPacienteResponse.model_validate(entity)
        return result

    def register_death(self, entity_id: int) -> OcupacionPacienteResponse:
        with UnitOfWork(self._session) as uow:
            entity = uow.ocupaciones.get_by_id(entity_id)
            if not entity:
                raise HTTPException(
                    status.HTTP_404_NOT_FOUND, "Ocupación no encontrada"
                )
            if entity.estado != EstadoPaciente.INTERNADO:
                raise HTTPException(
                    status.HTTP_400_BAD_REQUEST, "La ocupación ya fue finalizada"
                )

            self._finalizar_accesos_ocupacion(uow, entity_id)

            entity.estado = EstadoPaciente.FALLECIDO
            entity.fecha_alta = datetime.now(timezone.utc)
            uow.ocupaciones.add(entity)

            internacion = uow.internaciones.get_by_id(entity.internacion_id)
            if internacion:
                internacion.estado_disponibilidad = EstadoDisponibilidad.DISPONIBLE
                uow.internaciones.add(internacion)

            result = OcupacionPacienteResponse.model_validate(entity)
        return result

    def get_all(
        self, offset: int = 0, limit: int = 20
    ) -> OcupacionPacientePaginatedRead:
        with UnitOfWork(self._session) as uow:
            items = uow.ocupaciones.get_all(offset, limit)
            total = uow.ocupaciones.count()
            data = [OcupacionPacienteResponse.model_validate(i) for i in items]
        return OcupacionPacientePaginatedRead(data=data, total=total)

    def get_active(
        self, offset: int = 0, limit: int = 20
    ) -> OcupacionPacientePaginatedRead:
        with UnitOfWork(self._session) as uow:
            items = uow.ocupaciones.session.exec(
                select(OcupacionPaciente)
                .where(OcupacionPaciente.estado == EstadoPaciente.INTERNADO)
                .order_by(col(OcupacionPaciente.fecha_ingreso).desc())
                .offset(offset)
                .limit(limit)
            ).all()
            total = len(
                uow.ocupaciones.session.exec(
                    select(OcupacionPaciente.id).where(
                        OcupacionPaciente.estado == EstadoPaciente.INTERNADO
                    )
                ).all()
            )
            data = [OcupacionPacienteResponse.model_validate(i) for i in items]
        return OcupacionPacientePaginatedRead(data=data, total=total)

    def search(
        self, query: str, offset: int = 0, limit: int = 20
    ) -> OcupacionPacientePaginatedRead:
        like = f"%{query}%"
        with UnitOfWork(self._session) as uow:
            items = uow.ocupaciones.session.exec(
                select(OcupacionPaciente)
                .where(
                    or_(
                        col(OcupacionPaciente.paciente_nombre_cache).ilike(like),
                        col(OcupacionPaciente.ubicacion_cache).ilike(like),
                    )
                )
                .order_by(col(OcupacionPaciente.fecha_ingreso).desc())
                .offset(offset)
                .limit(limit)
            ).all()
            total = len(
                uow.ocupaciones.session.exec(
                    select(OcupacionPaciente.id).where(
                        or_(
                            col(OcupacionPaciente.paciente_nombre_cache).ilike(like),
                            col(OcupacionPaciente.ubicacion_cache).ilike(like),
                        )
                    )
                ).all()
            )
            data = [OcupacionPacienteResponse.model_validate(i) for i in items]
        return OcupacionPacientePaginatedRead(data=data, total=total)
