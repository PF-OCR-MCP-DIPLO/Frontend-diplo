/**
 * Encabezado contextual de la tabla de consignaciones.
 *
 * Explica al usuario cuántos hallazgos siguen abiertos antes de editar o
 * exportar el resultado.
 */
import { AlertCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export function ConsignmentTableHeader({ errorCount }: { errorCount: number }) {
  return (
    <div className='flex flex-col gap-4 border-b border-border/70 p-5 sm:flex-row sm:items-center sm:justify-between'>
      <div>
        <h3 className='font-semibold text-foreground'>Datos extraídos</h3>
        <p className='text-sm leading-6 text-muted-foreground'>Selecciona una celda para editarla.</p>
      </div>
      {errorCount > 0 ? (
        <Badge variant='destructive' className='gap-1'>
          <AlertCircle className='size-3' />
          {errorCount} pendiente{errorCount === 1 ? '' : 's'}
        </Badge>
      ) : <Badge variant='success'>Sin hallazgos pendientes</Badge>}
    </div>
  );
}
