# Integración API

## Propósito

Describir cómo el frontend consume la API Django, cómo normaliza contratos y
qué puntos revisar cuando la UI y el backend no coinciden.

## Cliente HTTP base

Archivo: `src/services/http/client.ts`.

Responsabilidades:

- resolver `VITE_API_BASE_URL`;
- remover slash final de la URL base;
- derivar `backendBaseUrl` para media/static;
- inyectar `X-API-Key` cuando `VITE_API_KEY` tiene valor;
- convertir respuestas fallidas en `HttpError`;
- extraer mensajes de error desde distintos formatos backend;
- resolver rutas relativas de assets con `resolveAssetUrl()`.

## Variables de entorno

| Variable | Uso |
| --- | --- |
| `VITE_API_BASE_URL` | URL base con prefijo `/api` |
| `VITE_API_KEY` | Header `X-API-Key` opcional |

## Clientes por feature

| Archivo | Responsabilidad |
| --- | --- |
| `src/features/processing/api/processing.api.ts` | Jobs, upload, correcciones, reprocesos, exportación, logs y diagnósticos |
| `src/features/settings/api/settings.api.ts` | Settings, opciones y modelos Ollama |
| `src/features/assistant/api/assistant.api.ts` | Chat contextual |

## Contrato processing

| Función | Endpoint |
| --- | --- |
| `uploadDocument` | `POST /documents/upload/` |
| `processJob` | `POST /jobs/{id}/process/` |
| `getJob` | `GET /jobs/{id}/` |
| `listJobs` | `GET /jobs/` |
| `deleteJob` | `DELETE /jobs/{id}/` |
| `saveJobCorrections` | `PATCH /jobs/{id}/deposits/` |
| `reprocessDeposit` | `POST /jobs/{id}/deposits/{deposit_id}/reprocess/` |
| `reprocessFailed` | `POST /jobs/{id}/reprocess-failed/` |
| `reprocessSourceImage` | `POST /jobs/{id}/source-images/{source_image_id}/reprocess/` |
| `exportJob` | `POST /jobs/{id}/export/` |
| `getJobLogs` | `GET /jobs/{id}/logs/` |
| `getJobDiagnostics` | `GET /jobs/{id}/diagnostics/` |
| `getProcessingState` | `GET /jobs/{id}/processing-state/` |

## Contrato settings

| Función | Endpoint |
| --- | --- |
| `getProcessingSettings` | `GET /processing/settings/` |
| `updateProcessingSettings` | `PATCH /processing/settings/` |
| `getProcessingSettingsOptions` | `GET /processing/settings/options/` |
| `getOllamaModels` | `GET /processing/ollama/models/` |

## Contrato assistant

`sendAssistantChat()` envía:

- `messages`;
- `job_id`;
- `errors`;
- `query_context`.

Endpoint:

```http
POST /assistant/chat/
```

## Normalización

La UI no usa el contrato backend directamente en componentes. Primero normaliza:

- `normalizeJobDetail()` rellena campos ausentes y resuelve URLs de media;
- `normalizeSourceImages()` estabiliza imágenes y depósitos;
- `mapJobToProcessedFile()` transforma jobs en modelo de resultados;
- `mapJobToConsignmentRows()` transforma depósitos en filas editables;
- `normalizeSettings()` y `normalizeSettingsOptions()` rellenan defaults seguros.

## Manejo de errores

`HttpError` conserva:

- `status`;
- `code`;
- `details`;
- `message`.

El extractor de mensajes soporta:

- `payload.error.message`;
- `payload.error.details`;
- `payload.detail`;
- `payload.error_message`;
- errores de validación por campo;
- texto plano.

## Assets y archivos

Django puede devolver rutas como `/media/...`. `resolveAssetUrl()` las convierte
en URLs absolutas con base del backend. Esto aplica a:

- `source_docx`;
- `excel_file`;
- `source_images[].image_file`.

## Diagnóstico de discrepancias UI/API

Si la API devuelve datos correctos pero la UI muestra otra cosa:

1. Revisa `normalizeJobDetail()`.
2. Revisa `mapJobToConsignmentRows()`.
3. Confirma que `resolveAssetUrl()` esté usando la base esperada.
4. Revisa autosave o guardado manual si las correcciones no aparecen.
5. Compara `ApiJobDetail` crudo con `ProcessedFile`.

Si el problema viene de OCR o binarización, el frontend solo puede aportar
evidencia visible. El preprocesamiento ocurre en backend.

## Tests relacionados

- `src/services/http/__tests__/client.test.ts`;
- `src/features/processing/api/__tests__/processing.api.test.ts`;
- `src/features/settings/api/__tests__/settings.api.test.ts`;
- `src/features/assistant/api/__tests__/assistant.api.test.ts`;
- `src/features/processing/mappers/__tests__/processing.mappers.test.ts`.

## Enlaces relacionados

- [Arquitectura](architecture.md)
- [Flujo de procesamiento](processing-flow.md)
- [Estado global](state-management.md)
- [Troubleshooting](troubleshooting.md)
