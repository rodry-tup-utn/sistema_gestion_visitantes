from fastapi import HTTPException, status
from sqlmodel import Session, select
from app.core.unit_of_work import UnitOfWork
from app.modules.visit.schemas import (
    CreateAccesoInternacionPayload,
    CreateAccesoAmbulatorioPayload,
    AccesoInternacionResponse,
    AccesoAmbulatorioResponse,
    AccesoInternacionPaginated,
    AccesoAmbulatorioPaginated,
    AccesoInternacionFiltro,
    AccesoAmbulatorioFiltro,
    AccesoVencidoItem,
    AccesoVencidoList,
    AccesoActivoItem,
    AccesoActivoList,
)
from app.modules.visit.models import EstadoAcceso, AccesoInternacion, AccesoAmbulatorio, TipoAcceso
from app.modules.internacion.models import OcupacionPaciente, EstadoPaciente
from app.modules.persona.models import Persona
from datetime import datetime, timezone
from typing import Any


def _duracion_maxima_minutos(tipo: TipoAcceso) -> int:
    match tipo:
        case TipoAcceso.URGENCIA:
            return 45
        case TipoAcceso.CUIDADOR:
            return 720  # 12h
        case _:  # VISITA_ESTANDAR, CONSULTA, ESTUDIO
            return 120  # 2h


