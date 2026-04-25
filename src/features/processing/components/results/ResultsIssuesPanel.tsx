import { XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ResultsErrorPanel } from '@/features/processing/components/results/ResultsErrorPanel';
import type { ConsignmentRow } from '@/features/processing/types/processing.types';

interface ResultsIssuesPanelProps {
  data: ConsignmentRow[];
  errorMessage: string;
  errorCount: number;
  showIssues: boolean;
  onToggleIssues: () => void;
  onErrorClick: (rowId: string) => void;
  onOpenDetails: () => void;
}

export function ResultsIssuesPanel({
  data,
  errorMessage,
  errorCount,
  showIssues,
  onToggleIssues,
  onErrorClick,
  onOpenDetails,
}: ResultsIssuesPanelProps) {
  const hasIssues = Boolean(errorMessage) || errorCount > 0;

  return (
    <section className='surface-card p-5'>
      <div className='flex items-start justify-between gap-3'>
        <div>
          <p className='section-kicker'>Detalles</p>
          <h3 className='mt-1 text-lg font-semibold tracking-tight text-foreground'>Hallazgos</h3>
        </div>
        <Button variant='ghost' size='sm' onClick={onToggleIssues}>
          {showIssues ? 'Ocultar' : 'Ver hallazgos'}
        </Button>
      </div>
      <div className='mt-4 space-y-3'>
        {hasIssues ? (
          <div className='content-block-subtle p-4 text-sm text-foreground'>
            {errorMessage ? <p className='font-medium'>{errorMessage}</p> : null}
            <p className='mt-1 text-muted-foreground'>
              {errorCount > 0
                ? `Hay ${errorCount} hallazgo${errorCount === 1 ? '' : 's'} en la tabla.`
                : 'No hay hallazgos pendientes.'}
            </p>
          </div>
        ) : (
          <div className='notice-success'>No hay hallazgos pendientes.</div>
        )}

        {showIssues && errorCount > 0 ? (
          <div className='space-y-4'>
            <ResultsErrorPanel data={data} onErrorClick={onErrorClick} />
            <Button variant='outline' className='gap-2 self-start' onClick={onOpenDetails}>
              <XCircle className='size-4' />
              Ver detalle completo
            </Button>
          </div>
        ) : null}

        {!showIssues && errorCount > 0 ? (
          <Button variant='outline' className='gap-2 self-start' onClick={onToggleIssues}>
            <XCircle className='size-4' />
            Ver hallazgos
          </Button>
        ) : null}
      </div>
    </section>
  );
}
