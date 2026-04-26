# Frontend

## Estructura de `src/`

- `app/`: providers, shell, router y composición raíz.
- `pages/`: pantallas de dashboard, subida, resultados, historial, ajustes y asistente.
- `features/`: módulos de dominio con componentes, hooks, tipos y APIs.
- `components/`: UI compartida, sidebar, dialogs, estado y atajos visuales.
- `services/http/`: acceso a backend y utilidades de normalización.
- `lib/`: utilidades, constantes y formateadores.

## Pantallas principales

- Dashboard: acceso inicial y resumen operativo.
- Upload: carga del documento DOCX.
- Results: revisión de corridas, correcciones y exportación.
- History: consulta de ejecuciones previas.
- Settings: configuración de OCR/LLM/asistente.
- Assistant: chat contextual sobre una corrida o un problema concreto.

## Estado y contexto

- `ProcessingProvider`: estado global del flujo de ejecución.
- `AssistantChatProvider`: contexto del asistente y conversación activa.
- `BrowserRouter`: navegación de la SPA.
- `Toaster`: notificaciones globales.

## Comunicación con API

- `src/services/http/client.ts` agrega `X-API-Key` cuando existe `VITE_API_KEY`.
- Los módulos de `features/*/api` encapsulan endpoints y normalización.
- Las páginas consumen hooks y providers, no `fetch` directo.

## Convenciones para nuevas pantallas

- Crear la pantalla en `src/pages/`.
- Extraer el acceso a datos a `src/features/<dominio>/api/`.
- Mantener transformaciones de respuesta en el cliente o en mappers.
- Documentar efectos secundarios cuando la pantalla dispare navegación, exportación o reproceso.

