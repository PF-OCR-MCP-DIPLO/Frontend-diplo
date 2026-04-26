# Runbook: stack local

## Levantar frontend

```bash
npm install
npm run dev
```

## Apuntar al backend

- `VITE_API_BASE_URL=http://localhost:8000/api`
- `VITE_API_KEY=dev` cuando aplique

## Validar conectividad

- Abrir la UI y navegar a `/settings`.
- Confirmar que carga settings desde la API.
- Subir un `.docx` de prueba si el backend está levantado.
