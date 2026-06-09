from fastapi import FastAPI
from app.core.database import create_db_and_tables
from app.modules.auth.router import router as auth_router
from app.modules.user.router import admin_router, user_router
from contextlib import asynccontextmanager
from fastapi.middleware.cors import CORSMiddleware


@asynccontextmanager
async def lifespan(app: FastAPI):
    create_db_and_tables()
    yield


app = FastAPI(title="SGV - Sistema de Gestión de Visitantes", lifespan=lifespan)

app.include_router(auth_router)
app.include_router(admin_router)
app.include_router(user_router)

origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
