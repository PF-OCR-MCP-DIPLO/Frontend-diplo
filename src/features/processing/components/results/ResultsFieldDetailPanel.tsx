import { Button } from '@/components/ui/button';
import type { AssistantLaunchContext } from '@/features/assistant/hooks/useOpenAssistantWithContext';
import type { ConsignmentRow, ResultFieldKey } from '@/features/processing/types/processing.types';
import type { FieldValidationIssue, ResultsValidationMap } from '@/features/processing/components/results/results-validation';
import { getCellIssueSummary, getFieldLabel, getRowFieldIssues } from '@/features/processing/components/results/results-validation';

interface ResultsFieldDetailContentProps {
  jobId: number;
  row: ConsignmentRow | null;
  field: ResultFieldKey | null;
  validationMap: ResultsValidationMap;
  reprocessingDepositId?: number | null;
  onEdit: (rowId: string, field: ResultFieldKey) => void;
  onAskAssistant: (launch: AssistantLaunchContext) => void;
  onReprocessDeposit: (depositId: number) => void;
}

function issueSummary(issues: FieldValidationIssue[]) {
  return issues.length > 0 ? issues.map((issue) => issue.message).join(' ') : 'Sin errores detectados.';
}

export function ResultsFieldDetailContent({
  jobId,
  row,
  field,
  validationMap,
  reprocessingDepositId,
  onEdit,
  onAskAssistant,
  onReprocessDeposit,
}: ResultsFieldDetailContentProps) {
  if (!row || !field) return null;

  const issues = getRowFieldIssues(validationMap, row.id, field, row);
  const cellSummary = getCellIssueSummary(row, field, issues);

  return (
    <div className='space-y-4 text-sm'>
      <section className='rounded-2xl border border-border/60 bg-surface-subtle p-3'>
        <p className='text-xs uppercase tracking-[0.16em] text-muted-foreground'>Campo</p>
        <p className='mt-1 text-foreground'>{getFieldLabel(field)} · Fila {row.referencia || row.id}</p>
      </section>
      <section className='rounded-2xl border border-border/60 bg-surface-subtle p-3'>
        <p className='text-xs uppercase tracking-[0.16em] text-muted-foreground'>Valor actual</p>
        <p className='mt-1 text-foreground'>{String(row[field]) || '—'}</p>
      </section>
      <section className='rounded-2xl border border-danger/20 bg-surface-danger p-3'>
        <p className='text-xs uppercase tracking-[0.16em] text-muted-foreground'>Error</p>
        <p className='mt-1 text-danger'>{issueSummary(issues)}</p>
      </section>
      <section className='rounded-2xl border border-border/60 bg-surface-subtle p-3'>
        <p className='text-xs uppercase tracking-[0.16em] text-muted-foreground'>Sugerencia</p>
        <p className='mt-1 text-foreground'>{cellSummary.correctionHint}</p>
      </section>
      <div className='grid gap-2'>
        <Button type='button' className='w-full justify-start' variant='outline' onClick={() => onEdit(row.id, field)}>
          Editar
        </Button>
        <Button
          type='button'
          className='w-full justify-start'
          variant='outline'
          onClick={() =>
            onAskAssistant({
              prompt: `Explícame cómo corregir ${String(field)} en la fila ${row.id}.`,
              context: {
                page: 'results',
                jobId,
                selectedRowId: row.id,
                selectedField: String(field),
                depositId: row.depositId,
                sourceImageId: row.sourceImageId,
                currentImageId: row.sourceImageId,
                contextScope: 'cell',
                intentHint: 'explain_cell_issue',
              },
            })
          }
        >
          Preguntar al asistente
        </Button>
        <Button type='button' className='w-full justify-start' onClick={() => onReprocessDeposit(row.depositId)} disabled={reprocessingDepositId === row.depositId}>
          {reprocessingDepositId === row.depositId ? 'Reprocesando…' : 'Reprocesar esta consignación'}
        </Button>
      </div>
    </div>
  );
}
