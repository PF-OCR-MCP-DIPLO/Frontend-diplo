# Testing Frontend

## Ejecución

```bash
npm run test
npm run typecheck
npm run lint
```

## Qué cubren los tests

- Routing y composición del shell.
- Cliente HTTP y normalización de errores.
- Clientes API de processing, settings y assistant.
- Componentes críticos de resultados, tablas y formularios.
- Hooks de estado y sincronización.

## Convenciones

- Probar el comportamiento visible, no detalles de implementación.
- Aislar fetch y providers mediante mocks.
- Agregar tests cuando cambie la forma normalizada de una respuesta.

