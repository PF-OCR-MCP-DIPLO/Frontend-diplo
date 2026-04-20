import { AlertCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export function ConsignmentTableHeader({ errorCount }: { errorCount: number }) {
  return (
    <div className='flex flex-col gap-4 border-b border-slate-200 p-5 sm:flex-row sm:items-center sm:justify-between'>
      <div>
        <h3 className='font-semibold text-slate-900'>Datos extraidos</h3>
        <p className='text-sm leading-6 text-slate-500'>Usa Enter o clic para editar cada celda, y Escape para salir sin perder el foco.</p>
      </div>
      {errorCount > 0 ? (
        <Badge variant='destructive' className='gap-1'>
          <AlertCircle className='size-3' />
          {errorCount} pendientes
        </Badge>
      ) : <Badge variant='outline' className='border-emerald-200 bg-emerald-50 text-emerald-700'>Sin errores activos</Badge>}
    </div>
  );
}
