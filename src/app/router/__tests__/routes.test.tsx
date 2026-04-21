import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { AppRoutes } from '@/app/router/routes';

// Mock pages to keep tests focused on routing contract.
vi.mock('@/pages/dashboard/DashboardPage', () => ({ DashboardPage: () => <div>Dashboard</div> }));
vi.mock('@/pages/upload/UploadPage', () => ({ UploadPage: () => <div>Upload</div> }));
vi.mock('@/pages/results/ResultsPage', () => ({ ResultsPage: () => <div>Results</div> }));
vi.mock('@/pages/history/HistoryPage', () => ({ HistoryPage: () => <div>History</div> }));
vi.mock('@/pages/settings/SettingsPage', () => ({ SettingsPage: () => <div>Settings</div> }));

describe('AppRoutes', () => {
  it('renders expected route element', () => {
    render(
      <MemoryRouter initialEntries={['/settings']}>
        <AppRoutes />
      </MemoryRouter>
    );
    expect(screen.getByText('Settings')).toBeInTheDocument();
  });

  it('redirects unknown routes to dashboard', () => {
    render(
      <MemoryRouter initialEntries={['/unknown']}>
        <AppRoutes />
      </MemoryRouter>
    );
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
  });
});
