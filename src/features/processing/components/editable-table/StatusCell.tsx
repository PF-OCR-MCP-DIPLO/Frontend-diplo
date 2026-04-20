import { AlertCircle, CheckCircle2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import type { ConsignmentRow } from '@/features/processing/types/processing.types';

export function StatusCell({ row }: { row: ConsignmentRow }) {
  return row.estado === 'valid' ? (
    <Badge variant='outline' className='gap-1 border-emerald-200 bg-emerald-50 text-emerald-700'>
      <CheckCircle2 className='size-3' />
      Valido
    </Badge>
  ) : (
    <Badge variant='destructive' className='gap-1'>
      <AlertCircle className='size-3' />
      Error
    </Badge>
  );
}
