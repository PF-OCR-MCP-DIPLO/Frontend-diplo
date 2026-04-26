# Desarrollo local

## Requisitos

- Node.js 18 o superior
- Backend accesible en `http://localhost:8000`
- `npm` con dependencias instaladas

## Arranque

```bash
npm install
npm run dev
```

## Problemas comunes

- Si la API falla, revisar `VITE_API_BASE_URL` y `VITE_API_KEY`.
- Si TypeScript falla, ejecutar `npm run typecheck`.
- Si la UI no renderiza assets, comprobar que la API esté sirviendo media.

