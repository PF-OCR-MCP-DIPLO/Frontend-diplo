import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { AppShell } from '@/app/layouts/AppShell';

describe('AppShell', () => {
  it('renders skip link and navigation', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <Routes>
          <Route element={<AppShell />}>
            <Route index element={<main id='app-main'>Contenido</main>} />
          </Route>
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText(/Saltar al contenido principal/i)).toBeInTheDocument();
    expect(screen.getByLabelText('Resumen')).toBeInTheDocument();
    expect(screen.getByLabelText('Carga')).toBeInTheDocument();
    expect(screen.getByLabelText('Resultados')).toBeInTheDocument();
    expect(screen.getByLabelText('Historial')).toBeInTheDocument();
    expect(screen.getByLabelText('Configuracion')).toBeInTheDocument();
  });
});

