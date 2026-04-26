# Auditoría interna del código

## Resumen

- Cobertura ampliada en resultados, tabla editable, preview, settings y
  assistant, además de utilidades de procesamiento.
- Persisten módulos secundarios sin docstrings/JSDoc porque esta ronda priorizó
  los flujos más visibles para evaluación.

## Archivos documentados en esta ronda

- `src/components/AIChat.tsx`
- `src/features/assistant/components/AssistantContextSelector.tsx`
- `src/features/assistant/hooks/AssistantChatContext.tsx`
- `src/features/assistant/hooks/useOpenAssistantWithContext.ts`
- `src/features/assistant/types/assistant-query-context.types.ts`
- `src/features/processing/components/document-preview/*`
- `src/features/processing/components/editable-table/*`
- `src/features/processing/components/results/*`
- `src/features/processing/components/results/hooks/*`
- `src/features/processing/mappers/processing.mappers.ts`
- `src/features/processing/utils/*`
- `src/features/settings/components/*`
- `src/features/settings/hooks/*`
- `src/lib/constants/*`
- `src/lib/utils/*`
- `src/pages/*`
- `src/types/navigation.ts`

## Pendientes prioritarios

- `src/app/App.tsx`
- `src/app/router/routes.tsx`
- `src/app/layouts/AppShell.tsx`
- `src/app/layouts/AppFooter.tsx`
- `src/app/layouts/AppMain.tsx`
- `src/app/layouts/AppViewport.tsx`
- `src/app/providers/AppProviders.tsx`
- `src/components/shared/*`
- `src/features/processing/hooks/useProcessingState.ts`
- `src/features/processing/hooks/useProcessingContext.ts`
- `src/features/processing/hooks/useEditableTable.ts`
- `src/features/processing/hooks/useOpenResult.ts`
- `src/features/processing/utils/table-validators.ts`
- `src/features/processing/utils/processing-store.ts`
- `src/services/http/client.ts`
- `src/features/settings/api/*`
- `src/features/processing/api/*`
- `src/features/assistant/api/*`

## Contrato inferido por uso

- Normalización de respuestas de API para UI.
- Persistencia de la corrida activa en `localStorage`.
- Limpieza global de overlays al cambiar de ruta.
- Autosave de correcciones con debounce y reintento.
- Inferencia de campos de validación a partir de mensajes textuales.

## Pendiente de confirmar

- Qué tests de frontend requieren docstrings adicionales más allá de los casos
  de contratos y flujos principales.

## Siguiente ronda

1. Cerrar `src/components/shared/*` y `src/app/*`.
2. Documentar tests complejos de results, settings y assistant.
3. Revisar `useProcessingState`, `useProcessingContext` y `useEditableTable`.
