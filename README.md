# Frontend Diplo

SPA React/TypeScript/Vite para operar el flujo de procesamiento de documentos
DOCX del backend Django: carga, configuración OCR/LLM, seguimiento de jobs,
revisión de consignaciones, corrección manual, reprocesamiento, exportación y
asistente contextual.

## Propósito

El frontend es la interfaz de trabajo para usuarios que necesitan convertir
comprobantes bancarios embebidos en DOCX en una tabla revisable y exportable.
No ejecuta OCR ni LLM en el navegador; coordina el contrato HTTP del backend y
presenta evidencia de estado, errores y diagnósticos.

## Stack técnico

| Área | Tecnología verificada |
| --- | --- |
| UI | React 18.3.1 |
| Lenguaje | TypeScript 5.6 |
| Build | Vite 6.4 |
| Routing | React Router 7 |
| Componentes | Radix UI, lucide-react, utilidades locales |
| Formularios/feedback | Estado React, sonner |
| Tests | Vitest, Testing Library, Playwright |
| Lint/typecheck | ESLint, `tsc --noEmit` |
| Runtime Docker | Nginx sobre build estático |

## Arquitectura de carpetas

| Ruta | Propósito |
| --- | --- |
| `src/app/` | Arranque de la SPA, router, providers y layout |
| `src/pages/upload/` | Pantalla de carga de DOCX |
| `src/pages/results/` | Contenedor de resultados activos |
| `src/pages/settings/` | Configuración OCR/LLM/asistente |
| `src/pages/history/` | Historial de corridas |
| `src/pages/assistant/` | Vista del asistente |
| `src/features/processing/` | APIs, hooks, mappers, tabla, preview, logs y resultados |
| `src/features/settings/` | Cliente de settings, tipos, normalizadores y formulario |
| `src/features/assistant/` | Cliente de chat y contexto contextual |
| `src/features/history/` | Tabla y acciones de historial |
| `src/services/http/` | Cliente HTTP, API key, errores y URLs de assets |
| `src/components/` | UI compartida |
| `docs/` | Documentación técnica |

## Requisitos previos

- Node.js 20 recomendado, igual que CI y Dockerfile.
- npm.
- Backend disponible en la URL configurada por `VITE_API_BASE_URL`.

## Instalación local

```bash
npm ci
cp .env.example .env
```

Para desarrollo no reproducible también puede usarse `npm install`, pero CI y
Docker usan `npm ci`.

## Variables de entorno

| Variable | Uso | Default en código |
| --- | --- | --- |
| `VITE_API_BASE_URL` | URL base del backend con prefijo `/api` | `http://localhost:8000/api` |
| `VITE_API_KEY` | Valor opcional enviado como `X-API-Key` | cadena vacía |

Ejemplo:

```env
VITE_API_BASE_URL=http://localhost:8000/api
VITE_API_KEY=dev
```

Las variables `VITE_*` quedan embebidas en el build del frontend. No uses
secretos productivos sensibles en un build público.

## Ejecución en desarrollo

```bash
npm run dev
```

Vite sirve la SPA normalmente en `http://localhost:5173/`.

## Build de producción

```bash
npm run build
```

## Preview de producción

```bash
npm run preview
```

## Docker

El `Dockerfile` compila con Node 20 y sirve `dist/` con Nginx.
`nginx/default.conf` proxyfica `/api/` hacia `backend:8000` cuando se usa en el
compose del backend y sirve la SPA con fallback a `index.html`.

## Relación con el backend

El frontend consume endpoints bajo `VITE_API_BASE_URL`. La integración vive en:

- `src/services/http/client.ts`;
- `src/features/processing/api/processing.api.ts`;
- `src/features/settings/api/settings.api.ts`;
- `src/features/assistant/api/assistant.api.ts`.

El backend mantiene los jobs, archivos, OCR bruto, logs, diagnósticos,
correcciones y exportaciones. La UI normaliza respuestas y conserva estado
local para reabrir la corrida activa.

## Flujo funcional de la UI

1. **Carga de documentos**: `/upload` acepta un `.docx`, crea una corrida con
   `POST /documents/upload/` y navega a resultados.
2. **Configuración de procesamiento**: `/settings` lee y actualiza OCR, LLM,
   asistente, periodo válido y criterios de extracción.
3. **Inicio de job**: `/results` o `/history` llaman
   `POST /jobs/{id}/process/`; si el job ya estaba completado se usa
   `force=true`.
4. **Seguimiento de estado**: el hook de processing consulta
   `/jobs/{id}/processing-state/` hasta llegar a estado terminal.
5. **Visualización de resultados**: resultados, imágenes, issues y métricas se
   derivan de `GET /jobs/{id}/`.
6. **Corrección manual**: la tabla editable guarda cambios con
   `PATCH /jobs/{id}/deposits/`, con autosave y guardado manual.
7. **Reprocesamiento**: la UI permite reprocesar fallidos, fuente puntual o
   depósito.
8. **Exportación**: `POST /jobs/{id}/export/` genera Excel y actualiza
   `excel_file`.
9. **Asistente**: `POST /assistant/chat/` recibe historial y contexto de página,
   job, fila, campo o issue.

## Módulos principales

