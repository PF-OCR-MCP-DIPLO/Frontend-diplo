# Arquitectura Frontend

## Mapa de módulos

- `src/app/`: arranque de la SPA, layout persistente, providers y rutas.
- `src/pages/`: pantallas visibles para el usuario final.
- `src/features/processing/`: carga, vista de resultados, correcciones, exportación y estado de ejecución.
- `src/features/settings/`: configuración de OCR, LLM, asistente y criterios de extracción.
- `src/features/assistant/`: contexto conversacional y apertura del asistente sobre una corrida.
- `src/features/history/`: listado histórico de ejecuciones.
- `src/services/http/`: cliente fetch común, resolución de URLs y manejo de errores.

## Flujo de datos

1. La UI invoca un cliente de `features/*/api`.
2. El cliente usa `httpRequest()` para hablar con Django.
3. Las respuestas se normalizan antes de entrar al estado de la app.
4. Los componentes renderizan datos ya adaptados, incluyendo rutas absolutas de archivos.
5. Las acciones de usuario reenvían comandos al backend y actualizan el estado local.

## Puntos sensibles

- El backend puede devolver archivos relativos; `resolveAssetUrl()` los convierte en URLs usables.
- Las respuestas de error intentan respetar el sobre `error`, pero conservan compatibilidad con formatos previos.
- El `AppShell` limpia overlays al cambiar de ruta para evitar estados visuales inconsistentes.

