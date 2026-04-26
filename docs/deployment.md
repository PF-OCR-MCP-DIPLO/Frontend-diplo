# Deployment

## Preparación

1. Compilar frontend con `npm run build`.
2. Publicar `dist/` en el host estático elegido.
3. Asegurar que `VITE_API_BASE_URL` apunte al backend correcto.
4. Asegurar `VITE_API_KEY` si el backend lo requiere.

## Qué no subir

- `node_modules/`
- `dist/`
- archivos `.env` con secretos

