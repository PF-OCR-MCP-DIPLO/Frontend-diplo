import { AlertCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export function ConsignmentTableHeader({ errorCount }: { errorCount: number }) {
  return (
    <div className='flex flex-col gap-4 border-b border-border/70 p-5 sm:flex-row sm:items-center sm:justify-between'>
      <div>
        <h3 className='font-semibold text-foreground'>Datos extraidos</h3>
        <p className='text-sm leading-6 text-muted-foreground'>Usa Enter o clic para editar cada celda, y Escape para salir sin perder el foco.</p>
      </div>
      {errorCount > 0 ? (
        <Badge variant='destructive' className='gap-1'>
          <AlertCircle className='size-3' />
          {errorCount} pendientes
        </Badge>
      ) : <Badge variant='success'>Sin errores activos</Badge>}
    </div>
  );
}
