# Rutas

| Ruta | Página | Layout | APIs inferidas |
| --- | --- | --- | --- |
| `/` | DashboardPage | AppShell | `jobs/`, `processing/settings/` |
| `/assistant` | AssistantPage | AppShell | `assistant/chat/` |
| `/upload` | UploadPage | AppShell | `documents/upload/` |
| `/results` | ResultsPage | AppShell | `jobs/:id/`, `jobs/:id/logs/`, `jobs/:id/export/` |
| `/history` | HistoryPage | AppShell | `jobs/` |
| `/settings` | SettingsPage | AppShell | `processing/settings/` |

Contrato inferido por uso: la navegación se resuelve en `AppRoutes` y el shell permanece estable.

