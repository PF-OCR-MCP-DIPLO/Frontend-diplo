# Testing

## Propósito

Documentar pruebas disponibles y comandos reales para validar frontend.

## Comandos verificados en `package.json`

```bash
npm test
npm run test:coverage
npm run e2e
npm run e2e:pw
```

## Cobertura funcional esperada

- Unit/integration: hooks, utilidades, mappers y componentes críticos.
- E2E: flujos de usuario principales definidos en scripts de proyecto.

## Validaciones complementarias

```bash
npm run lint
npm run typecheck
npm run build
```

## Pendiente de validar

- Alcance exacto de cobertura por feature en todas las suites E2E heredadas.

## Enlaces relacionados

- [Desarrollo](development.md)
- [Arquitectura](architecture.md)
