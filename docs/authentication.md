# Autenticación frontend

## Propósito

Documentar el mecanismo de autenticación observado en el frontend actual.

## Modelo actual

- No se encontró sesión/JWT gestionado por frontend.
- El cliente HTTP puede enviar `X-API-Key` usando `VITE_API_KEY`.
- La seguridad efectiva depende del backend y su configuración de API key.

## Supuestos de integración

- Si backend permite API abierta en dev, `VITE_API_KEY` puede omitirse.
- En entornos restringidos, frontend debe ejecutar con API key válida.

## Pendiente de validar

- Estrategia futura de autenticación por usuario/rol en cliente (si aplica al roadmap).

## Enlaces relacionados

- [Configuración](configuration.md)
- [Integración API](api-integration.md)
