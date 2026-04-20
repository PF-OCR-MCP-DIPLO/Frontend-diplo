import { AlertCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export function ConsignmentTableHeader({ errorCount }: { errorCount: number }) {
  return (
    <div className='flex items-center justify-between border-b border-slate-200 p-4'>
      <div>
        <h3 className='font-semibold text-slate-900'>Datos extraidos</h3>
        <p className='text-sm text-slate-500'>Usa Enter o clic para editar cada celda y Escape para salir.</p>
      </div>
      {errorCount > 0 ? (
        <Badge variant='destructive' className='gap-1'>
          <AlertCircle className='size-3' />
          {errorCount} errores
        </Badge>
      ) : null}
    </div>
  );
}
