# Cliente API

## Base URL

- Se resuelve desde `VITE_API_BASE_URL`.
- Valor por defecto inferido: `http://localhost:8000/api`.

## Headers

- `X-API-Key` cuando `VITE_API_KEY` está definido.

## Manejo de errores

- Los errores se envuelven en `HttpError`.
- Se intenta extraer el mensaje más útil del payload.
- Se conservan `code` y `details` cuando el backend los devuelve.

## Endpoints consumidos

- `documents/upload/`
- `jobs/`
- `jobs/:id/`
- `jobs/:id/deposits/`
- `jobs/:id/deposits/:depositId/reprocess/`
- `jobs/:id/reprocess-failed/`
- `jobs/:id/source-images/:sourceImageId/reprocess/`
- `jobs/:id/logs/`
- `jobs/:id/diagnostics/`
- `jobs/:id/processing-state/`
- `jobs/:id/export/`
- `processing/settings/`
- `processing/settings/options/`
- `processing/ollama/models/`
- `processing/provider-health/`
- `assistant/chat/`

