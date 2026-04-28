# Integración API

## Propósito

Describir la integración frontend-backend desde el cliente HTTP y APIs por feature.

## Cliente HTTP base

- Archivo: `src/services/http/client.ts`
- Responsabilidades:
  - resolver URL base,
  - inyectar `X-API-Key` cuando aplica,
  - normalizar errores en `HttpError`,
  - resolver rutas de assets backend.

## Clientes por feature

- `src/features/processing/api/processing.api.ts`
- `src/features/settings/api/settings.api.ts`
- `src/features/assistant/api/assistant.api.ts`

## Contrato de normalización

- Los clientes convierten payloads parciales backend a formas estables para UI.
- Mappers de `processing` adaptan estructuras para tabla, preview y métricas.

## Errores y resiliencia

- `HttpError` preserva `status`, `code` y `details` cuando el backend los provee.
- Polling de procesamiento incluye timeout y diagnóstico si no hay estado terminal.

## Enlaces relacionados

- [Autenticación](authentication.md)
- [Estado global](state-management.md)
