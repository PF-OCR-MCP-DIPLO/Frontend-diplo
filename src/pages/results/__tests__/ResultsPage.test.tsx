import { render, screen, fireEvent } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { ResultsPage } from '@/pages/results/ResultsPage';

const navigateMock = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return {
    ...actual,
    useNavigate: () => navigateMock,
  };
});

vi.mock('@/features/processing/hooks/useProcessingContext', () => ({
  useProcessingActionsContext: () => ({
    runProcessing: vi.fn(),
    refreshJob: vi.fn(),
    exportCurrentJob: vi.fn(),
    saveCurrentCorrections: vi.fn(),
  }),
  useProcessingCurrentResultContext: () => ({
    currentResults: null,
  }),
  useProcessingFlagsContext: () => ({
    isProcessing: false,
    isRefreshing: false,
    isExporting: false,
    isSavingCorrections: false,
  }),
}));

describe('ResultsPage', () => {
  it('shows empty state when there is no active result', () => {
    render(<ResultsPage />);
    expect(screen.getByText(/No hay un resultado activo/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Ir a carga/i })).toBeInTheDocument();
  });

  it('navigates to upload from empty state CTA', () => {
    render(<ResultsPage />);
    fireEvent.click(screen.getByRole('button', { name: /Ir a carga/i }));
    expect(navigateMock).toHaveBeenCalledWith('/upload');
  });
});
