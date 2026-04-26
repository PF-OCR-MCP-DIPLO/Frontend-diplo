# ADR 0002: Límite del cliente API

## Estado
Inferida por estructura actual

## Contexto
La app necesita normalizar respuestas y aislar el acceso a red del render.

## Decisión
Centralizar el acceso HTTP en `src/services/http/` y en los `features/*/api`.

## Consecuencias
- Menos duplicación de `fetch`.
- Más control sobre errores y normalización.
- Los componentes quedan más fáciles de probar.
