# Troubleshooting

## Propósito

Guiar la resolución de fallos de frontend, integración API y diagnóstico de
procesamiento observado desde la UI.

## API inaccesible

Revisa:

- `VITE_API_BASE_URL`;
- que el backend responda en `/api/health/`;
- CORS en backend (`CORS_ALLOWED_ORIGINS`);
- que Vite se haya reiniciado después de cambiar `.env`.

Prueba rápida:

```bash
curl http://localhost:8000/api/health/
```

## Errores de autorización

Síntoma: respuestas `401` o mensajes de API key inválida.

Revisa:

- `VITE_API_KEY` en frontend;
- `API_KEY` en backend;
- header `X-API-Key` en la pestaña Network;
- `ALLOW_OPEN_API_FOR_DEV` solo si trabajas en debug.

## Carga de DOCX falla

La UI valida extensión `.docx`, pero el backend puede rechazar más casos:

- archivo corrupto;
- tamaño mayor a `DOCX_MAX_UPLOAD_BYTES`;
- DOCX sin imágenes embebidas;
- demasiadas imágenes;
- imágenes con formato no soportado.

Revisa el mensaje de `HttpError` y el `code` si el backend lo incluye.

## Job no avanza

La UI usa polling contra `/jobs/{id}/processing-state/`. Si supera el timeout
defensivo, intenta leer `/jobs/{id}/diagnostics/`.

Revisa:

- estado `processing`;
- `current_stage`;
- `stale_processing`;
- última etapa reportada;
- logs backend;
- disponibilidad de Ollama/Tesseract.

## Resultados vacíos

Puede ocurrir por:

- OCR sin texto;
- LLM sin registros estructurados;
- registros omitidos por faltar `referencia` o `valor`;
- imagen marcada como `failed`;
- diferencias entre proveedor OCR y modelo.

Desde la UI:

1. Abre logs en resultados.
2. Busca etapas `ocr`, `llm_structuring`, `record_skipped`,
   `persistence_mismatch`.
3. Revisa settings OCR/LLM.
4. Refresca el job para descartar estado local desactualizado.

## Resultados peores que antes

Revisa primero si cambió configuración:

- `ocr_mode`;
- `ocr_provider`;
- `ocr_model`;
- `llm_model`;
- `request_timeout_seconds`;
- `extraction_criteria`.

Luego compara evidencia:

- texto OCR bruto en logs;
- estado de cada imagen;
- cantidad de registros estructurados;
- cantidad de registros persistidos;
- observaciones por fila.

Si aparecen dígitos faltantes, separadores perdidos o montos dañados, puede ser
un problema de preprocesamiento o binarización en backend.

## Binarización/OCR observado desde frontend

La binarización no ocurre en React. La UI debe ayudar a recolectar evidencia:

- `jobId`;
- `sourceImageId` o fila afectada;
- captura de la imagen fuente;
- logs de etapa `ocr`;
- settings actuales;
- proveedor/modelo OCR;
- modo OCR;
- diferencias entre texto OCR y tabla.

Síntomas a reportar:

- pérdida de dígitos;
- pérdida de separadores `.`, `/`, `:`;
- texto fragmentado;
- referencias incompletas;
- montos mal interpretados;
- fechas u horas dañadas.

Consulta la guía backend `docs/ocr-troubleshooting.md`.

## Correcciones no se guardan

Revisa:

- estado de autosave: `dirty`, `saving`, `saved`, `error`;
- que el job no esté en `processing`;
- payload `PATCH /jobs/{id}/deposits/`;
- que cada fila tenga `depositId`;
- errores de validación backend.

Si autosave falla, usa el botón de reintento o guarda manualmente desde la barra
de resultados.

## Exportación no disponible

La UI bloquea exportación cuando hay cambios sin guardar. El backend solo exporta
jobs `completed` o `completed_with_errors`.

Revisa:

- estado del job;
- `excelUrl`;
- cambios pendientes;
- respuesta de `POST /jobs/{id}/export/`.

## UI y API no coinciden

Revisa:

- `normalizeJobDetail()`;
- `normalizeSourceImages()`;
- `mapJobToProcessedFile()`;
- `mapJobToConsignmentRows()`;
- estado actual en `ProcessingProvider`;
- `localStorage` key `diplo.active-job-id`.

## Build, typecheck o lint fallan

Ejecuta en orden:

```bash
npm run lint
npm run typecheck
npm test
npm run build
```

Si falla por dependencias, reinstala con:

```bash
npm ci
```

## Enlaces relacionados

- [Configuración](configuration.md)
- [Integración API](api-integration.md)
- [Flujo de procesamiento](processing-flow.md)
- [Testing](testing.md)
