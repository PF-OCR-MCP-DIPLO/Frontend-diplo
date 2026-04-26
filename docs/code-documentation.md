# Documentación interna del código

Esta guía define cómo documentar el código fuente del frontend React desde
dentro, sin reemplazar la documentación externa de MkDocs.

## Objetivo

La documentación interna debe ayudar a leer el código con contexto técnico
suficiente para entender responsabilidad, contrato, efectos secundarios,
errores, flujos y decisiones no obvias.

## Qué se documenta dentro del código

- JSDoc en componentes React exportados, hooks, providers, clientes API,
  mappers, utilidades relevantes y tipos complejos.
- Comentarios inline solo cuando expliquen una decisión no evidente.
- Tests complejos cuando la intención del caso no se deduce por el nombre.

## Qué se documenta en MkDocs

MkDocs se reserva para arquitectura, runbooks, ADRs, testing y operación.

## Convenciones

- Explicar responsabilidad, contrato, dependencias y efectos secundarios.
- Describir payloads normalizados, estados derivados, navegación y sincronización.
- Usar `@param`, `@returns` y `@remarks` cuando aporten claridad.

## Cuándo comentar inline

- Cuando un cleanup evita fugas de overlays o listeners.
- Cuando un fallback preserva la continuidad de la UI.
- Cuando se conserva estado local para corregir antes de sincronizar.

## Cuándo evitar comentarios

- Si el nombre del componente o hook ya expresa la intención.
- Si el comentario repite lo que dice el código.
- Si el detalle pertenece mejor a una guía externa.

## Contratos frontend-backend

- Mantener alineados tipos TypeScript con serializers y views.
- Documentar qué endpoint alimenta cada cliente API.
- Explicar normalizaciones antes de llegar a la UI.

## Efectos secundarios

Documentar escrituras en storage, llamadas HTTP y mutaciones compartidas.

## Errores

Documentar validaciones, conflictos, respuestas inválidas y fallos de red.

## Tests

- Documentar solo pruebas complejas o contraintuitivas.
- Explicar el caso de negocio protegido por la prueba.

