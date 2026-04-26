/**
 * Resume el estado visual de una fila de consignación.
 *
 * Usa la validación derivada para mostrar si la fila está válida, en error o
 * aún sin señales suficientes para destacarla.
 */
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import type { ConsignmentRow } from '@/features/processing/types/processing.types';
import type { ResultsValidationMap } from '@/features/processing/components/results/results-validation';
import { getRowStatus } from '@/features/processing/components/results/results-validation';

export function StatusCell({ row, validationMap }: { row: ConsignmentRow; validationMap?: ResultsValidationMap }) {
  const status = validationMap ? getRowStatus(row, validationMap) : row.estado === 'error' ? 'error' : row.estado === 'valid' ? 'valid' : 'neutral';
  if (status === 'valid') {
    return (
      <Badge variant='success' className='gap-1 bg-success/8 text-success'>
        <CheckCircle2 className='size-3' />
        Valido
      </Badge>
    );
  }
  if (status === 'error') {
    return (
      <Badge variant='outline' className='gap-1 border-danger/20 bg-danger/8 text-danger'>
        <AlertCircle className='size-3' />
        Error
      </Badge>
    );
  }
  return (
    <Badge variant='outline' className='gap-1 border-border/60 text-muted-foreground'>
      <CheckCircle2 className='size-3' />
      Neutral
    </Badge>
  );
}
