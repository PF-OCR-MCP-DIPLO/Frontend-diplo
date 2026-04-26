# Flujo de datos

```mermaid
flowchart TD
    A[Usuario] --> B[UploadPage / ResultsPage / SettingsPage]
    B --> C[Cliente API de feature]
    C --> D[httpRequest()]
    D --> E[Backend Django /api/*]
    E --> F[Normalización de respuesta]
    F --> G[Estado compartido / componentes]
    G --> H[Renderizado en pantalla]
```

## Flujo principal

1. El usuario navega por el shell.
2. Una pantalla invoca su cliente API.
3. `httpRequest()` agrega `X-API-Key` si aplica.
4. El backend devuelve JSON con datos o errores.
5. La respuesta se normaliza para la UI.
6. Los cambios de ruta limpian overlays y cierres pendientes.

