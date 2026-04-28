# Arquitectura frontend

## Propósito

Describir la arquitectura real del frontend observada en código.

## Módulos principales

- `src/app/`: shell, router y providers globales.
- `src/features/processing/`: upload, resultados, correcciones y estado de corridas.
- `src/features/assistant/`: chat, contexto y payloads para asistente.
- `src/features/settings/`: formulario y persistencia de configuración.
- `src/services/http/`: cliente base `fetch` y normalización de errores.
- `src/lib/`: utilidades y constantes compartidas.

## Flujo principal

1. `AppProviders` monta contextos globales.
2. `AppRoutes` resuelve pantallas por ruta.
3. Features consumen API vía `httpRequest`.
4. Mappers normalizan respuestas backend para consumo UI.
5. El estado de procesamiento se sincroniza con historial y job activo local.

## Decisiones observadas

- Arquitectura por feature para desacoplar dominios de pantalla.
- Frontera HTTP centralizada (`src/services/http/client.ts`).
- Contextos separados para estado de procesamiento y chat asistente.
- Persistencia local de estado puntual (`localStorage` / `sessionStorage`) en hooks.

## Riesgos técnicos

- Dependencia de disponibilidad de backend para rutas de negocio.
- Polling de jobs requiere control cuidadoso de timeout/estado terminal.
- Divergencias potenciales entre payload backend y tipado frontend cuando cambie contrato.

## Enlaces relacionados

- [Rutas](routes.md)
- [Estado global](state-management.md)
- [Integración API](api-integration.md)
