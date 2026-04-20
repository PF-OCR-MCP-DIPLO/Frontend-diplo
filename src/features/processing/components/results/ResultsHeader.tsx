import type { ProcessingStatus } from '@/features/processing/types/processing.types';
import { statusClass, statusLabel } from '@/lib/constants/status';

interface ResultsHeaderProps {
  fileName: string;
  status: ProcessingStatus;
  totalImages: number;
  totalRecords: number;
  errorMessage: string;
}

function getStatusGuidance(status: ProcessingStatus, errorMessage: string) {
  if (errorMessage) {
    return 'El backend reporto observaciones. Revisa los errores antes de exportar.';
  }

  switch (status) {
    case 'uploaded':
      return 'El documento ya esta cargado. Inicia el procesamiento cuando quieras revisar los datos.';
    case 'processing':
      return 'La ejecucion sigue en curso. Actualiza el estado para consultar avances.';
    case 'completed_with_errors':
      return 'El procesamiento termino con hallazgos. Corrige la tabla y revisa los errores detectados.';
    case 'completed':
      return 'Los resultados estan listos para revisar, ajustar y exportar.';
    case 'failed':
      return 'El procesamiento fallo. Revisa los logs y valida la configuracion antes de reintentar.';
    default:
      return 'Consulta el estado actual de la ejecucion y decide la siguiente accion.';
  }
}

export function ResultsHeader({ fileName, status, totalImages, totalRecords, errorMessage }: ResultsHeaderProps) {
  const hasErrors = Boolean(errorMessage);

  return (
    <div className='max-w-3xl space-y-5'>
      <div className='space-y-3'>
        <p className='text-xs font-semibold uppercase tracking-[0.2em] text-teal-700'>Centro de revision</p>
        <div className='space-y-2'>
          <h2 className='text-3xl font-semibold tracking-tight text-slate-950'>Resultados del procesamiento</h2>
          <p className='max-w-2xl text-sm leading-6 text-slate-600'>
            Revisa la extraccion, contrasta el documento fuente y corrige cualquier hallazgo antes de exportar.
          </p>
        </div>
      </div>

      <div className='flex flex-wrap items-start gap-3'>
        <div className='min-w-[240px] rounded-2xl border border-slate-200 bg-white/80 px-4 py-3'>
          <p className='text-xs font-semibold uppercase tracking-[0.16em] text-slate-400'>Archivo activo</p>
          <p className='mt-2 truncate text-sm font-medium text-slate-900'>{fileName}</p>
        </div>
        <span className={`rounded-full border px-3 py-1.5 text-xs font-semibold ${statusClass[status] ?? 'border-slate-200 bg-slate-100 text-slate-700'}`}>
          Estado: {statusLabel[status] ?? status}
        </span>
        <span className='rounded-full border border-slate-200 bg-white/80 px-3 py-1.5 text-xs font-medium text-slate-600'>Imagenes: {totalImages}</span>
        <span className='rounded-full border border-slate-200 bg-white/80 px-3 py-1.5 text-xs font-medium text-slate-600'>Registros: {totalRecords}</span>
      </div>

      <div className={`rounded-3xl border px-5 py-4 text-sm ${hasErrors ? 'border-red-200 bg-red-50/90 text-red-700' : 'border-slate-200 bg-slate-50/90 text-slate-700'}`}>
        <p className='font-medium text-slate-900'>{hasErrors ? 'Hay observaciones del backend en esta ejecucion.' : 'Siguiente foco de trabajo'}</p>
        <p className='mt-1 leading-6'>{getStatusGuidance(status, errorMessage)}</p>
      </div>
    </div>
  );
}
