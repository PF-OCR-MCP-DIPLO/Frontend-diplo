import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { MemoryRouter, Outlet } from 'react-router-dom';

vi.mock('@/app/providers/AppProviders', () => ({
  AppProviders: ({ children }: { children: React.ReactNode }) => (
    // Provide a router context so <Routes> can render in the App component.
    <MemoryRouter initialEntries={['/']}>{children}</MemoryRouter>
  ),
}));

vi.mock('@/app/layouts/AppShell', () => ({
  AppShell: () => (
    <div data-testid='shell'>
      <Outlet />
    </div>
  ),
}));

vi.mock('@/app/router/routes', () => ({
  AppRoutes: () => <div>Routes</div>,
}));

import App from '@/app/App';

describe('App', () => {
  it('renders routes inside shell', () => {
    render(<App />);
    expect(screen.getByTestId('shell')).toBeInTheDocument();
    expect(screen.getByText('Routes')).toBeInTheDocument();
    expect(screen.getByLabelText('Asistente IA')).toBeInTheDocument();
  });
});
