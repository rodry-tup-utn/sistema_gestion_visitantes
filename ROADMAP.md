# Roadmap — SGV (Sistema de Gestión de Visitantes)

## ETAPA 1 — Autenticación y Usuarios  ✅
- [x] Login con JWT y cookie
- [x] Logout (eliminar cookie)
- [x] Vista de Login (Frontend)
- [x] Roles: ADMIN / OPERATOR
- [x] Perfil de usuario (ver + editar + cambiar contraseña)
- [x] Admin: CRUD de usuarios
- [x] Admin: Reset de contraseña de usuario
- **Módulos:** `auth/`, `user/`

## ETAPA 2 — Infraestructura y Clientes  ✅
- [x] ABM Personas
- [x] ABM Camas de Internación
- [x] ABM Servicios de Internación
- [x] ABM Servicios Ambulatorios
- **Módulos:** `persona/`, `internacion/`, `servicio_ambulatorio/`

## ETAPA 3 — Ocupación de Camas  ✅
- [x] Admitir paciente con búsqueda por DNI
- [x] Selección de cama disponible
- [x] Dar de alta
- [x] Registrar fallecimiento
- [x] Cambio de cama
- [x] Vista de pacientes activos / todos con paginación
- **Módulos:** `ocupacion/`

## ETAPA 4 — Portería: Ingresos  ✅
- [x] Ingreso a Internación (búsqueda de paciente + cama, genera acceso)
- [x] Ingreso Ambulatorio (búsqueda de paciente + servicio, genera acceso)
- [x] Tipos de acceso: Visita Estándar, Cuidador, Urgencia, Consulta, Estudio
- **Módulos:** `visit/`

## ETAPA 5 — Portería: Egresos y Alertas  ⏳
- [x] Egreso de acceso activo
- [x] Renovación de acceso
- [x] Alertas de accesos vencidos
- [ ] Salidas de contingencia
- **Módulos:** `visit/`

## ETAPA 6 — Reportes y Dashboard  🔜
- [ ] Dashboard de visitantes activos en tiempo real
- [ ] Buscador histórico de accesos
- [ ] Reportes exportables
- **Módulos:** *(pendiente)*

---

### Convenciones
| Símbolo | Significado |
|---------|-------------|
| ✅ | Completado |
| ⏳ | En progreso |
| 🔜 | Pendiente |
