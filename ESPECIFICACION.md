# ESPECIFICACIÓN: SISTEMA DE GESTIÓN DE VISITANTES (SGV)

## 1. Introducción y Justificación

El proyecto surge de observar una problemática real y repetitiva en los controles de acceso de diversas instituciones (como el servicio de portería y seguridad de hospitales o los ingresos a establecimientos escolares). Actualmente, este registro se realiza mediante fichas de papel, lo que provoca:

- Demoras y congestión en las entradas debido a la carga manual.
- Errores de legibilidad, inconsistencia de datos y pérdida de información.
- Imposibilidad de auditar en tiempo real quiénes se encuentran dentro del edificio o consultar historiales de manera eficiente.

## 2. Objetivo del Proyecto (Acotación del Alcance MVP)

Desarrollar una aplicación de software simple, ágil y _mobile-first_ que automatice el registro de ingresos y egresos de personas.

> ⚠️ **Límite del Alcance:** Para garantizar la viabilidad del proyecto dentro de los tiempos de la asignatura, el software se concentrará estrictamente en el **flujo de portería, control de accesos y auditoría de tiempos**. La gestión de la internación y del catálogo edilicio se simplifica para actuar como soporte del censo actual, dejando fuera la administración médica compleja (historias clínicas, gestión de insumos, etc.).
>
> Características como el escaneo automático de DNI (PDF417), la generación de códigos QR y el egreso vía QR quedan fuera del MVP actual y se listan como mejoras futuras.

## 3. Arquitectura y Enfoque Tecnológico

- **Mobile-First / Enfoque Ergonómico:** Diseñado para que los empleados de seguridad operen desde un smartphone o tablet en constante movimiento, eliminando la necesidad de una PC fija de escritorio.
- **Desnormalización Táctica (Patrón Snapshot):** Para garantizar respuestas inmediatas en redes móviles y evitar consultas SQL pesadas de múltiples uniones (`JOINs`), el sistema realiza copias de datos inmutables en las tablas transaccionales al momento del registro (columnas `*_cache`).
- **Modularización del Backend:** El código se organizará en módulos independientes (_Auth, User, Persona, Internación, Visitas_) para facilitar el mantenimiento y el desarrollo asistido por agentes de IA.

### Stack Tecnológico

**Frontend:**
- **React 19** + **TypeScript** (~6.0)
- **Vite 8** (build tool)
- **Tailwind CSS 4** (estilos utilitarios)
- **TanStack Query 5** (estado del servidor y caché)
- **Axios** (cliente HTTP)
- **React Router DOM 7** (ruteo SPA)
- **Lucide React** (iconos SVG)
- **Sonner** (notificaciones toast)

**Backend:**
- **FastAPI** (framework web ASGI)
- **SQLModel** (ORM sobre SQLAlchemy + Pydantic)
- **PostgreSQL** (base de datos relacional)
- **PyJWT** (tokens JWT)
- **Passlib + bcrypt** (hashing de contraseñas)
- **pydantic-settings** (configuración por variables de entorno)

**Infraestructura:**
- **GitHub Actions** (CI: type-check y lint)
- **Render** (hosting del backend)
- **Vercel** (hosting del frontend)

### Roles del Sistema

| Rol | Acceso |
|-----|--------|
| **ADMIN** | CRUD de usuarios, reset de contraseñas, ABM completo de personas, camas y servicios. Acceso a todos los módulos del sistema. |
| **OPERATOR** | Gestión de portería: ingresos, egresos, renovación de accesos, consulta de visitantes activos y alertas. No puede modificar catálogos. |

---

## 4. Flujos de Trabajo Detallados (Workflows)

El sistema divide su operación en dos flujos independientes en la portería tras la identificación inicial de la persona:

```
                               ┌─────────────────────────┐
                               │  Ingreso manual de DNI  │
                               └────────────┬────────────┘
                                            │ (Buscar/Crear Persona)
                                            ▼
                             ¿Cuál es el tipo de destino?
                                            │
                    ┌───────────────────────┴───────────────────────┐
                    ▼ (Internación)                                 ▼ (Ambulatorio)
       [Selección de paciente internado]                [Selección de Servicio]
                    │                                               │
       [Selección de Tipo de Acceso]                    [Selección de Tipo de Acceso]
                    │                                               │
       [Registro: AccesoInternacion]                   [Registro: AccesoAmbulatorio]
                    │                                               │
         [Redirección a lista de activos]              [Redirección a lista de activos]

```

