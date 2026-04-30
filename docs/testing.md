# Testing frontend

## Ejecución

Checks rápidos:

```bash
npm run lint
npm run typecheck
npm test
```

Checks de CI:

```bash
npm run lint
npm run typecheck
npm run test:coverage
npm run build
```

E2E:

```bash
npm run e2e
npm run e2e:pw
```

## Qué cubren los tests

- Router y composición del shell.
- Cliente HTTP y normalización de errores.
- Clientes API de processing, settings y assistant.
- Normalizadores de settings.
- Mappers de processing.
- Componentes críticos de resultados, tablas y formularios.
- Hooks de estado y sincronización.
- Error boundaries y providers.

## Tests recomendados por cambio

| Cambio | Tests sugeridos |
| --- | --- |
| Cliente HTTP | `src/services/http/__tests__/client.test.ts` |
| Processing API | `src/features/processing/api/__tests__/processing.api.test.ts` |
| Settings API | `src/features/settings/api/__tests__/settings.api.test.ts` |
| Assistant API | `src/features/assistant/api/__tests__/assistant.api.test.ts` |
| Mappers | `src/features/processing/mappers/__tests__/processing.mappers.test.ts` |
| Settings form | `src/features/settings/components/__tests__/SettingsForm.test.tsx` |
| Results | `src/features/processing/components/results/__tests__/*.test.tsx` |

## Convenciones

- Probar comportamiento visible, no detalles internos.
- Mockear `fetch` y providers cuando se prueba la UI.
- Cubrir estados de carga, error, vacío y éxito.
- Agregar tests cuando cambie una respuesta normalizada.
- Si cambia un contrato backend, actualizar tipos y tests de cliente.

## Enlaces relacionados

- [Desarrollo](development.md)
- [Integración API](api-integration.md)
- [Troubleshooting](troubleshooting.md)