| Módulo | Responsabilidad |
| --- | --- |
| `processing` | Cliente de jobs, polling, historial activo, resultados, correcciones, exportación y logs |
| `settings` | Formulario y normalización de settings OCR/LLM/asistente |
| `assistant` | Chat contextual y payload `query_context` |
| `history` | Lista de corridas y acciones por job |
| `upload` | Dropzone y validación de `.docx` |
| `results` | Workspace de tabla, preview, issues, logs y acciones |
| `http client` | URLs, `X-API-Key`, `HttpError` y assets del backend |

## Contrato básico con la API

| Acción UI | Endpoint backend |
| --- | --- |
| Subir DOCX | `POST /documents/upload/` |
| Procesar job | `POST /jobs/{id}/process/` |
| Polling | `GET /jobs/{id}/processing-state/` |
| Detalle de job | `GET /jobs/{id}/` |
| Guardar correcciones | `PATCH /jobs/{id}/deposits/` |
| Reprocesar fallidos | `POST /jobs/{id}/reprocess-failed/` |
| Reprocesar fuente | `POST /jobs/{id}/source-images/{source_image_id}/reprocess/` |
| Reprocesar depósito | `POST /jobs/{id}/deposits/{deposit_id}/reprocess/` |
| Logs | `GET /jobs/{id}/logs/` |
| Diagnóstico | `GET /jobs/{id}/diagnostics/` |
| Exportar | `POST /jobs/{id}/export/` |
| Settings | `GET/PATCH /processing/settings/` |
| Opciones | `GET /processing/settings/options/` |
| Modelos Ollama | `GET /processing/ollama/models/` |
| Asistente | `POST /assistant/chat/` |

`httpRequest()` agrega automáticamente `X-API-Key` si `VITE_API_KEY` tiene
valor.

## Manejo de API key

La API key se configura con `VITE_API_KEY`. Si el backend usa `API_KEY=dev`, el
frontend debe usar el mismo valor. Si el backend está en debug con
`ALLOW_OPEN_API_FOR_DEV=1` y sin `API_KEY`, `VITE_API_KEY` puede quedar vacío.

## Manejo de errores

`HttpError` conserva:

- `status`;
- `code`;
- `details`;
- mensaje normalizado.

El cliente intenta leer el sobre estándar del backend
`{"error": {"code", "message", "details"}}`, pero también tolera `detail`,
errores por campo y texto plano.

El polling tiene timeout defensivo. Si el job no llega a estado terminal,
consulta diagnósticos y muestra la última etapa observada.

## Tests disponibles

```bash
npm run lint
npm run typecheck
npm test
npm run test:coverage
npm run build
```

E2E:

```bash
npm run e2e
npm run e2e:pw
```

`npm run e2e` levanta el compose del backend, espera health checks y ejecuta
Playwright.

## Buenas prácticas de desarrollo

- Mantén llamadas HTTP dentro de `src/features/*/api` o `src/services/http`.
- Agrega tipos en `types/*.api.ts` para contratos crudos y en `types/*.types.ts`
  para modelos de UI.
- Usa mappers para transformar contratos backend a estructuras visuales.
- Centraliza estado de dominio en hooks de feature.
- No expongas API keys en estado visible ni en snapshots de UI.
- Si cambia un serializer backend, actualiza tipos, mappers, tests y docs.
- Si cambian settings OCR/LLM, revisa `OcrSettingsSection`,
  `settings-normalizers` y tests del formulario.

## Depuración de procesamiento desde el frontend

Cuando OCR o resultados no coinciden con lo esperado:

1. Revisa en `/settings` los valores enviados: `ocr_mode`, `ocr_provider`,
   `ocr_model`, `llm_provider`, `llm_model`, timeout, periodo válido y criterios.
2. En `/results`, abre logs para revisar etapas `ocr`, `llm_structuring`,
   `record_skipped` y `persistence_mismatch`.
3. Confirma el estado del job: `uploaded`, `processing`, `completed`,
   `completed_with_errors` o `failed`.
4. Si el backend reporta proveedor lento o modelo faltante, usa
   `/api/processing/provider-health/` desde backend.
5. Si sospechas binarización o preprocesamiento, compara el OCR bruto en logs y
   revisa la documentación backend de OCR.
6. Si la UI muestra datos distintos a la API, revisa normalización en
   `processing.api.ts` y `processing.mappers.ts`.

## Binarización y calidad OCR

La binarización ocurre en el backend, no en React. Desde frontend solo se
controlan modo/proveedor/modelo y se visualizan logs, imágenes y texto OCR
normalizado. Si aparecen dígitos faltantes, separadores perdidos, referencias
incompletas o montos dañados, guarda evidencia de:

- settings visibles en `/settings`;
- `jobId`;
- imagen/fila afectada;
- logs de resultados;
- estado de job;
- diferencias entre UI y respuesta cruda si existen.

Consulta la guía backend `docs/ocr-troubleshooting.md`.

## Documentación relacionada

- [docs/index.md](docs/index.md)
- [docs/architecture.md](docs/architecture.md)
- [docs/processing-flow.md](docs/processing-flow.md)
- [docs/api-integration.md](docs/api-integration.md)
- [docs/development.md](docs/development.md)
- [docs/troubleshooting.md](docs/troubleshooting.md)
