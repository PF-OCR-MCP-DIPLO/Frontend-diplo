import { render, screen, fireEvent } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { HistoryPage } from '@/pages/history/HistoryPage';

const navigateMock = vi.fn();
const refreshHistoryMock = vi.fn();

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
    refreshHistory: refreshHistoryMock,
  }),
  useProcessingHistoryContext: () => ({
    processedFiles: [],
    isLoadingHistory: false,
    historyError: null,
  }),
}));

describe('HistoryPage', () => {
  beforeEach(() => {
    navigateMock.mockReset();
    refreshHistoryMock.mockReset();
  });

  it('shows empty state when there are no jobs', () => {
    render(<HistoryPage />);
    expect(screen.getByText(/Todavia no hay ejecuciones/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Procesar un archivo/i })).toBeInTheDocument();
  });

  it('navigates to upload from empty state CTA', () => {
    render(<HistoryPage />);
    fireEvent.click(screen.getByRole('button', { name: /Procesar un archivo/i }));
    expect(navigateMock).toHaveBeenCalledWith('/upload');
  });
});

