from sqlmodel import Session
from app.modules.user.repository import UserRepository
from app.modules.persona.repository import PersonaRepository
from app.modules.internacion.repository import (
    ServicioInternacionRepository,
    InternacionRepository,
    ServicioAmbulatorioRepository,
    OcupacionPacienteRepository,
)
from app.modules.visit.repository import (
    AccesoInternacionRepository,
    AccesoAmbulatorioRepository,
)


class UnitOfWork:
    def __init__(self, session: Session):
        self._session = session
        self.users = UserRepository(session)
        self.personas = PersonaRepository(session)
        self.servicios_internacion = ServicioInternacionRepository(session)
        self.internaciones = InternacionRepository(session)
        self.servicios_ambulatorios = ServicioAmbulatorioRepository(session)
        self.ocupaciones = OcupacionPacienteRepository(session)
        self.accesos_internacion = AccesoInternacionRepository(session)
        self.accesos_ambulatorio = AccesoAmbulatorioRepository(session)

    def __enter__(self):
        return self

    def __exit__(self, exc_type, exc_val, exc_tb) -> None:
        if exc_type is None:
            self._session.commit()
        else:
            self._session.rollback()
        self._session.close()

    def commit(self) -> None:
        self._session.commit()

    def rollback(self) -> None:
        self._session.rollback()
