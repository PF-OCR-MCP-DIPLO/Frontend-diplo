# Componentes

## Compartidos

- `AppShell`: layout persistente.
- `ErrorBoundary`: captura fallos de render.
- `SidebarDesktop` y `SidebarMobile`: navegación lateral.
- `PageHeader`, `StatePanel`, `StatusBadge`: soporte visual de páginas.
- `Modal`, `MetricCard`, `ContextualTooltip`: piezas reutilizables.

## Bajo nivel vs dominio

- Bajo nivel: `src/components/ui/*`
- Dominio: `src/features/*/components/*`

## Patrones UI

- Un control por intención visible.
- Los formularios de ajuste viven junto a su feature.
- Las tablas editables se usan para correcciones de resultados.

