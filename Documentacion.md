# DOCUMENTO DE ESPECIFICACIÓN: SISTEMA DE GESTIÓN DE VISITANTES (SGV)

## 1. Introducción y Justificación

El proyecto surge de observar una problemática real y repetitiva en los controles de acceso de diversas instituciones (como el servicio de portería y seguridad de hospitales o los ingresos a establecimientos escolares). Actualmente, este registro se realiza mediante fichas de papel, lo que provoca:

- Demoras y congestión en las entradas debido a la carga manual.
- Errores de legibilidad, inconsistencia de datos y pérdida de información.
- Imposibilidad de auditar en tiempo real quiénes se encuentran dentro del edificio o consultar historiales de manera eficiente.

## 2. Objetivo del Proyecto (Acotación del Alcance MVP)

Desarrollar una aplicación de software simple, ágil y _mobile-first_ que automatice el registro de ingresos y egresos de personas.

> ⚠️ **Límite del Alcance:** Para garantizar la viabilidad del proyecto dentro de los tiempos de la asignatura, el software se concentrará estrictamente en el **flujo de portería, control de accesos y auditoría de tiempos**. La gestión de la internación y del catálogo edilicio se simplifica para actuar como soporte del censo actual, dejando fuera la administración médica compleja (historias clínicas, gestión de insumos, etc.).

## 3. Arquitectura y Enfoque Tecnológico

- **Mobile-First / Enfoque Ergonómico:** Diseñado para que los empleados de seguridad operen desde un smartphone o tablet en constante movimiento, eliminando la necesidad de una PC fija de escritorio.
- **Zero-Print (Ecológico y Económico):** Sustituye el hardware de impresión térmica por un sistema de captura digital basado en pantallas: el visitante almacena su credencial de egreso tomando una foto al código QR generado por la app del guardia.
- **Desnormalización Táctica (Patrón Snapshot):** Para garantizar respuestas inmediatas en redes móviles y evitar consultas SQL pesadas de múltiples uniones (`JOINs`), el sistema realiza copias de datos inmutables en las tablas transaccionales al momento del registro.
- **Modularización del Backend:** El código se organizará en módulos independientes (_Auth, Persona, Internación, Visitas y Reportes_) para facilitar el mantenimiento y el desarrollo asistido por agentes de IA.

---

## 4. Flujos de Trabajo Detallados (Workflows)

El sistema divide su operación en dos flujos independientes en la portería tras el escaneo inicial de identidad:

```
                               ┌─────────────────────────┐
                               │  Escaneo DNI (PDF417)   │
                               └────────────┬────────────┘
                                            │ (Upsert Persona)
                                            ▼
                             ¿Cuál es el tipo de destino?
                                            │
                    ┌───────────────────────┴───────────────────────┐
                    ▼ (Internación)                                 ▼ (Ambulatorio)
       [Búsqueda de Cama/Paciente]                     [Selección de Servicio Fijo]
                    │                                               │
       [Registro: AccesoInternacion]                   [Registro: AccesoAmbulatorio]
                    │                                               │
       [Generación QR de Visita]                       [Generación QR de Turno]

```

### A. Proceso de Ingreso General

1. El visitante presenta su DNI tarjeta al personal de seguridad.
2. El operador presiona **"Escanear DNI"**, activando la cámara del dispositivo móvil.
3. El sistema procesa el código de barras **PDF417**, realizando un _Upsert_ automatizado en la tabla `Persona`: si el DNI no existe lo crea, y si existe recupera su perfil (_Nombre, Apellido_) instantáneamente con el destino en blanco.
4. **Bifurcación de Destino:** El guardia selecciona el tipo de ingreso según la necesidad del ciudadano:

- **Ruta de Internación:** El guardia busca al paciente alojado en el censo. El sistema detecta la ocupación activa de la cama, realiza un snapshot de los datos y solicita el _Tipo de Acceso_ (Visita, Cuidador, etc.).
- **Ruta Ambulatoria:** El guardia selecciona el área fija de destino (_Consultorios, Laboratorio, Imágenes, Guardia_) de un menú rápido.

5. El sistema confirma el ingreso y despliega un **Código QR único** en la pantalla del celular del guardia. El ingresante le toma una foto con su propio celular y avanza.

### B. Proceso de Egreso

- **Método Principal:** Al retirarse, la persona muestra la foto del QR de su celular. El operador lo escanea y el sistema registra automáticamente el _Timestamp_ de salida en la tabla correspondiente, liberando el estado.
- **Método de Contingencia:** Ante imprevistos (pérdida de foto, falta de batería), el guardia da salida buscando el perfil por DNI o Nombre directamente en la lista de personas activas dentro del edificio.

---

## 5. Modelo de Datos y Entidades

El esquema de la base de datos relacional se estructura de forma limpia, separando las identidades de los usuarios del sistema, unificando los datos biológicos en una sola tabla de personas y dividiendo los accesos transaccionales para evitar columnas muertas (`nulls`):

### A. Módulo de Autenticación (`auth`)

- **`Usuario`:** Personal autorizado para operar la aplicación.
- `id` (PK)
- `lastname / name / email`
- `username` / `password_hash`
- `role` (Guardia, Administrador)

### B. Módulo de Identidad (`persona`)

