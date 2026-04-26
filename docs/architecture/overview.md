# Arquitectura general

## Capas

- Presentación: páginas, layout, componentes compartidos.
- Estado y contexto: providers para procesamiento y asistente.
- Dominio: módulos por feature.
- Infraestructura: cliente HTTP y utilidades de navegación/errores.

## Decisiones técnicas

- El router vive en la raíz para que el shell y los providers sean persistentes.
- Las respuestas del backend se normalizan cerca del borde de red.
- La UI de resultados reutiliza componentes editables para correcciones y exportación.

## Riesgos

- Los archivos del backend pueden llegar como rutas relativas o absolutas.
- Hay dos niveles de estado: local de pantalla y compartido de dominio.
- La app depende de la API key cuando el backend la exige.

