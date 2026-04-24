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
  return (
    <section className='surface-card p-5'>
      <div className='flex items-start justify-between gap-3'>
        <div>
          <p className='section-kicker'>Secundario</p>
          <h3 className='mt-1 text-lg font-semibold tracking-tight text-foreground'>Hallazgos</h3>
        </div>
        <Button variant='ghost' size='sm' onClick={onToggleIssues}>
          {showIssues ? 'Ocultar' : 'Mostrar'}
        </Button>
      </div>
      {showIssues ? (
        <div className='mt-4 space-y-4'>
          {errorMessage ? <div className='notice-warning'>{errorMessage}</div> : null}
          {errorCount > 0 ? (
            <>
              <ResultsErrorPanel data={data} onErrorClick={onErrorClick} />
              <Button variant='outline' className='gap-2' onClick={onOpenDetails}>
                <XCircle className='size-4' />
                Ver detalle completo
              </Button>
            </>
          ) : (
            <div className='notice-success'>No hay hallazgos pendientes.</div>
          )}
        </div>
      ) : null}
    </section>
  );
}
