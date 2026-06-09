"""Seed script - Crea el primer usuario administrador si la tabla está vacía.
Uso: python -m scripts.seed
"""

from sqlmodel import Session, select
from app.core.database import engine
from app.modules.user.models import User, Role
from app.core.security import get_password_hash


def seed():
    with Session(engine) as session:
        existing = session.exec(select(User)).first()
        if existing:
            print("Ya existen usuarios en la base de datos. Seed omitido.")
            return

        admin = User(
            lastname="Admin",
            name="Admin",
            email="admin@admin.com",
            hashed_pass=get_password_hash("admin123"),
            role=Role.ADMIN,
        )
        session.add(admin)
        session.commit()
        print("Usuario administrador creado exitosamente:")
        print("  Email: admin@admin.com")
        print("  Password: admin123")


if __name__ == "__main__":
    seed()
