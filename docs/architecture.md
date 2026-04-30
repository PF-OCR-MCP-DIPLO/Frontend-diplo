# Arquitectura frontend

## Propósito

Describir la estructura real de la SPA y las fronteras de responsabilidad entre
pantallas, features, cliente HTTP y estado compartido.

## Mapa de módulos

| Módulo | Responsabilidad |
| --- | --- |
| `src/app/` | `App`, router, providers y layout global |
| `src/pages/` | Pantallas navegables |
| `src/components/` | Componentes compartidos y primitivos UI |
| `src/features/processing/` | Dominio de jobs, resultados, logs, correcciones y exportación |
| `src/features/settings/` | Settings OCR/LLM/asistente y criterios de extracción |
| `src/features/assistant/` | Chat y contexto del asistente |
| `src/features/history/` | Historial de corridas |
| `src/services/http/` | Cliente HTTP común |
| `src/lib/` | Constantes y utilidades genéricas |
| `src/styles/` | CSS global, tema y Tailwind |

## Flujo de datos

1. Un componente de página llama una acción de feature.
2. La acción usa un cliente API de `src/features/*/api`.
3. El cliente API usa `httpRequest()`.
4. La respuesta cruda se normaliza.
5. Mappers transforman datos a modelos de UI.
6. Providers/hooks guardan estado compartido.
7. Componentes renderizan datos ya adaptados.

## Processing

Responsabilidades:

- upload de DOCX;
- inicio de procesamiento;
- polling de estado;
- historial y job activo;
- normalización de imágenes y depósitos;
- tabla editable;
- autosave de correcciones;
- logs y paneles de diagnóstico;
- reprocesos;
- exportación.

Archivos clave:

- `api/processing.api.ts`;
- `hooks/useProcessingActions.ts`;
- `hooks/ProcessingProvider.tsx`;
- `mappers/processing.mappers.ts`;
- `components/results/ResultsView.tsx`.

## Settings

Responsabilidades:

- leer settings;
- cargar opciones y modelos Ollama;
- normalizar defaults;
- editar OCR, LLM, asistente, periodo válido y criterios;
- enviar API keys solo cuando el usuario ingresa un valor.

Archivos clave:

- `api/settings.api.ts`;
- `hooks/useSettingsForm.ts`;
- `utils/settings-normalizers.ts`;
- `components/SettingsForm.tsx`;
- `components/sections/OcrSettingsSection.tsx`.

## Assistant

Responsabilidades:

- enviar mensajes al backend;
- construir `query_context`;
- abrir asistente desde resultados/settings con contexto;
- manejar respuestas con o sin detalle técnico.

## Cliente HTTP

`src/services/http/client.ts` concentra:

- `VITE_API_BASE_URL`;
- `VITE_API_KEY`;
- header `X-API-Key`;
- resolución de rutas de media;
- `HttpError`.

Los componentes no deben repetir esta lógica.

## Estado local

`ProcessingProvider` mantiene:

- historial;
- resultado activo;
- flags de procesamiento/exportación/guardado;
- restauración desde `localStorage` con key `diplo.active-job-id`.

La pantalla de resultados mantiene estado local de edición y paneles para evitar
sobrecargar el provider global.

## Puntos sensibles

- Cambios de serializers backend requieren revisar tipos, normalizadores y
  mappers.
- `excel_file`, `source_docx` e imágenes pueden llegar como rutas relativas.
- API keys son de build-time en Vite y no deben tratarse como secretos ocultos.
- La calidad OCR depende del backend; frontend solo configura proveedor/modelo y
  muestra evidencia.
- La UI debe distinguir estado local desactualizado de una respuesta API real.

## Enlaces relacionados

- [Flujo de procesamiento](processing-flow.md)
- [Integración API](api-integration.md)
- [Estado global](state-management.md)
- [Troubleshooting](troubleshooting.md)
