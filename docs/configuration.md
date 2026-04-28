# Configuración

## Propósito

Documentar configuración de entorno del frontend confirmada por el código.

## Variables de entorno verificadas

- `VITE_API_BASE_URL`
  - Uso: URL base para llamadas a backend (`src/services/http/client.ts`).
  - Default: `http://localhost:8000/api`.
- `VITE_API_KEY`
  - Uso: inyección de header `X-API-Key` en cliente HTTP cuando existe.

## Supuestos importantes

- El backend expone endpoints bajo el prefijo configurado.
- `VITE_API_KEY` es opcional y depende del modo de seguridad backend.

## Pendiente de validar

- Estrategia definitiva de variables por ambiente (dev/stage/prod) fuera del entorno local.

## Enlaces relacionados

- [Primeros pasos](getting-started.md)
- [Integración API](api-integration.md)
- [Autenticación](authentication.md)
