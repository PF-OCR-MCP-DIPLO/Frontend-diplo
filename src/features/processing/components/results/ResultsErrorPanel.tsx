import { useState } from 'react';
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
  const errorsData = data.filter((row) => row.estado === 'error');

  if (errorsData.length === 0) {
    return null;
  }

  return (
    <Card className='rounded-3xl border-red-100 p-4 shadow-sm'>
      <div className='mb-4 flex items-center gap-2'>
        <AlertCircle className='size-5 text-red-600' />
        <h3 className='font-semibold text-slate-900'>Errores detectados</h3>
        <Badge variant='destructive'>{errorsData.length}</Badge>
      </div>
      <div className='space-y-2'>
        {errorsData.map((row) => {
          const isExpanded = expanded.includes(row.id);
          return (
            <div key={row.id} className='rounded-2xl border border-red-200 bg-red-50 p-3'>
              <button
                onClick={() => setExpanded((prev) => prev.includes(row.id) ? prev.filter((id) => id !== row.id) : [...prev, row.id])}
                className='flex w-full items-center justify-between text-left'
              >
                <div className='flex items-center gap-2'>
                  {isExpanded ? <ChevronDown className='size-4 text-slate-600' /> : <ChevronRight className='size-4 text-slate-600' />}
                  <span className='font-medium text-slate-900'>Fila: {row.referencia || 'Sin referencia'}</span>
                </div>
                <span className='text-sm text-red-600'>{row.errors.length} errores</span>
              </button>
              {isExpanded ? (
                <div className='mt-3 space-y-2 border-t border-red-200 pt-3'>
                  {row.errors.map((error, index) => (
                    <div key={`${row.id}-${index}`} className='text-sm'>
                      <p className='font-medium text-red-700'>Campo: Monto</p>
                      <p className='text-red-600'>Razon: {error}</p>
                    </div>
                  ))}
                  <button onClick={() => onErrorClick(row.id)} className='text-sm font-medium text-teal-700 hover:text-teal-800'>
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
