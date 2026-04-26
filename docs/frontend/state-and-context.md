# Estado y contexto

## Providers

- `ProcessingProvider`: estado y acciones del flujo de procesamiento.
- `AssistantChatProvider`: conversación y contexto del asistente.

## Hooks principales

- `useProcessingContext`
- `useProcessingActions`
- `useOpenAssistantWithContext`
- `useResultsPanelState`

## Flujo del asistente

1. La pantalla selecciona el contexto.
2. El hook construye el payload.
3. `sendAssistantChat()` envía mensajes al backend.
4. La respuesta se comparte en la UI y puede incluir detalles técnicos.

