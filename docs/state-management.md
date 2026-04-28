# Estado global

## Propósito

Documentar cómo se organiza el estado compartido del frontend.

## Providers principales

- `ProcessingProvider`: historial, corrida activa, flags y acciones de procesamiento.
- `AssistantChatProvider`: mensajes, contexto e input del asistente.
- `AppProviders`: composición de providers globales + router.

## Hooks críticos

- `useProcessingActions`: frontera de side effects (API, polling, localStorage).
- `useProcessingState`: estado base del dominio de procesamiento.
- `useAssistantChatContext`: acceso al estado global del chat.
- `useResultsAutosave`: autosave diferido de correcciones.

## Invariantes observadas

- Solo una corrida activa se persiste en `diplo.active-job-id`.
- El polling se deduplica por `jobId` para evitar carreras.
- El chat persiste estado serializado para continuidad entre recargas.

## Enlaces relacionados

- [Rutas](routes.md)
- [Integración API](api-integration.md)
- [Documentación en código](code-documentation.md)
