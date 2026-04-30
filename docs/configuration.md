# Configuración

## Propósito

Documentar la configuración de entorno confirmada por el código frontend.

## Variables de entorno

| Variable | Uso | Default |
| --- | --- | --- |
| `VITE_API_BASE_URL` | URL base para llamadas al backend | `http://localhost:8000/api` |
| `VITE_API_KEY` | API key opcional enviada como `X-API-Key` | cadena vacía |

Ejemplo local:

```env
VITE_API_BASE_URL=http://localhost:8000/api
VITE_API_KEY=dev
```

## Reglas importantes

- Las variables `VITE_*` se leen en build-time por Vite.
- Cambios en `.env` requieren reiniciar `npm run dev`.
- `VITE_API_BASE_URL` debe incluir el prefijo `/api`.
- `VITE_API_KEY` debe coincidir con `API_KEY` del backend cuando el backend
  requiere autenticación.
- No uses secretos sensibles en builds publicados del frontend.

## Relación con backend

El backend puede operar sin API key solo en debug y con
`ALLOW_OPEN_API_FOR_DEV=1`. Si el backend tiene `API_KEY`, el frontend debe
configurar `VITE_API_KEY`.

El cliente HTTP deriva `backendBaseUrl` desde `VITE_API_BASE_URL` para convertir
rutas `/media/...` en URLs navegables.

## Docker/Nginx

El `Dockerfile` genera un build estático y lo sirve con Nginx. La configuración
`nginx/default.conf`:

- sirve la SPA con fallback a `index.html`;
- proxyfica `/api/` hacia `backend:8000`;
- expone `/media/` y `/static/` si el contenedor runtime tiene esos directorios
  montados.

## Enlaces relacionados

- [Primeros pasos](getting-started.md)
- [Integración API](api-integration.md)
- [Troubleshooting](troubleshooting.md)
