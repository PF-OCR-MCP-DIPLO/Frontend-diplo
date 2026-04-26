import { test, expect } from '@playwright/test';
import path from 'node:path';

const fixturesDir = path.join(process.cwd(), 'e2e', 'fixtures');

test('Navigation: Dashboard -> Upload -> Results -> History -> Settings', async ({ page }) => {
  await page.goto('/');

  await expect(page.getByRole('heading', { name: 'Resumen del flujo' })).toBeVisible();

  await page.getByLabel('Carga').click();
  await expect(page.getByRole('heading', { name: 'Cargar archivo' })).toBeVisible();

  await page.getByLabel('Resultados').click();
  await expect(page.getByText(/No hay un resultado activo/i)).toBeVisible();

  await page.getByLabel('Historial').click();
  await expect(page.getByRole('heading', { name: 'Historial' })).toBeVisible();

  await page.getByRole('navigation').getByRole('link', { name: 'Configuracion' }).click();
  await expect(page.getByText(/Configuracion|No pudimos cargar la configuracion/i).first()).toBeVisible();
});

test('E2E happy path: upload -> process -> results -> export', async ({ page }) => {
  await page.goto('/upload');
  const filePath = path.join(fixturesDir, 'happy.docx');
  await page.setInputFiles('input[type="file"]', filePath);

  await expect(page.getByText('happy.docx')).toBeVisible({ timeout: 30_000 });

  await page.getByRole('button', { name: /^Procesar$/i }).click();
  await expect(page.getByText(/completed/i)).toBeVisible({ timeout: 30_000 });
  await expect(page.getByText('REF001').first()).toBeVisible();

  await page.getByRole('button', { name: /Excel/i }).click();
  await expect(page.getByRole('link', { name: /Descargar/i })).toBeVisible({ timeout: 30_000 });
});

test('E2E completed_with_errors: invalid image triggers logs', async ({ page }) => {
  await page.goto('/upload');
  const filePath = path.join(fixturesDir, 'one-invalid-image.docx');
  await page.setInputFiles('input[type="file"]', filePath);

  await expect(page.getByText('one-invalid-image.docx')).toBeVisible({ timeout: 30_000 });
  await page.getByRole('button', { name: /^Procesar$/i }).click();
  await expect(page.getByText(/completed with_errors/i)).toBeVisible({ timeout: 30_000 });

  await page.getByRole('button', { name: /Logs/i }).click();
  await expect(page.getByText(/image_failed/i)).toBeVisible({ timeout: 30_000 });
});

test('Network error handling: History shows error state when API is unreachable', async ({ page }) => {
  await page.goto('/history');

  await page.route('**/api/jobs/**', async (route) => {
    await route.abort();
  });

  await page.getByRole('button', { name: /Actualizar|Reintentar/i }).click();

  await expect(page.getByText(/No pudimos cargar el historial/i)).toBeVisible({ timeout: 30_000 });
});
