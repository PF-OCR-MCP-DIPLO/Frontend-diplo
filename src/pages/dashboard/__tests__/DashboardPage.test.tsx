import { render, screen, fireEvent } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { DashboardPage } from '@/pages/dashboard/DashboardPage';

const navigateMock = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return {
    ...actual,
    useNavigate: () => navigateMock,
  };
});

vi.mock('@/features/processing/hooks/useOpenResult', () => ({
  useOpenResult: () => vi.fn(),
}));

vi.mock('@/features/processing/hooks/useProcessingContext', () => ({
  useProcessingActionsContext: () => ({
    refreshHistory: vi.fn(),
  }),
  useProcessingHistoryContext: () => ({
    processedFiles: [],
    isLoadingHistory: false,
    historyError: null,
  }),
}));

describe('DashboardPage', () => {
  beforeEach(() => {
    navigateMock.mockReset();
  });

  it('renders dashboard and navigates to upload CTA', () => {
    render(<DashboardPage />);
    expect(screen.getByText(/Centro de operaciones documentales/i)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /Iniciar nueva carga/i }));
    expect(navigateMock).toHaveBeenCalledWith('/upload');
  });
});

