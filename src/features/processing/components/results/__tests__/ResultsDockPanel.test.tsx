import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { ResultsDockPanel } from '@/features/processing/components/results/ResultsDockPanel';

describe('ResultsDockPanel', () => {
  it('renders title and content when open', () => {
    render(
      <ResultsDockPanel
        panel='preview'
        state='open'
        title='Preview'
        description='Documento fuente'
        onMinimize={vi.fn()}
        onRestore={vi.fn()}
        onClose={vi.fn()}
      >
        <p>Contenido del panel</p>
      </ResultsDockPanel>,
    );

    expect(screen.getByTestId('results-dock-panel')).toHaveAttribute('data-panel', 'preview');
    expect(screen.getByTestId('results-dock-panel')).toHaveAttribute('data-state', 'open');
    expect(screen.getByText('Preview')).toBeInTheDocument();
    expect(screen.getByText('Contenido del panel')).toBeInTheDocument();
  });

  it('minimizes and restores without losing the panel mode', () => {
    const onMinimize = vi.fn();
    const onRestore = vi.fn();

    const { rerender } = render(
      <ResultsDockPanel panel='logs' state='open' title='Logs' onMinimize={onMinimize} onRestore={onRestore} onClose={vi.fn()}>
        <p>Bitácora</p>
      </ResultsDockPanel>,
    );

    fireEvent.click(screen.getByRole('button', { name: /Minimizar panel Logs/i }));
    expect(onMinimize).toHaveBeenCalledTimes(1);

    rerender(
      <ResultsDockPanel panel='logs' state='minimized' title='Logs' onMinimize={onMinimize} onRestore={onRestore} onClose={vi.fn()}>
        <p>Bitácora</p>
      </ResultsDockPanel>,
    );

    expect(screen.getByTestId('results-dock-panel')).toHaveAttribute('data-panel', 'logs');
    expect(screen.getByTestId('results-dock-panel')).toHaveAttribute('data-state', 'minimized');
    expect(screen.queryByText('Bitácora')).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Restaurar panel Logs/i }));
    expect(onRestore).toHaveBeenCalledTimes(1);
  });

  it('closes with the close button and exposes aria labels', () => {
    const onClose = vi.fn();

    render(
      <ResultsDockPanel panel='issues' state='open' title='Hallazgos' onMinimize={vi.fn()} onRestore={vi.fn()} onClose={onClose}>
        <p>Lista</p>
      </ResultsDockPanel>,
    );

    expect(screen.getByLabelText('Panel Hallazgos')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /Cerrar panel Hallazgos/i }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
