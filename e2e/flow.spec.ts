import { test, expect } from '@playwright/test';
import path from 'node:path';

const fixturesDir = path.join(process.cwd(), 'e2e', 'fixtures');

test('Navigation: Dashboard -> Upload -> Results -> History -> Settings', async ({ page }) => {
  await page.goto('/');

  await expect(page.getByText('Centro de operaciones documentales')).toBeVisible();

  await page.getByLabel('Carga').click();
  await expect(page.getByText('Carga documental guiada')).toBeVisible();

  await page.getByLabel('Resultados').click();
  await expect(page.getByText(/Todavia no hay un resultado activo/i)).toBeVisible();

  await page.getByLabel('Historial').click();
  await expect(page.getByText('Historial de ejecuciones')).toBeVisible();

  await page.getByLabel('Configuracion').click();
  await expect(page.getByText('Configuracion del procesamiento')).toBeVisible();
});

test('E2E happy path: upload -> process -> results -> export', async ({ page }) => {
  await page.goto('/upload');
  const filePath = path.join(fixturesDir, 'happy.docx');
  await page.setInputFiles('input[type="file"]', filePath);

  await expect(page.getByText('Resultados del procesamiento')).toBeVisible({ timeout: 30_000 });

  await page.getByRole('button', { name: /Iniciar procesamiento|Procesar de nuevo/i }).click();
  await expect(page.getByText(/Estado:\s*Completado/i)).toBeVisible({ timeout: 30_000 });
  await expect(page.getByText('REF001')).toBeVisible();

  await page.getByRole('button', { name: /Generar Excel/i }).click();
  await expect(page.getByRole('link', { name: /Descargar Excel/i })).toBeVisible({ timeout: 30_000 });
});

test('E2E completed_with_errors: invalid image triggers logs', async ({ page }) => {
  await page.goto('/upload');
  const filePath = path.join(fixturesDir, 'one-invalid-image.docx');
  await page.setInputFiles('input[type="file"]', filePath);

  await expect(page.getByText('Resultados del procesamiento')).toBeVisible({ timeout: 30_000 });
  await page.getByRole('button', { name: /Iniciar procesamiento|Procesar de nuevo/i }).click();
  await expect(page.getByText(/Estado:\s*Con observaciones/i)).toBeVisible({ timeout: 30_000 });

  await page.getByRole('button', { name: /Hallazgos y herramientas tecnicas/i }).click();
  await page.getByRole('button', { name: /Consultar logs/i }).click();
  await expect(page.getByText(/image_failed/i)).toBeVisible({ timeout: 30_000 });
});

test('Network error handling: History shows error state when API is unreachable', async ({ page }) => {
  await page.goto('/history');

  await page.route('**/api/jobs/**', async (route) => {
    await route.abort();
  });

  await page.getByRole('button', { name: /Actualizar historial|Reintentar/i }).click();

  await expect(page.getByText(/No pudimos cargar el historial/i)).toBeVisible({ timeout: 30_000 });
});

