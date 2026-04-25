# QA Assistant E2E

Checklist manual para validar el flujo real del producto de punta a punta.

## Preparación

- Backend levantado con Django REST.
- Frontend levantado con Vite.
- Ollama local activo y con modelos disponibles.
- Un `.docx` de prueba con consignaciones e imágenes listo para subir.

## 1. Health Backend

- [ ] Abrir `GET /api/health/`.
- [ ] Confirmar respuesta exitosa.
- [ ] Confirmar que el backend está operativo antes de seguir.

## 2. Ollama

- [ ] Verificar `GET /api/tags`.
- [ ] Confirmar que la respuesta lista los modelos locales.
- [ ] Abrir Settings.
- [ ] Confirmar que la UI muestra modelos detectados.

## 3. Settings

- [ ] Cambiar `assistant_model`.
- [ ] Cambiar `assistant_temperature`.
- [ ] Cambiar `assistant_num_predict`.
- [ ] Guardar la configuración.
- [ ] Confirmar que dejar vacíos los campos de API key no borra las claves guardadas.
- [ ] Recargar la página.
- [ ] Confirmar que los valores persisten después del reload.

## 4. Chat General

- [ ] Enviar `hola`.
- [ ] Enviar `qué puedes hacer`.
- [ ] Enviar `cuáles son tus herramientas MCP`.
- [ ] Enviar `ayuda`.

## 5. Chat Con Herramientas

- [ ] Enviar `listar jobs recientes`.
- [ ] Enviar `ver configuración`.
- [ ] Enviar `cuántos registros hay`.
- [ ] Enviar `muéstrame los últimos registros`.
- [ ] Enviar `cuál fue el último valor extraído`.

## 6. Flujo de Documento

- [ ] Subir un `.docx` válido.
- [ ] Procesar el job.
- [ ] Revisar resultados.
- [ ] Abrir logs.
- [ ] Corregir una fila manualmente.
- [ ] Guardar correcciones.
- [ ] Exportar Excel.

## 7. Chat Dentro de Resultados

- [ ] Confirmar que el chat recibe `job_id`.
- [ ] Preguntar `qué errores tiene este job`.
- [ ] Preguntar `resume este procesamiento`.
- [ ] Pedir `genera el Excel`.
- [ ] Pedir `cambia el valor del registro X a Y`.
- [ ] Pedir `cambia la referencia del registro X a ABC123`.

## 8. UI Del Chat

- [ ] Confirmar que el JSON técnico está colapsado por defecto.
- [ ] Confirmar que el label de herramienta es discreto.
- [ ] Confirmar que `Enter` envía el mensaje.
- [ ] Confirmar que `Shift+Enter` crea un salto de línea.
- [ ] Confirmar que limpiar conversación funciona.
- [ ] Confirmar que los chips de sugerencias funcionan.

## 9. Errores Esperados

- [ ] Ollama apagado.
- [ ] Modelo inexistente.
- [ ] Backend apagado.
- [ ] `job_id` faltante para acciones de job.
- [ ] Intento de modificar un registro inexistente.
- [ ] Intento de exportar un job no completado.

## Resultado

- Fecha de ejecución:
- Navegador:
- Backend commit / branch:
- Frontend commit / branch:
- Observaciones:
- Bugs encontrados:
- Bugs corregidos:
