import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { ResultsCorrectionsPanel } from '@/features/processing/components/results/ResultsCorrectionsPanel';

describe('ResultsCorrectionsPanel', () => {
  it('shows autosave status and retry action', () => {
    const onSaveCorrections = vi.fn();
    const onRetryAutosave = vi.fn();

    render(
      <ResultsCorrectionsPanel
        hasUnsavedChanges
        canSaveCorrections
        isSavingCorrections={false}
        autosave={{ key: '42', status: 'error', error: 'Network down', retryCount: 1 }}
        onSaveCorrections={onSaveCorrections}
        onRetryAutosave={onRetryAutosave}
      />,
    );

    expect(screen.getByText('Network down')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Reintentar/i })).toBeEnabled();

    fireEvent.click(screen.getByRole('button', { name: /Reintentar/i }));

    expect(onRetryAutosave).toHaveBeenCalledTimes(1);
    expect(onSaveCorrections).not.toHaveBeenCalled();
  });
});
