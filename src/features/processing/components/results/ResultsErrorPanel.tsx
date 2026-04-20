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
    <Card className='rounded-[28px] border-red-100 bg-[linear-gradient(135deg,rgba(254,242,242,0.86),rgba(255,255,255,0.98))] p-5 shadow-sm'>
      <div className='mb-4 flex items-center gap-2'>
        <AlertCircle className='size-5 text-red-600' />
        <h3 className='font-semibold text-slate-900'>Hallazgos a corregir</h3>
        <Badge variant='destructive'>{errorsData.length}</Badge>
      </div>
      <p className='mb-4 text-sm leading-6 text-slate-700'>
        Usa este panel para ir directo a las filas con errores y resolver cada observacion sin perder contexto.
      </p>
      <div className='space-y-2'>
        {errorsData.map((row) => {
          const isExpanded = expanded.includes(row.id);
          const contentId = `${panelIdPrefix}-${row.id}`;
          return (
            <div key={row.id} className='rounded-2xl border border-red-200 bg-white/80 p-3'>
              <button
                aria-expanded={isExpanded}
                aria-controls={contentId}
                onClick={() => setExpanded((prev) => prev.includes(row.id) ? prev.filter((id) => id !== row.id) : [...prev, row.id])}
                className='flex w-full items-center justify-between gap-3 text-left'
              >
                <div className='flex items-center gap-2'>
                  {isExpanded ? <ChevronDown className='size-4 text-slate-600' /> : <ChevronRight className='size-4 text-slate-600' />}
                  <span className='font-medium text-slate-900'>Fila: {row.referencia || 'Sin referencia'}</span>
                </div>
                <span className='text-sm text-red-600'>{row.errors.length} observaciones</span>
              </button>
              {isExpanded ? (
                <div id={contentId} className='mt-3 space-y-2 border-t border-red-200 pt-3'>
                  {row.errors.map((error, index) => (
                    <div key={`${row.id}-${index}`} className='text-sm'>
                      <p className='font-medium text-red-700'>Detalle detectado</p>
                      <p className='text-red-600'>{error}</p>
                    </div>
                  ))}
                  <button onClick={() => onErrorClick(row.id)} className='text-sm font-medium text-teal-700 hover:text-teal-800'>
                    Ir a la fila para corregir
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