### A. Proceso de Ingreso General

1. El visitante presenta su DNI al personal de seguridad.
2. El operador **ingresa el número de DNI** manualmente en un campo de texto.
3. El sistema busca a la persona por DNI:
   - Si **existe**, recupera su perfil (_Nombre, Apellido_) y lo muestra en pantalla.
   - Si **no existe**, se abre un formulario para crear la persona (con el DNI ya precargado).
4. **Bifurcación de Destino:** El guardia selecciona el tipo de ingreso según la necesidad del ciudadano:
   - **Ruta de Internación:** El guardia selecciona al paciente internado que será visitado (búsqueda por nombre entre los pacientes activos). Luego elige el _Tipo de Acceso_ (Visita Estándar, Cuidador, Urgencia).
   - **Ruta Ambulatoria:** El guardia selecciona el servicio ambulatorio de destino (_Consultorios, Laboratorio, Radiología, etc._) y el _Tipo de Acceso_ (Consulta o Estudio).
5. El sistema confirma el ingreso y redirige al panel de visitantes activos.

### B. Proceso de Egreso

1. El operador ingresa el **DNI del visitante** en el campo de búsqueda.
2. El sistema muestra todos los accesos activos de esa persona (puede tener múltiples si ingresó varias veces).
3. Para cada acceso activo se muestra: tipo (Internación/Ambulatorio), paciente/servicio visitado, ubicación, timestamp de ingreso y un badge de estado (Activo o Vencido).
4. El operador presiona **"Finalizar"** sobre el acceso correspondiente.
5. El sistema registra el timestamp de salida y marca el acceso como finalizado.
6. Si el acceso está **vencido** (excedió el tiempo máximo según el tipo), el badge se muestra en rojo y aparece un botón **"Renovar"** que reinicia el contador de tiempo.

---

## 5. Modelo de Datos y Entidades

El esquema de la base de datos relacional se estructura de forma limpia, separando las identidades de los usuarios del sistema, unificando los datos biológicos en una sola tabla de personas y dividiendo los accesos transaccionales para evitar columnas muertas (`nulls`):

### A. Módulo de Autenticación (`auth`)

- **`Usuario`:** Personal autorizado para operar la aplicación.
- `id` (PK)
- `lastname` / `name` / `email` (único, usado como identificador de login)
- `hashed_pass` (contraseña hasheada con bcrypt)
- `role` (`ADMIN`, `OPERATOR`)
- `is_active` (bool, permite desactivar usuarios sin borrarlos)
- `created_at` / `updated_at` (timestamps)

### B. Módulo de Identidad (`persona`)

- **`Persona`:** Registro maestro único e inmutable de seres humanos en el sistema (evita duplicación de nombres entre pacientes y visitantes).
- `id` (PK)
- `dni` (Indexado / Único)
- `nombre`
- `apellido`
- `fecha_nacimiento` (Fecha de nacimiento)
- `telefono` (Teléfono de contacto)
- `created_at` / `updated_at`

### C. Módulo de Infraestructura e Internación (`internacion`)

- **`ServicioInternacion`:** Catálogo fijo de servicios médicos que poseen camas de internación.
- `id` (PK)
- `nombre_servicio` (Ej: "Clínica Médica", "Maternidad")
- `bloque_piso` (Ej: "Piso 1", "Piso 2")

- **`Internacion` (cama):** Catálogo físico fijo de camas del hospital, asociadas a un servicio.
- `id` (PK)
- `servicio_internacion_id` (FK a `ServicioInternacion`)
- `servicio_nombre_cache` (📸 Snapshot del nombre del servicio al crear la cama)
- `sala` / `cama`
- `estado_disponibilidad` (Disponible, Ocupada, Mantenimiento, No Disponible)

- **`ServicioAmbulatorio`:** Representa los lugares físicos de atención externa que no son camas de internación.
- `id` (PK)
- `nombre_servicio` (Ej: "Radiología", "Laboratorio")
- `ubicacion_interna` (Ej: Planta Baja, Piso 1)
- `estado` (Activo/Inactivo)

