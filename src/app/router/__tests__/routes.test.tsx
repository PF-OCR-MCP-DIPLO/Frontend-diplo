import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { AppRoutes } from '@/app/router/routes';
import { appNavigation } from '@/lib/constants/navigation';

// Mock pages to keep tests focused on routing contract.
vi.mock('@/pages/dashboard/DashboardPage', () => ({ DashboardPage: () => <div>Dashboard</div> }));
vi.mock('@/pages/upload/UploadPage', () => ({ UploadPage: () => <div>Upload</div> }));
vi.mock('@/pages/results/ResultsPage', () => ({ ResultsPage: () => <div>Results</div> }));
vi.mock('@/pages/history/HistoryPage', () => ({ HistoryPage: () => <div>History</div> }));
vi.mock('@/pages/settings/SettingsPage', () => ({ SettingsPage: () => <div>Settings</div> }));
vi.mock('@/pages/assistant/AssistantPage', () => ({ AssistantPage: () => <div>Assistant</div> }));
vi.mock('@/pages/about/AboutPage', () => ({ AboutPage: () => <div>About</div> }));

describe('AppRoutes', () => {
  it('renders expected route element', () => {
    render(
      <MemoryRouter initialEntries={['/settings']}>
        <AppRoutes />
      </MemoryRouter>
    );
    expect(screen.getByText('Settings')).toBeInTheDocument();
  });

  it('keeps settings route represented in navigation', () => {
    expect(appNavigation.some((item) => item.to === '/settings' && item.label === 'Configuracion')).toBe(true);
  });

  it('keeps about route represented in navigation', () => {
    expect(appNavigation.some((item) => item.to === '/about' && item.label === 'About')).toBe(true);
  });

  it('redirects unknown routes to dashboard', () => {
    render(
      <MemoryRouter initialEntries={['/unknown']}>
        <AppRoutes />
      </MemoryRouter>
    );
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
  });
  
  it('renders assistant route', () => {
    render(
      <MemoryRouter initialEntries={['/assistant']}>
        <AppRoutes />
      </MemoryRouter>
    );

    expect(screen.getByText('Assistant')).toBeInTheDocument();
  });

  it('renders about route', () => {
    render(
      <MemoryRouter initialEntries={['/about']}>
        <AppRoutes />
      </MemoryRouter>
    );

    expect(screen.getByText('About')).toBeInTheDocument();
  });
});
