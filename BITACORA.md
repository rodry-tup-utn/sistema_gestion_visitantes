# Bitácora Técnica — Sistema de Gestión de Visitantes

## 🤖 Arsenal de Herramientas de IA

- **OpenCode (modelo big-pickle)**: Asistente principal usado durante todo el desarrollo. Se interactuó vía CLI en una terminal.
- Descripción del rol: generación de código, refactors, debugging, planificación de features, y diseño de UI/UX.

## 🤝 Sinergia con la IA

### Programación
- Creación rápida de páginas completas (Profile, AdmitirForm con búsqueda por DNI, restablecer contraseña).
- Generación de componentes consistentes con el código existente (Cards con iconos, borders laterales, modales).

### Depuración
- Detección y corrección de errores de TypeScript al instante.
- Identificación de problemas de estado en formularios (ej: `useForm` no re-inicializaba con `initialData`).

### Testing / Verificación
- Verificación continua con `npx tsc --noEmit` tras cada cambio.
- Validación de sintaxis Python con `py_compile`.

### Diseño UI
- Mejora estética consistente: íconos con lucide-react, paleta teal/indigo/purple, bordes laterales en cards.
- Adaptación responsive del header.

## 📚 Lecciones Aprendidas

### Desafíos
1. **Contexto limitado**: En sesiones largas, el modelo necesita que se le recuerden decisiones anteriores.
2. **Alucinaciones en importaciones**: A veces sugiere bibliotecas o funciones que no existen en el proyecto; hay que verificar siempre.
3. **Dependencia de la especificidad**: Cuanto más detallado el prompt, mejor el resultado. Órdenes vagas generan código que requiere correcciones.
4. **Estados compartidos**: El modelo no siempre anticipa efectos secundarios (ej: formularios que no se reinician al cambiar props) — requiere supervisión humana.
5. **Plan Mode vs Build Mode**: Alternar entre modos es útil para no hacer cambios no deseados, pero ralentiza el flujo si se usa en exceso.

### Buenas prácticas adoptadas
- Siempre verificar con `tsc --noEmit` antes de dar por terminado un cambio.
- Leer los archivos existentes antes de editarlos para mantener consistencia.
- Usar los tipos y patrones existentes en lugar de crear nuevos.
