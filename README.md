<div align="center">

# 🏥 SGV — Sistema de Gestión de Visitantes

**Aplicación web para la gestión de visitas hospitalarias, ingresos a internación y servicios ambulatorios.**

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)

<br>

</div>

<br>

## 🌐 Deploy

| Componente                | URL                                                                            |
| ------------------------- | ------------------------------------------------------------------------------ |
| **Frontend**              | [https://sgv-frontend-seven.vercel.app](https://sgv-frontend-seven.vercel.app) |
| **Backend API**           | [https://sgv-backend-w6en.onrender.com](https://sgv-backend-w6en.onrender.com) |
| **Documentación Swagger** | [`/docs`](https://sgv-backend-w6en.onrender.com/docs)                          |

 <br>

## 👤 Alumnos

- **Ramirez, Rodrigo**
- **Mercado, Leandro**

## 📸 Capturas de Pantalla

> Ver todas las capturas en [`SCREENSHOTS.md`](./SCREENSHOTS.md).

---

## ✨ Funcionalidades

- **Autenticación segura** — Login con JWT y roles (`admin` / `user`)
- **Gestión de usuarios** — ABM de operadores del sistema
- **Registro de personas** — Base de datos de pacientes y visitantes
- **Servicios de internación** — Administración de servicios hospitalarios
- **Camas** — Control de camas disponibles y ocupadas
- **Servicios ambulatorios** — Gestión de consultorios y turnos externos
- **Ocupación hospitalaria** — Vista general del estado de camas y servicios
- **Módulo de portería** — Ingreso de visitas a internación y ambulatorios
- **Visitantes activos** — Listado en tiempo real de visitas en curso
- **Alertas** — Notificaciones por visitas vencidas o fuera de horario
- **Búsqueda y paginación** — Filtros y navegación en todas las listas

---

## 🧱 Tecnologías

### Frontend — `client/`

![React](https://img.shields.io/badge/React-20232A?logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-646CFF?logo=vite&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4?logo=tailwindcss&logoColor=white)

| Librería                                      | Uso                               |
| --------------------------------------------- | --------------------------------- |
| [React 19](https://react.dev/)                | UI declarativa con hooks          |
| [TypeScript](https://www.typescriptlang.org/) | Tipado estático                   |
| [Vite](https://vite.dev/)                     | Build tool y dev server           |
| [Tailwind CSS v4](https://tailwindcss.com/)   | Estilos utilitarios               |
| [React Router v7](https://reactrouter.com/)   | Enrutamiento SPA                  |
| [TanStack Query](https://tanstack.com/query)  | Fetching y caché del lado cliente |
| [Axios](https://axios-http.com/)              | HTTP client                       |
| [Lucide React](https://lucide.dev/)           | Iconos SVG                        |
| [Sonner](https://sonner.emilkowal.ski/)       | Toast notifications               |

### Backend — `server/`

![Python](https://img.shields.io/badge/Python-3776AB?logo=python&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-009688?logo=fastapi&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?logo=postgresql&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-2496ED?logo=docker&logoColor=white)

| Librería                                                                               | Uso                       |
| -------------------------------------------------------------------------------------- | ------------------------- |
| [FastAPI](https://fastapi.tiangolo.com/)                                               | Framework REST con tipado |
| [SQLModel](https://sqlmodel.tiangolo.com/)                                             | ORM + Pydantic unificados |
| [PostgreSQL 15](https://www.postgresql.org/)                                           | Base de datos relacional  |
| [PyJWT](https://github.com/jpadilla/pyjwt/)                                            | Tokens JWT                |
| [Passlib](https://passlib.readthedocs.io/) + [bcrypt](https://github.com/pyca/bcrypt/) | Hashing de contraseñas    |
| [Uvicorn](https://www.uvicorn.org/)                                                    | Servidor ASGI             |

---

## 📁 Estructura del Proyecto

```
sistema_gestion_visitantes/
├── client/                          # Frontend React + Vite
│   └── src/
│       ├── features/
│       │   ├── admin/               # Gestión de usuarios
│       │   ├── auth/                # Login y contexto de autenticación
│       │   ├── camas/               # Camas de internación
│       │   ├── ocupacion/           # Ocupación hospitalaria
│       │   ├── personas/            # Registro de personas
│       │   ├── servicios-ambulatorios/  # Consultorios externos
│       │   ├── servicios-internacion/   # Servicios de internación
│       │   └── visit/               # Módulo de portería
│       └── shared/                  # Componentes, hooks, tipos reutilizables
│
├── server/                          # Backend FastAPI
│   ├── app/
│   │   ├── core/                    # Configuración, BD, seguridad, repositorio
│   │   └── modules/
│   │       ├── auth/                # Autenticación y registro
│   │       ├── user/                # CRUD de usuarios
│   │       ├── persona/             # CRUD de personas
│   │       ├── internacion/         # Servicios, camas, ocupación
│   │       └── visit/               # Gestión de visitas
│   ├── scripts/                     # Seed de datos
│   └── docker-compose.yml           # Contenedor PostgreSQL
│
├── Makefile                         # Comando único: make dev
└── README.md
```

---

## 🚀 Cómo Empezar

### Requisitos

- Node.js ≥ 18 + **pnpm** (o npm)
- Python ≥ 3.12
- Docker + Docker Compose

### Levantar todo con un solo comando

```bash
make dev
```

Esto ejecuta:

1. `server/` — Crea el virtualenv, instala dependencias, levanta PostgreSQL con Docker y corre la API con Uvicorn.
2. `client/` — Instala dependencias e inicia el dev server de Vite.

### Manualmente

**Backend**

```bash
cd server
make init     # virtualenv + pip install + docker compose up -d
make run      # uvicorn app.main:app --reload
```

**Frontend**

```bash
cd client
pnpm install
pnpm dev
```

La API corre en `http://localhost:8000` y el frontend en `http://localhost:5173`.

---

<div align="center">

Desarrollado como proyecto de la cátedra **Gestión de Software** — UTN FRGP

</div>
