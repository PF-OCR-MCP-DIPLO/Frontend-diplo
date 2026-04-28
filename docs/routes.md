# Rutas

## Propósito

Documentar rutas públicas de la SPA según `src/app/router/routes.tsx`.

## Mapa de rutas actual

- `/` → `DashboardPage`
- `/assistant` → `AssistantPage`
- `/upload` → `UploadPage`
- `/results` → `ResultsPage`
- `/history` → `HistoryPage`
- `/settings` → `SettingsPage`
- `*` → redirección a `/`

## Notas técnicas

- Todas las rutas usan el shell global para navegación consistente.
- No se observaron guards de autenticación cliente en esta pasada.

## Enlaces relacionados

- [Arquitectura](architecture.md)
- [Componentes](components.md)