- **`OcupacionPaciente`:** Tabla intermedia que rompe la relación de muchos a muchos entre personas (pacientes) y camas. Guarda el censo e historial de ocupación.
- `id` (PK)
- `persona_id` (FK a `Persona` → El paciente)
- `internacion_id` (FK a `Internacion` → La cama física)
- `paciente_nombre_cache` (📸 Snapshot del nombre al ingresar)
- `ubicacion_cache` (📸 Snapshot de Sala/Cama al ingresar)
- `fecha_ingreso` (Timestamp de internación)
- `fecha_alta` (Timestamp, null si sigue internado)
- `estado` (Internado, Alta, Fallecido)

### D. Módulo de Accesos y Transacciones (`visit`)

- **`AccesoInternacion`:** Registro de ingresos para visitas a pacientes internados.
- `id` (PK)
- `persona_id` (FK a `Persona` → El visitante)
- `ocupacion_paciente_id` (FK a `OcupacionPaciente`)
- `internacion_id` (FK a `Internacion`)
- `tipo_acceso` (Visita Estándar, Cuidador, Urgencia)
- `fecha_ingreso` / `fecha_salida` (Timestamps; `salida` es null si sigue activo)
- `estado` (Activo, Finalizado)
- `persona_nombre_cache` (📸 Snapshot del nombre del visitante)
- `paciente_nombre_cache` (📸 Snapshot del nombre del paciente internado)
- `ubicacion_cache` (📸 Snapshot de la ubicación de la cama)

- **`AccesoAmbulatorio`:** Registro de ingresos para servicios ambulatorios.
- `id` (PK)
- `persona_id` (FK a `Persona` → El paciente ambulatorio)
- `servicio_ambulatorio_id` (FK a `ServicioAmbulatorio`)
- `tipo_acceso` (Consulta, Estudio)
- `fecha_ingreso` / `fecha_salida` (Timestamps; `salida` es null si sigue activo)
- `estado` (Activo, Finalizado)
- `persona_nombre_cache` (📸 Snapshot del nombre del visitante)
- `servicio_nombre_cache` (📸 Snapshot del nombre del servicio)

---

## 6. Reglas de Negocio Críticas

### A. Gestión Dinámica de Tiempos y Alertas

El sistema calcula el estado del acceso en tiempo real cruzando el _Timestamp_ de entrada con el tipo de registro seleccionado, mostrando una **Alerta Roja ("Vencida")** en el panel del guardia bajo las siguientes condiciones:

| Tipo de Acceso | Aplica a | Duración máxima |
|----------------|----------|----------------|
| **Visita Estándar** | AccesoInternacion | 2 horas (120 min) |
| **Urgencia** | AccesoInternacion | 45 minutos |
| **Cuidador** | AccesoInternacion | 12 horas (720 min) |
| **Consulta / Estudio** | AccesoAmbulatorio | 2 horas (120 min) |

### B. Inmutabilidad Histórica mediante Snapshots

Las modificaciones operativas en el censo de camas (ej: trasladar a un paciente de la cama 3 a la cama 5) actualizarán la tabla `OcupacionPaciente` para los nuevos ingresos, pero **no alterarán los registros pasados** de la tabla `AccesoInternacion`. Gracias a las columnas de caché (`_cache`), las auditorías conservarán de forma exacta la información de a qué cama y a qué nombre fue a visitar la persona el día de su ingreso original.

### C. Regla de Cierre de Ciclos Automático

El cambio de estado de un paciente a "Alta" o "Fallecido" en la tabla `OcupacionPaciente` ejecuta dos acciones automáticas en cascada en el sistema:

1. Deniega de forma inmediata cualquier nuevo intento de registro en la portería asociado a ese paciente.
2. Localiza todos los registros de la tabla `AccesoInternacion` vinculados a ese ID que figuren con `fecha_salida IS NULL` (personas que se quedaron adentro) y les asigna el _Timestamp_ actual de forma automática, limpiando el tablero del guardia.

---

## 7. Módulo de Reportes y Panel Móvil (`report`) — 🔜 PENDIENTE

> Este módulo no está implementado en la versión actual del MVP. Se lista como objetivo para futuras iteraciones.

- **Dashboard de Activos:** Mostrar de forma unificada la sumatoria de registros activos en `AccesoInternacion` y `AccesoAmbulatorio` para conocer instantáneamente la cantidad de civiles en el edificio.
- **Buscador Histórico:** Filtros directos por DNI, Nombre de Visitante/Paciente o rango de fechas para responder de inmediato ante auditorías legales o de la dirección del hospital.
- **Reportes exportables:** Generación de reportes en PDF/CSV.
