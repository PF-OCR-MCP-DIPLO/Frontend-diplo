# Primeros pasos

## Propósito

Arrancar el frontend localmente y verificar que puede comunicarse con el
backend.

## Requisitos

- Node.js 20 recomendado.
- npm.
- Backend disponible en la URL configurada.

## Instalación

```bash
npm ci
cp .env.example .env
```

Edita `.env` si tu backend no usa `http://localhost:8000/api` o si la API key
no es `dev`.

## Desarrollo local

```bash
npm run dev
```

Abre la URL que imprime Vite, normalmente `http://localhost:5173/`.

## Flujo mínimo de validación

1. Levanta el backend y confirma `GET /api/health/`.
2. Ejecuta `npm run dev`.
3. Abre `/settings` y verifica que carguen settings.
4. Abre `/upload` y selecciona un `.docx`.
5. Abre `/results`, procesa la corrida y revisa logs/resultados.

## Enlaces relacionados

- [Configuración](configuration.md)
- [Desarrollo](development.md)
- [Flujo de procesamiento](processing-flow.md)
- [Troubleshooting](troubleshooting.md)
