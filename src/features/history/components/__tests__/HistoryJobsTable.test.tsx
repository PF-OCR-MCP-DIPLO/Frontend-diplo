import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { HistoryJobsTable } from '@/features/history/components/HistoryJobsTable';

const items = [
  {
    id: '7',
    jobId: 7,
    name: 'marzo.docx',
    date: new Date('2026-04-21T00:00:00Z'),
    status: 'completed_with_errors' as const,
    displayStatus: 'error' as const,
  },
  {
    id: '8',
    jobId: 8,
    name: 'abril.docx',
    date: new Date('2026-04-22T00:00:00Z'),
    status: 'processing' as const,
    displayStatus: 'success' as const,
  },
];

describe('HistoryJobsTable', () => {
  it('renders actions for each row', () => {
    render(
      <HistoryJobsTable
        items={items}
        onOpenResult={vi.fn()}
        onProcessJob={vi.fn()}
        onReprocessFailedJob={vi.fn()}
        onExportJob={vi.fn()}
        onDeleteJob={vi.fn()}
      />,
    );

    expect(screen.getAllByRole('button', { name: /Abrir/i })).toHaveLength(2);
    expect(screen.getByRole('button', { name: /Reprocesar fallidos ejecución marzo\.docx/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Exportar ejecución marzo\.docx/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Eliminar ejecución marzo\.docx/i })).toBeInTheDocument();
  });

  it('disables destructive and processing actions for processing jobs', () => {
    render(
      <HistoryJobsTable
        items={items}
        onOpenResult={vi.fn()}
        onProcessJob={vi.fn()}
        onReprocessFailedJob={vi.fn()}
        onExportJob={vi.fn()}
        onDeleteJob={vi.fn()}
      />,
    );

    expect(screen.getByRole('button', { name: /Procesar ejecución abril\.docx/i })).toBeDisabled();
    expect(screen.getByRole('button', { name: /Eliminar ejecución abril\.docx/i })).toBeDisabled();
  });

  it('keeps other row actions enabled while one row is deleting', () => {
    render(
      <HistoryJobsTable
        items={items}
        deletingJobId={7}
        onOpenResult={vi.fn()}
        onProcessJob={vi.fn()}
        onReprocessFailedJob={vi.fn()}
        onExportJob={vi.fn()}
        onDeleteJob={vi.fn()}
      />,
    );

    expect(screen.getByRole('button', { name: /Eliminar ejecución marzo\.docx/i })).toBeDisabled();
    expect(screen.getAllByRole('button', { name: /Abrir/i })[1]).toBeEnabled();
  });

  it('dispatches row actions without triggering row navigation', () => {
    const onOpenResult = vi.fn();
    const onDeleteJob = vi.fn();

    render(
      <HistoryJobsTable
        items={items}
        onOpenResult={onOpenResult}
        onProcessJob={vi.fn()}
        onReprocessFailedJob={vi.fn()}
        onExportJob={vi.fn()}
        onDeleteJob={onDeleteJob}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: /Eliminar ejecución marzo\.docx/i }));

    expect(onDeleteJob).toHaveBeenCalledWith(7);
    expect(onOpenResult).not.toHaveBeenCalled();
  });
});
