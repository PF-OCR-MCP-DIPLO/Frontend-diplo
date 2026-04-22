import { useId, useState } from 'react';
import { AlertCircle, ChevronDown, ChevronRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import type { ConsignmentRow } from '@/features/processing/types/processing.types';

interface ResultsErrorPanelProps {
  data: ConsignmentRow[];
  onErrorClick: (rowId: string) => void;
}

export function ResultsErrorPanel({ data, onErrorClick }: ResultsErrorPanelProps) {
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
                  <span className='font-medium text-foreground'>{row.referencia || 'Fila sin referencia'}</span>
                </div>
                <span className='text-sm text-danger'>{row.errors.length} hallazgo{row.errors.length === 1 ? '' : 's'}</span>
              </button>
              {isExpanded ? (
                <div id={contentId} className='mt-3 space-y-2 border-t border-danger/16 pt-3'>
                  {row.errors.map((error, index) => (
                    <div key={`${row.id}-${index}`} className='text-sm'>
                      <p className='font-medium text-danger'>Detalle</p>
                      <p className='text-surface-danger-foreground'>{error}</p>
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
