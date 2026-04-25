import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { ResultsAssistantQuickActions } from '@/features/processing/components/results/ResultsAssistantQuickActions';

describe('ResultsAssistantQuickActions', () => {
  it('opens assistant with a focused row prompt and minimal context', () => {
    const onOpenAssistant = vi.fn();

    render(
      <ResultsAssistantQuickActions
        jobId={7}
        jobStatus='completed_with_errors'
        data={[
          {
            id: 'row-1',
            depositId: 15,
            sourceImageId: 3,
            fecha: '2026-04-01',
            hora: '09:00',
            monto: '100',
            referencia: 'ABC-1',
            sourceName: 'img-1.png',
            estado: 'error',
            errors: ['error'],
          },
        ]}
        sourceImages={[{ id: 3, url: 'https://example.test/img-1.png', name: 'img-1.png', status: 'processed' }]}
        selectedRowId='row-1'
        currentImage={null}
        errorCount={1}
        autosaveStatus='saved'
        onOpenAssistant={onOpenAssistant}
      />,
    );

    expect(screen.getByRole('button', { name: /Preguntar sobre esta fila/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Explicar hallazgo/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Analizar imagen/i })).toBeInTheDocument();

    screen.getByRole('button', { name: /Preguntar sobre esta fila/i }).click();

    expect(onOpenAssistant).toHaveBeenCalledWith(
      expect.objectContaining({
        prompt: expect.stringContaining('fila ABC-1'),
        context: expect.objectContaining({
          jobId: 7,
          selectedRowId: 'row-1',
          depositId: 15,
          sourceImageId: 3,
          errorCount: 1,
          autosaveStatus: 'saved',
          intentHint: 'explain_row_issue',
        }),
      }),
    );
  });
});
