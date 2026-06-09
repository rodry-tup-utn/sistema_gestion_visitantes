from fastapi import FastAPI
from app.core.database import create_db_and_tables
from app.modules.auth.router import router as auth_router
from app.modules.user.router import admin_router as user_admin_router, user_router
from app.modules.persona.router import admin_router as persona_router
from app.modules.internacion.router import (
    servicio_internacion_router,
    internacion_router,
    servicio_ambulatorio_router,
    ocupacion_router,
)
from app.modules.visit.router import router as visit_router
from contextlib import asynccontextmanager
from fastapi.middleware.cors import CORSMiddleware


@asynccontextmanager
async def lifespan(app: FastAPI):
    create_db_and_tables()
    yield


app = FastAPI(title="SGV - Sistema de Gestión de Visitantes", lifespan=lifespan)

app.include_router(auth_router)
app.include_router(user_admin_router)
app.include_router(user_router)
app.include_router(persona_router)
app.include_router(servicio_internacion_router)
app.include_router(internacion_router)
app.include_router(servicio_ambulatorio_router)
app.include_router(ocupacion_router)
app.include_router(visit_router)

origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://192.168.137.177:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