def _calcular_vencido(fecha_ingreso: datetime) -> tuple[int, bool]:
    ahora = datetime.now(timezone.utc)
    delta = ahora - fecha_ingreso
    minutos = int(delta.total_seconds() // 60)
    return minutos


def _poblar_vencido_int(response: AccesoInternacionResponse) -> None:
    if response.fecha_salida is not None:
        return
    max_min = _duracion_maxima_minutos(response.tipo_acceso)
    transcurridos = _calcular_vencido(response.fecha_ingreso)
    response.minutos_transcurridos = transcurridos
    response.vencido = transcurridos > max_min


def _poblar_vencido_amb(response: AccesoAmbulatorioResponse) -> None:
    if response.fecha_salida is not None:
        return
    max_min = _duracion_maxima_minutos(response.tipo_acceso)
    transcurridos = _calcular_vencido(response.fecha_ingreso)
    response.minutos_transcurridos = transcurridos
    response.vencido = transcurridos > max_min


class AccesoService:
    def __init__(self, session: Session):
        self._session = session

    # ─── AccesoInternacion ───

    def crear_acceso_internacion(self, data: CreateAccesoInternacionPayload) -> AccesoInternacionResponse:
        with UnitOfWork(self._session) as uow:
            persona = uow.personas.get_by_dni(data.persona_dni)
            if not persona:
                from app.modules.persona.schemas import PersonaCreate
                persona = uow.personas.add_from_schema(PersonaCreate(
                    dni=data.persona_dni,
                    nombre=data.persona_nombre,
                    apellido=data.persona_apellido,
                ))

            ocupacion = uow.ocupaciones.get_by_id(data.ocupacion_paciente_id)
            if not ocupacion:
                raise HTTPException(status.HTTP_404_NOT_FOUND, "Ocupación no encontrada")
            if ocupacion.estado != EstadoPaciente.INTERNADO:
                raise HTTPException(status.HTTP_400_BAD_REQUEST, "El paciente no está internado")

            internacion = uow.internaciones.get_by_id(ocupacion.internacion_id)
            if not internacion:
                raise HTTPException(status.HTTP_404_NOT_FOUND, "Cama no encontrada")

            entity = AccesoInternacion(
                persona_id=persona.id,
                ocupacion_paciente_id=data.ocupacion_paciente_id,
                internacion_id=ocupacion.internacion_id,
                tipo_acceso=data.tipo_acceso,
                persona_nombre_cache=f"{persona.nombre} {persona.apellido}",
                paciente_nombre_cache=ocupacion.paciente_nombre_cache,
                ubicacion_cache=ocupacion.ubicacion_cache,
            )
            uow.accesos_internacion.add(entity)
            result = AccesoInternacionResponse.model_validate(entity)
            _poblar_vencido_int(result)
        return result

    def finalizar_acceso_internacion(self, acceso_id: int) -> AccesoInternacionResponse:
        with UnitOfWork(self._session) as uow:
            entity = uow.accesos_internacion.get_by_id(acceso_id)
            if not entity:
                raise HTTPException(status.HTTP_404_NOT_FOUND, "Acceso no encontrado")
            if entity.estado != EstadoAcceso.ACTIVO:
                raise HTTPException(status.HTTP_400_BAD_REQUEST, "El acceso ya fue finalizado")
            entity.estado = EstadoAcceso.FINALIZADO
            entity.fecha_salida = datetime.now(timezone.utc)
            uow.accesos_internacion.add(entity)
            result = AccesoInternacionResponse.model_validate(entity)
        return result

    def renovar_acceso_internacion(self, acceso_id: int) -> AccesoInternacionResponse:
        with UnitOfWork(self._session) as uow:
            entity = uow.accesos_internacion.get_by_id(acceso_id)
            if not entity:
                raise HTTPException(status.HTTP_404_NOT_FOUND, "Acceso no encontrado")
            if entity.estado != EstadoAcceso.ACTIVO:
                raise HTTPException(status.HTTP_400_BAD_REQUEST, "El acceso ya fue finalizado")
            entity.fecha_ingreso = datetime.now(timezone.utc)
            uow.accesos_internacion.add(entity)
            result = AccesoInternacionResponse.model_validate(entity)
            _poblar_vencido_int(result)
        return result

    def get_accesos_internacion(self, filtro: AccesoInternacionFiltro) -> AccesoInternacionPaginated:
        with UnitOfWork(self._session) as uow:
            if filtro.persona_id is not None:
                items = uow.accesos_internacion.get_by_persona(filtro.persona_id, filtro.activos)
                total = len(items)
            elif filtro.query:
                items = uow.accesos_internacion.search(filtro.query, filtro.offset, filtro.limit)
                total = uow.accesos_internacion.count_search_results(filtro.query)
            elif filtro.activos:
                items = self._session.exec(
                    select(AccesoInternacion)
                    .where(AccesoInternacion.estado == EstadoAcceso.ACTIVO)
                    .order_by(AccesoInternacion.fecha_ingreso.desc())
                    .offset(filtro.offset).limit(filtro.limit)
                ).all()
                total = uow.accesos_internacion.count_activos()
            else:
                items = uow.accesos_internacion.get_all(filtro.offset, filtro.limit)
                total = uow.accesos_internacion.count()
            data = [AccesoInternacionResponse.model_validate(i) for i in items]
            for r in data:
                _poblar_vencido_int(r)
        return AccesoInternacionPaginated(data=data, total=total)

    # ─── AccesoAmbulatorio ───

    def crear_acceso_ambulatorio(self, data: CreateAccesoAmbulatorioPayload) -> AccesoAmbulatorioResponse:
        with UnitOfWork(self._session) as uow:
            persona = uow.personas.get_by_dni(data.persona_dni)
            if not persona:
                from app.modules.persona.schemas import PersonaCreate
                persona = uow.personas.add_from_schema(PersonaCreate(
                    dni=data.persona_dni,
                    nombre=data.persona_nombre,
                    apellido=data.persona_apellido,
                ))

            servicio = uow.servicios_ambulatorios.get_by_id(data.servicio_ambulatorio_id)
            if not servicio:
                raise HTTPException(status.HTTP_404_NOT_FOUND, "Servicio ambulatorio no encontrado")

            entity = AccesoAmbulatorio(
                persona_id=persona.id,
                servicio_ambulatorio_id=data.servicio_ambulatorio_id,
                tipo_acceso=data.tipo_acceso,
                persona_nombre_cache=f"{persona.nombre} {persona.apellido}",
                servicio_nombre_cache=servicio.nombre_servicio,
            )
            uow.accesos_ambulatorio.add(entity)
            result = AccesoAmbulatorioResponse.model_validate(entity)
            _poblar_vencido_amb(result)
        return result

    def finalizar_acceso_ambulatorio(self, acceso_id: int) -> AccesoAmbulatorioResponse:
        with UnitOfWork(self._session) as uow:
            entity = uow.accesos_ambulatorio.get_by_id(acceso_id)
            if not entity:
                raise HTTPException(status.HTTP_404_NOT_FOUND, "Acceso no encontrado")
            if entity.estado != EstadoAcceso.ACTIVO:
                raise HTTPException(status.HTTP_400_BAD_REQUEST, "El acceso ya fue finalizado")
            entity.estado = EstadoAcceso.FINALIZADO
            entity.fecha_salida = datetime.now(timezone.utc)
            uow.accesos_ambulatorio.add(entity)
            result = AccesoAmbulatorioResponse.model_validate(entity)
        return result

    def renovar_acceso_ambulatorio(self, acceso_id: int) -> AccesoAmbulatorioResponse:
        with UnitOfWork(self._session) as uow:
            entity = uow.accesos_ambulatorio.get_by_id(acceso_id)
            if not entity:
                raise HTTPException(status.HTTP_404_NOT_FOUND, "Acceso no encontrado")
            if entity.estado != EstadoAcceso.ACTIVO:
                raise HTTPException(status.HTTP_400_BAD_REQUEST, "El acceso ya fue finalizado")
            entity.fecha_ingreso = datetime.now(timezone.utc)
            uow.accesos_ambulatorio.add(entity)
            result = AccesoAmbulatorioResponse.model_validate(entity)
            _poblar_vencido_amb(result)
        return result

    def get_accesos_ambulatorio(self, filtro: AccesoAmbulatorioFiltro) -> AccesoAmbulatorioPaginated:
        with UnitOfWork(self._session) as uow:
            if filtro.persona_id is not None:
                items = uow.accesos_ambulatorio.get_by_persona(filtro.persona_id, filtro.activos)
                total = len(items)
            elif filtro.query:
                items = uow.accesos_ambulatorio.search(filtro.query, filtro.offset, filtro.limit)
                total = uow.accesos_ambulatorio.count_search_results(filtro.query)
            elif filtro.activos:
                items = self._session.exec(
                    select(AccesoAmbulatorio)
                    .where(AccesoAmbulatorio.estado == EstadoAcceso.ACTIVO)
                    .order_by(AccesoAmbulatorio.fecha_ingreso.desc())
                    .offset(filtro.offset).limit(filtro.limit)
                ).all()
                total = uow.accesos_ambulatorio.count_activos()
            else:
                items = uow.accesos_ambulatorio.get_all(filtro.offset, filtro.limit)
                total = uow.accesos_ambulatorio.count()
            data = [AccesoAmbulatorioResponse.model_validate(i) for i in items]
            for r in data:
                _poblar_vencido_amb(r)
        return AccesoAmbulatorioPaginated(data=data, total=total)

    def get_accesos_vencidos(self, offset: int = 0, limit: int = 50) -> AccesoVencidoList:
        with UnitOfWork(self._session) as uow:
            ahora = datetime.now(timezone.utc)
            items_int = self._session.exec(
                select(AccesoInternacion)
                .where(AccesoInternacion.estado == EstadoAcceso.ACTIVO)
            ).all()
            items_amb = self._session.exec(
                select(AccesoAmbulatorio)
                .where(AccesoAmbulatorio.estado == EstadoAcceso.ACTIVO)
            ).all()

            vencidos: list[AccesoVencidoItem] = []
            for a in items_int:
                max_min = _duracion_maxima_minutos(a.tipo_acceso)
                transcurridos = int((ahora - a.fecha_ingreso).total_seconds() // 60)
                if transcurridos > max_min:
                    vencidos.append(AccesoVencidoItem(
                        id=a.id,
                        tipo="internacion",
                        persona_nombre_cache=a.persona_nombre_cache,
                        destino_cache=a.ubicacion_cache,
                        tipo_acceso=a.tipo_acceso,
                        fecha_ingreso=a.fecha_ingreso,
                        minutos_transcurridos=transcurridos,
                    ))
            for a in items_amb:
                max_min = _duracion_maxima_minutos(a.tipo_acceso)
                transcurridos = int((ahora - a.fecha_ingreso).total_seconds() // 60)
                if transcurridos > max_min:
                    vencidos.append(AccesoVencidoItem(
                        id=a.id,
                        tipo="ambulatorio",
                        persona_nombre_cache=a.persona_nombre_cache,
                        destino_cache=a.servicio_nombre_cache,
                        tipo_acceso=a.tipo_acceso,
                        fecha_ingreso=a.fecha_ingreso,
                        minutos_transcurridos=transcurridos,
                    ))

            vencidos.sort(key=lambda x: x.minutos_transcurridos, reverse=True)
            total = len(vencidos)
            paginated = vencidos[offset:offset + limit]
        return AccesoVencidoList(data=paginated, total=total)

    def get_activos(
        self,
        query: str | None = None,
        dni: str | None = None,
        tipo_acceso: str | None = None,
        offset: int = 0,
        limit: int = 50,
    ) -> AccesoActivoList:
        ahora = datetime.now(timezone.utc)

        int_results = self._session.exec(
            select(AccesoInternacion, Persona.dni)
            .join(Persona, AccesoInternacion.persona_id == Persona.id)
            .where(AccesoInternacion.estado == EstadoAcceso.ACTIVO)
        ).all()

        aml_results = self._session.exec(
            select(AccesoAmbulatorio, Persona.dni)
            .join(Persona, AccesoAmbulatorio.persona_id == Persona.id)
            .where(AccesoAmbulatorio.estado == EstadoAcceso.ACTIVO)
        ).all()

        items: list[AccesoActivoItem] = []

        for acceso, p_dni in int_results:
            max_min = _duracion_maxima_minutos(acceso.tipo_acceso)
            transcurridos = int((ahora - acceso.fecha_ingreso).total_seconds() // 60)
            items.append(AccesoActivoItem(
                id=acceso.id,
                tipo="internacion",
                persona_nombre_cache=acceso.persona_nombre_cache,
                persona_dni=p_dni,
                destino_cache=acceso.ubicacion_cache,
                tipo_acceso=acceso.tipo_acceso.value,
                fecha_ingreso=acceso.fecha_ingreso,
                minutos_transcurridos=transcurridos,
                vencido=transcurridos > max_min,
            ))

        for acceso, p_dni in aml_results:
            max_min = _duracion_maxima_minutos(acceso.tipo_acceso)
            transcurridos = int((ahora - acceso.fecha_ingreso).total_seconds() // 60)
            items.append(AccesoActivoItem(
                id=acceso.id,
                tipo="ambulatorio",
                persona_nombre_cache=acceso.persona_nombre_cache,
                persona_dni=p_dni,
                destino_cache=acceso.servicio_nombre_cache,
                tipo_acceso=acceso.tipo_acceso.value,
                fecha_ingreso=acceso.fecha_ingreso,
                minutos_transcurridos=transcurridos,
                vencido=transcurridos > max_min,
            ))

        if query:
            q = query.lower()
            items = [i for i in items if q in i.persona_nombre_cache.lower() or q in i.destino_cache.lower()]
        if dni:
            items = [i for i in items if dni in i.persona_dni]
        if tipo_acceso:
            items = [i for i in items if i.tipo_acceso == tipo_acceso]

        items.sort(key=lambda x: x.fecha_ingreso, reverse=True)
        total = len(items)
        paginated = items[offset:offset + limit]
        return AccesoActivoList(data=paginated, total=total)
