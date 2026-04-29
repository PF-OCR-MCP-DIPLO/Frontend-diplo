import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { AppShell } from '@/app/layouts/AppShell';

vi.mock('@/components/AIChat', () => ({
  AIChat: () => <div>Assistant content</div>,
}));

vi.mock('@/features/processing/components/ProcessingHeaderProgress', () => ({
  ProcessingHeaderProgress: () => <div data-testid='processing-header-progress' />,
}));

describe('AppShell', () => {
  it('renders skip link and navigation', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <Routes>
          <Route element={<AppShell />}>
            <Route index element={<main id='app-main'>Contenido</main>} />
          </Route>
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByText(/Saltar al contenido principal/i)).toBeInTheDocument();
    expect(screen.getByLabelText('Resumen')).toBeInTheDocument();
    expect(screen.getByLabelText('Carga')).toBeInTheDocument();
    expect(screen.getByLabelText('Resultados')).toBeInTheDocument();
    expect(screen.getByLabelText('Historial')).toBeInTheDocument();
    expect(screen.getAllByLabelText('Configuracion')).toHaveLength(1);
    expect(screen.getByTestId('processing-header-progress')).toBeInTheDocument();
    expect(screen.queryByText('Ventana flotante persistente')).not.toBeInTheDocument();
  });

  it('marks settings as current navigation item and navigates there', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <Routes>
          <Route element={<AppShell />}>
            <Route index element={<div>Resumen page</div>} />
            <Route path='/settings' element={<div>Settings page</div>} />
          </Route>
        </Routes>
      </MemoryRouter>,
    );

    fireEvent.click(screen.getByRole('link', { name: 'Configuracion' }));

    expect(screen.getByText('Settings page')).toBeInTheDocument();
    expect(screen.getAllByText('OCR y modelos').length).toBeGreaterThan(0);
  });

  it('closes mobile sidebar on route change and keeps navigation working after assistant', async () => {
    render(
      <MemoryRouter initialEntries={['/assistant']}>
        <Routes>
          <Route element={<AppShell />}>
            <Route path='/' element={<div>Resumen page</div>} />
            <Route path='/assistant' element={<div>Assistant page</div>} />
            <Route path='/results' element={<div>Resultados page</div>} />
          </Route>
        </Routes>
      </MemoryRouter>,
    );

    fireEvent.click(screen.getByRole('button', { name: /Abrir menu de navegacion/i }));
    fireEvent.click(screen.getAllByRole('link', { name: 'Resultados' })[0]);

    await waitFor(() => expect(screen.getByText('Resultados page')).toBeInTheDocument());
    expect(screen.queryByText('Assistant page')).not.toBeInTheDocument();
    expect(screen.queryByText(/bg-slate-950\/48/i)).not.toBeInTheDocument();
  });
});