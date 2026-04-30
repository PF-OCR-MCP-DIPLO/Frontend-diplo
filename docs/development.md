# Desarrollo

## Propósito

Concentrar scripts, flujo de trabajo y prácticas de mantenimiento para el
frontend React/TypeScript.

## Instalación

```bash
npm ci
cp .env.example .env
```

CI y Docker usan `npm ci`. Para trabajo local no reproducible puede usarse
`npm install`.

## Scripts disponibles

| Script | Uso |
| --- | --- |
| `npm run dev` | Servidor Vite |
| `npm run build` | Build producción |
| `npm run preview` | Preview del build |
| `npm run lint` | ESLint |
| `npm run typecheck` | TypeScript sin emitir |
| `npm test` | Vitest |
| `npm run test:coverage` | Vitest con coverage |
| `npm run e2e` | Levanta stack backend y ejecuta Playwright |
| `npm run e2e:pw` | Playwright directo |
| `npm run e2e:pw:ui` | Playwright UI |
| `npm run e2e:install` | Instala navegadores Playwright |

## Flujo recomendado antes de entregar

```bash
npm run lint
npm run typecheck
npm test
npm run build
```

El workflow `.github/workflows/ci.yml` ejecuta `npm ci`, lint, typecheck, tests
con coverage y build.

## Documentación

El workflow de docs ejecuta:

```bash
python -m pip install -r requirements-docs.txt
mkdocs build --strict --site-dir site
```

Si agregas páginas en `docs/`, actualiza `docs/index.md` y `mkdocs.yml`.

## Prácticas por tipo de cambio

| Cambio | Revisión recomendada |
| --- | --- |
| Cliente API | Actualizar `types/*.api.ts`, tests de API y docs |
| Mapper | Actualizar tests de mappers y revisar pantallas consumidoras |
| Hook de estado | Agregar tests de hook/provider si cambia comportamiento observable |
| Componente | Probar estados de carga, error, vacío y éxito |
| Settings OCR/LLM | Revisar normalizadores, formulario, API y docs |
| Resultados/correcciones | Validar autosave, guardado manual y exportación |

## Buenas prácticas

- Mantén side effects en hooks o clientes API.
- No llames `fetch` desde componentes de pantalla si existe un cliente de
  feature.
- Usa `HttpError` para preservar mensajes del backend.
- Centraliza transformación de contratos en mappers.
- Conserva tipos crudos de API separados de tipos de UI.
- No guardes API keys rehidratadas en estado visible.
- Agrega tests cuando cambien normalizadores, payloads o estados de usuario.

## Debug de procesamiento

Desde frontend, una investigación útil debe registrar:

- `jobId`;
- `ocr_mode`, `ocr_provider`, `ocr_model`;
- `llm_provider`, `llm_model`;
- estado del job;
- logs visibles en resultados;
- fila o imagen afectada;
- si autosave estaba `dirty`, `saving`, `saved` o `error`;
- respuesta cruda de API cuando la UI no coincida.

Para sospechas de OCR/binarización, escala al backend con texto OCR bruto,
imagen fuente y configuración exacta.

## Enlaces relacionados

- [Arquitectura](architecture.md)
- [Flujo de procesamiento](processing-flow.md)
- [Integración API](api-integration.md)
- [Testing](testing.md)
- [Troubleshooting](troubleshooting.md)
