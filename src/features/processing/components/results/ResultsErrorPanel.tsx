import { useId, useState } from 'react';
import { AlertCircle, ChevronDown, ChevronRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { ConsignmentRow, ResultFieldKey } from '@/features/processing/types/processing.types';
import type { ResultsValidationMap } from '@/features/processing/components/results/results-validation';
import { getFieldLabel, getRowFieldIssues, getRowGeneralIssues } from '@/features/processing/components/results/results-validation';

interface ResultsErrorPanelProps {
  data: ConsignmentRow[];
  validationMap: ResultsValidationMap;
  selectedRowId?: string | null;
  selectedField?: string | null;
  onErrorClick: (rowId: string) => void;
  onFocusCell: (rowId: string, field: ResultFieldKey) => void;
  onAskAssistant: (rowId: string, field: ResultFieldKey) => void;
}

export function ResultsErrorPanel({ data, validationMap, selectedRowId, selectedField, onErrorClick, onFocusCell, onAskAssistant }: ResultsErrorPanelProps) {
  const [expanded, setExpanded] = useState<string[]>([]);
  const panelIdPrefix = useId();
  const errorsData = data.filter((row) => row.estado === 'error');

  if (errorsData.length === 0) {
    return null;
  }

  return (
    <Card className='border-0 bg-transparent p-0 shadow-none'>
      <div className='mb-4 flex items-center gap-2'>
        <AlertCircle className='size-5 text-danger' />
        <h3 className='font-semibold text-foreground'>Hallazgos</h3>
        <Badge variant='destructive'>{errorsData.length}</Badge>
      </div>
      <div className='space-y-2'>
        {errorsData.map((row) => {
          const isExpanded = expanded.includes(row.id);
          const contentId = `${panelIdPrefix}-${row.id}`;
          const rowIssues = Object.keys(validationMap.fieldIssuesByRow[row.id] ?? {}) as ResultFieldKey[];
          const generalIssues = getRowGeneralIssues(validationMap, row.id, row);
          return (
            <div key={row.id} className='danger-card'>
              <button
                aria-expanded={isExpanded}
                aria-controls={contentId}
                onClick={() => setExpanded((prev) => prev.includes(row.id) ? prev.filter((id) => id !== row.id) : [...prev, row.id])}
                className='focus-ring flex w-full items-center justify-between gap-3 rounded-xl text-left'
              >
                <div className='flex items-center gap-2'>
                  {isExpanded ? <ChevronDown className='size-4 text-muted-foreground' /> : <ChevronRight className='size-4 text-muted-foreground' />}
                  <span className={`font-medium text-foreground ${selectedRowId === row.id ? 'rounded-md bg-primary/8 px-1.5 py-0.5 ring-1 ring-primary/20' : ''}`}>{row.referencia || 'Fila sin referencia'}</span>
                </div>
                <span className='text-sm text-danger'>{row.errors.length} hallazgo{row.errors.length === 1 ? '' : 's'}</span>
              </button>
              {isExpanded ? (
                <div id={contentId} className='mt-3 space-y-2 border-t border-danger/16 pt-3'>
                  {rowIssues.map((field) => {
                    const issues = getRowFieldIssues(validationMap, row.id, field, row);
                    return (
                      <div key={`${row.id}-${field}`} className={`rounded-xl border px-3 py-2 text-sm ${selectedRowId === row.id && selectedField === field ? 'border-primary/25 bg-primary/5' : 'border-border/60 bg-surface-subtle'}`}>
                        <p className='font-medium text-foreground'>{getFieldLabel(field)}</p>
                        {issues.map((issue) => <p key={issue.id} className='text-danger'>{issue.message}</p>)}
                        <div className='mt-2 flex flex-wrap gap-2'>
                          <Button type='button' variant='ghost' size='sm' className='h-7 px-2 text-[11px]' onClick={() => onFocusCell(row.id, field)}>
                            Ir a celda
                          </Button>
                          <Button type='button' variant='ghost' size='sm' className='h-7 px-2 text-[11px]' onClick={() => onAskAssistant(row.id, field)}>
                            Preguntar al asistente
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                  {generalIssues.map((issue) => (
                    <div key={issue.id} className='rounded-xl border border-border/60 bg-surface-subtle px-3 py-2 text-sm'>
                      <p className='font-medium text-foreground'>Detalle</p>
                      <p className='text-danger'>{issue.message}</p>
                    </div>
                  ))}
                  <button onClick={() => onErrorClick(row.id)} className='text-sm font-semibold text-primary hover:text-primary-strong'>
                    Ir a la fila
                  </button>
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    </Card>
  );
}
