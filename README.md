# Frontend Diplo

Frontend SPA en React + TypeScript + Vite para carga de documentos, revisión de
resultados, asistente contextual y configuración de procesamiento.

## Propósito del frontend

La aplicación consume la API del backend para:

- cargar documentos y disparar procesamiento,
- visualizar y corregir resultados,
- consultar historial y exportaciones,
- operar asistente contextual sobre jobs y hallazgos,
- administrar settings de OCR/LLM/asistente.

## Stack técnico detectado

- React 18
- TypeScript
- Vite
- React Router
- Vitest + Testing Library
- ESLint
- Playwright (E2E)

## Requisitos previos

- Node.js (LTS recomendado)
- npm

## Instalación

```bash
npm install
```

## Variables de entorno reales

Definidas por uso en `src/services/http/client.ts`:

- `VITE_API_BASE_URL` (default: `http://localhost:8000/api`)
- `VITE_API_KEY` (opcional, se envía como `X-API-Key`)

## Comandos disponibles

Tomados de `package.json`:

- `npm run dev`
- `npm run build`
- `npm run preview`
- `npm run lint`
- `npm run typecheck`
- `npm test`
- `npm run test:coverage`
- `npm run e2e`
- `npm run e2e:pw`

## Ejecución local

```bash
npm run dev
```

## Build y preview

```bash
npm run build
npm run preview
```

## Tests y calidad

```bash
npm run lint
npm run typecheck
npm test
```

## Estructura del proyecto

- `src/app/`: shell, router y providers globales.
- `src/features/`: dominio por módulo (processing, assistant, settings).
- `src/services/`: cliente HTTP y utilidades de integración.
- `src/components/`: componentes compartidos y UI base.
- `docs/`: documentación técnica canónica del frontend.

## Integración con backend

El frontend consume endpoints bajo `VITE_API_BASE_URL` y mantiene normalización
de contratos en clientes API de `src/features/*/api`.

## Documentación

- [Mapa documental](docs/index.md)
- [Arquitectura](docs/architecture.md)
- [Configuración](docs/configuration.md)
- [Rutas](docs/routes.md)
- [Componentes](docs/components.md)
- [Estado global](docs/state-management.md)
- [Integración API](docs/api-integration.md)
- [Documentación en código](docs/code-documentation.md)

## Troubleshooting básico

- Si falla la API, valida `VITE_API_BASE_URL` y disponibilidad del backend.
- Si recibes `401`, revisa `VITE_API_KEY` y la configuración de API key backend.
- Si falla build/lint, consulta `docs/troubleshooting.md`.

## Nota sobre publicación de documentación

Toda la documentación vive en este repositorio (`Frontend-diplo/docs/`).
No hay configuración de GitHub Pages ni workflows de publicación.
