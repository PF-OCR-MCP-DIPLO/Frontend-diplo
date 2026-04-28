# Componentes

## Propósito

Resumir componentes clave y su responsabilidad funcional.

## Shell y layout

- `AppShell`: marco persistente de navegación y viewport.
- `AppHeader`: encabezado contextual por ruta.
- `SidebarDesktop` / `SidebarMobile`: navegación principal.

## Componentes de dominio

- Processing: workspace de resultados, tabla editable, preview documental, paneles laterales.
- Assistant: chat y selector de contexto conversacional.
- Settings: formulario por secciones para OCR/LLM/asistente.

## Criterios de uso

- Componentes de dominio viven dentro de `src/features/*/components`.
- Componentes UI base y reutilizables viven en `src/components/ui`.

## Pendiente de validar

- Inventario exhaustivo de componentes con alta complejidad visual para guía de diseño.

## Enlaces relacionados

- [UI patterns](ui-patterns.md)
- [Estado global](state-management.md)
