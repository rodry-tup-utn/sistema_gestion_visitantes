"""Seed script - Crea datos iniciales para el sistema.
Uso: python -m scripts.seed
"""

from datetime import date
from sqlmodel import Session, select
from app.core.database import engine
from app.modules.user.models import User, Role
from app.core.security import get_password_hash
from app.modules.persona.models import Persona
from app.modules.internacion.models import (
    ServicioInternacion,
    Internacion,
    ServicioAmbulatorio,
    EstadoDisponibilidad,
    EstadoServicio,
)


def seed():
    with Session(engine) as session:
        # ─── Usuario admin ───
        existing_user = session.exec(select(User)).first()
        if not existing_user:
            admin = User(
                lastname="Admin",
                name="Admin",
                email="admin@admin.com",
                hashed_pass=get_password_hash("admin123"),
                role=Role.ADMIN,
            )
            session.add(admin)
            session.commit()
            print("✓ Usuario administrador creado (admin@admin.com / admin123)")
        else:
            print("→ Usuarios ya existen, se omite creación de admin")

            # ─── Usuario operador ───
        existing_operator = session.exec(
            select(User).where(User.email == "operador@operador.com")
        ).first()
        if not existing_operator:
            oper = User(
                lastname="Operador",
                name="Operador",
                email="operador@operador.com",
                hashed_pass=get_password_hash("operador123"),
                role=Role.OPERATOR,
            )
            session.add(oper)
            session.commit()
            print("✓ Usuario operador creado (operador@test.com / operador123)")
        else:
            print("→ Operador ya existe, se omite")

        # ─── Personas ───
        existing_persona = session.exec(select(Persona)).first()
        if not existing_persona:
            personas = [
                Persona(
                    dni="12345678",
                    nombre="Juan",
                    apellido="Pérez",
                    fecha_nacimiento=date(1985, 3, 15),
                    telefono="1155550101",
                ),
                Persona(
                    dni="23456789",
                    nombre="María",
                    apellido="García",
                    fecha_nacimiento=date(1990, 7, 22),
                    telefono="1155550102",
                ),
                Persona(
                    dni="34567890",
                    nombre="Carlos",
                    apellido="López",
                    fecha_nacimiento=date(1972, 11, 8),
                    telefono="1155550103",
                ),
                Persona(
                    dni="45678901",
                    nombre="Ana",
                    apellido="Martínez",
                    fecha_nacimiento=date(1995, 1, 30),
                    telefono="1155550104",
                ),
                Persona(
                    dni="56789012",
                    nombre="Pedro",
                    apellido="Rodríguez",
                    fecha_nacimiento=date(1968, 6, 14),
                    telefono="1155550105",
                ),
            ]
            for p in personas:
                session.add(p)
            session.commit()
            print(f"✓ {len(personas)} personas creadas")
        else:
            print("→ Personas ya existen, se omite")

        # ─── Servicios de Internación ───
        existing_si = session.exec(select(ServicioInternacion)).first()
        if not existing_si:
            servicios = [
                ServicioInternacion(
                    nombre_servicio="Clínica Médica", bloque_piso="Piso 5"
                ),
                ServicioInternacion(nombre_servicio="Maternidad", bloque_piso="Piso 1"),
                ServicioInternacion(nombre_servicio="Cirugía", bloque_piso="Piso 3"),
                ServicioInternacion(nombre_servicio="Pediatría", bloque_piso="Piso 2"),
            ]
            for s in servicios:
                session.add(s)
            session.commit()

            # ─── Camas de Internación ───
            si_map = {
                s.nombre_servicio: s
                for s in session.exec(select(ServicioInternacion)).all()
            }
            camas = [
                Internacion(
                    servicio_internacion_id=si_map["Clínica Médica"].id,
                    servicio_nombre_cache=si_map["Clínica Médica"].nombre_servicio,
                    sala="501",
                    cama="1",
                ),
                Internacion(
                    servicio_internacion_id=si_map["Clínica Médica"].id,
                    servicio_nombre_cache=si_map["Clínica Médica"].nombre_servicio,
                    sala="501",
                    cama="2",
                ),
                Internacion(
                    servicio_internacion_id=si_map["Clínica Médica"].id,
                    servicio_nombre_cache=si_map["Clínica Médica"].nombre_servicio,
                    sala="502",
                    cama="1",
                ),
                Internacion(
                    servicio_internacion_id=si_map["Clínica Médica"].id,
                    servicio_nombre_cache=si_map["Clínica Médica"].nombre_servicio,
                    sala="502",
                    cama="2",
                ),
                Internacion(
                    servicio_internacion_id=si_map["Maternidad"].id,
                    servicio_nombre_cache=si_map["Maternidad"].nombre_servicio,
                    sala="101",
                    cama="1",
                ),
                Internacion(
                    servicio_internacion_id=si_map["Maternidad"].id,
                    servicio_nombre_cache=si_map["Maternidad"].nombre_servicio,
                    sala="101",
                    cama="2",
                ),
                Internacion(
                    servicio_internacion_id=si_map["Maternidad"].id,
                    servicio_nombre_cache=si_map["Maternidad"].nombre_servicio,
                    sala="101",
                    cama="3",
                ),
                Internacion(
                    servicio_internacion_id=si_map["Maternidad"].id,
                    servicio_nombre_cache=si_map["Maternidad"].nombre_servicio,
                    sala="101",
                    cama="4",
                ),
                Internacion(
                    servicio_internacion_id=si_map["Cirugía"].id,
                    servicio_nombre_cache=si_map["Cirugía"].nombre_servicio,
                    sala="301",
                    cama="1",
                    estado_disponibilidad=EstadoDisponibilidad.NO_DISPONIBLE,
                ),
                Internacion(
                    servicio_internacion_id=si_map["Cirugía"].id,
                    servicio_nombre_cache=si_map["Cirugía"].nombre_servicio,
                    sala="301",
                    cama="2",
                    estado_disponibilidad=EstadoDisponibilidad.NO_DISPONIBLE,
                ),
                Internacion(
                    servicio_internacion_id=si_map["Cirugía"].id,
                    servicio_nombre_cache=si_map["Cirugía"].nombre_servicio,
                    sala="301",
                    cama="3",
                    estado_disponibilidad=EstadoDisponibilidad.NO_DISPONIBLE,
                ),
                Internacion(
                    servicio_internacion_id=si_map["Cirugía"].id,
                    servicio_nombre_cache=si_map["Cirugía"].nombre_servicio,
                    sala="301",
                    cama="4",
                    estado_disponibilidad=EstadoDisponibilidad.NO_DISPONIBLE,
                ),
                Internacion(
                    servicio_internacion_id=si_map["Pediatría"].id,
                    servicio_nombre_cache=si_map["Pediatría"].nombre_servicio,
                    sala="201",
                    cama="1",
                ),
                Internacion(
                    servicio_internacion_id=si_map["Pediatría"].id,
                    servicio_nombre_cache=si_map["Pediatría"].nombre_servicio,
                    sala="201",
                    cama="2",
                ),
            ]
            for c in camas:
                session.add(c)
            session.commit()
            print(f"✓ {len(camas)} camas de internación creadas")
        else:
            print("→ Servicios/Camas ya existen, se omite")

        # ─── Servicios Ambulatorios ───
        existing_sa = session.exec(select(ServicioAmbulatorio)).first()
        if not existing_sa:
            ambulatorios = [
                ServicioAmbulatorio(
                    nombre_servicio="Radiología",
                    ubicacion_interna="Planta Baja",
                    estado=EstadoServicio.ACTIVO,
                ),
                ServicioAmbulatorio(
                    nombre_servicio="Laboratorio",
                    ubicacion_interna="Planta Baja",
                    estado=EstadoServicio.ACTIVO,
                ),
                ServicioAmbulatorio(
                    nombre_servicio="Anatomía Patológica",
                    ubicacion_interna="Subsuelo 1",
                    estado=EstadoServicio.ACTIVO,
                ),
                ServicioAmbulatorio(
                    nombre_servicio="Consultorios Externos",
                    ubicacion_interna="Piso 1",
                    estado=EstadoServicio.ACTIVO,
                ),
                ServicioAmbulatorio(
                    nombre_servicio="Oftalmología",
                    ubicacion_interna="Piso 1",
                    estado=EstadoServicio.ACTIVO,
                ),
            ]
            for sa in ambulatorios:
                session.add(sa)
            session.commit()
            print(f"✓ {len(ambulatorios)} servicios ambulatorios creados")
        else:
            print("→ Servicios ambulatorios ya existen, se omite")

        print("\nSeed completado.")


if __name__ == "__main__":
    seed()