- **`Persona`:** Registro maestro único e inmutable de seres humanos en el sistema (evita duplicación de nombres entre pacientes y visitantes).
- `id` (PK)
- `dni` (Indexado / Único)
- `nombre`
- `apellido`

### C. Módulo de Infraestructura e Internación (`internacion`)

- **`Internacion`:** Catálogo físico fijo de las plazas y camas del hospital.
- `id` (PK)
- `servicio` (Ej: "Clínica Médica", "Maternidad")
- `sala` / `cama`
- `estado_disponibilidad` (Disponible, Ocupada, Mantenimiento)

- **`ServicioAmbulatorio`:** Representa los lugares físicos de atención externa que no son camas de internación.
- `id` (PK)
- `nombre_servicio` (Ej: "Radiología", "Laboratorio")
- `ubicacion_interna` (Ej: Planta Baja, Piso 1)
- `estado` (Activo/Inactivo)

- **`OcupacionPaciente`:** Tabla intermedia que rompe la relación de muchos a muchos entre personas (pacientes) y camas. Guarda el censo e historial de ocupación.
- `id` (PK)
- `persona_id` (FK a `Persona` $\rightarrow$ El paciente)
- `internacion_id` (FK a `Internacion` $\rightarrow$ La cama física)
- `paciente_nombre_cache` (Texto 📸 _Snapshot del nombre al ingresar_)
- `ubicacion_cache` (Texto 📸 _Snapshot de Sala/Cama al ingresar_)
- `fecha_ingreso` (Timestamp)
- `fecha_alta` (Timestamp, null si sigue internado)
- `estado` (Internado, Alta, Fallecido)

### D. Módulo de Accesos y Transacciones (`visit`)

- **`AccesoInternacion`:** Registro exclusivo de ingresos para visitas a camas de internados.
- `id` (PK)
- `persona_id` (FK a `Persona` $\rightarrow$ El visitante)
- `ocupacion_paciente_id` (FK a `OcupacionPaciente`)
- `paciente_nombre_cache` (Texto 📸 _Snapshot para lectura mobile ultra-rápida_)
- `ubicacion_cache` (Texto 📸 _Snapshot de la habitación al ingresar_)
- `fecha_entrada` / `fecha_salida` (Timestamps)
- `tipo_acceso` (Visita Estándar, Cuidador, Urgencia)
- `codigo_qr` (Texto único)

- **`AccesoAmbulatorio`:** Registro exclusivo de pacientes externos que acuden a servicios diarios.
- `id` (PK)
- `persona_id` (FK a `Persona` $\rightarrow$ El paciente ambulatorio)
- `servicio_ambulatorio_id` (FK a la tabla ServicioAmbulatorio)
- `servicio_nombre_cache` (Snapshot del nobre del servicio para lectura rápida)
- `fecha_entrada` / `fecha_salida` (Timestamps)
- `codigo_qr` (Texto único)

---

## 6. Reglas de Negocio Críticas

### A. Gestión Dinámica de Tiempos y Alertas

El sistema calcula el estado del acceso en tiempo real cruzando el _Timestamp_ de entrada con el tipo de registro seleccionado, disparando una **Alerta Roja ("Vencida")** en el panel móvil del guardia bajo las siguientes condiciones:

- **Visita Estándar (`AccesoInternacion`):** Margen de permanencia máximo de **2 horas**.
- **Excepción Médica / Urgencia (`AccesoInternacion`):** Margen corto de **45 minutos** (destinado a informes médicos o pases rápidos).
- **Acompañante / Cuidador (`AccesoInternacion`):** Margen extendido de **12 horas** (Régimen nocturno o de asistencia permanente).
- **Acceso Ambulatorio (`AccesoAmbulatorio`):** Margen de tolerancia de **2 horas** para la realización de turnos o análisis clínicos.

### B. Inmutabilidad Histórica mediante Snapshots

Las modificaciones operativas en el censo de camas (ej: trasladar a un paciente de la cama 3 a la cama 5) actualizarán la tabla `OcupacionPaciente` para los nuevos ingresos, pero **no alterarán los registros pasados** de la tabla `AccesoInternacion`. Gracias a las columnas de caché (`_cache`), las auditorías conservarán de forma exacta la información de a qué cama y a qué nombre fue a visitar la persona el día de su ingreso original.

### C. Regla de Cierre de Ciclos Automático

El cambio de estado de un paciente a "Alta" o "Fallecido" en la tabla `OcupacionPaciente` ejecuta dos acciones automáticas en cascada en el sistema:

1. Deniega de forma inmediata cualquier nuevo intento de registro en la portería asociado a ese paciente.
2. Localiza todos los registros de la tabla `AccesoInternacion` vinculados a ese ID que figuren con `fecha_salida IS NULL` (personas que se quedaron adentro) y les asigna el _Timestamp_ actual de forma automática con la observación _"Egreso por alta médica"_, limpiando el tablero del guardia.

---

## 7. Módulo de Reportes y Panel Móvil (`report`)

- **Dashboard de Activos:** Muestra de forma unificada la sumatoria de registros activos en `AccesoInternacion` y `AccesoAmbulatorio` para conocer instantáneamente la cantidad de civiles en el edificio.
- **Buscador Histórico:** Filtros directos por DNI, Nombre de Visitante/Paciente o rango de fechas para responder de inmediato ante auditorías legales o de la dirección del hospital.
