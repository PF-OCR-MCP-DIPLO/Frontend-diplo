# UI patterns

## Propósito

Registrar patrones de interfaz reutilizados en la SPA.

## Patrones observados

- Shell persistente con navegación lateral y header contextual.
- Vista de resultados con paneles conmutables (preview/logs/issues/detail).
- Tabla editable con validación inmediata antes de persistencia.
- Estados explícitos para operaciones asíncronas (processing/saving/exporting).
- Autosave diferido para minimizar escrituras por tecla.

## Reglas prácticas

- Mantener lógica de negocio en hooks/servicios y componentes orientados a presentación.
- Evitar duplicar mapeos de payload backend en componentes visuales.
- Reutilizar componentes UI base para coherencia visual y accesibilidad.

## Enlaces relacionados

- [Componentes](components.md)
- [Estado global](state-management.md)
