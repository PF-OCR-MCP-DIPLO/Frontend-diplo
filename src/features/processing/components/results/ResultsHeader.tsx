import type { ProcessingStatus } from '@/features/processing/types/processing.types';
import { StatusBadge } from '@/components/shared/StatusBadge';

interface ResultsHeaderProps {
  fileName: string;
  status: ProcessingStatus;
  totalImages: number;
  totalRecords: number;
  errorMessage: string;
}

function getStatusGuidance(status: ProcessingStatus, errorMessage: string) {
  if (errorMessage) {
    return 'Hay observaciones del backend. Revisa los hallazgos antes de exportar.';
  }

  switch (status) {
    case 'uploaded':
      return 'El documento ya esta cargado. Inicia el procesamiento para ver los datos.';
    case 'processing':
      return 'La ejecucion sigue en curso. Actualiza el estado para ver avances.';
    case 'completed_with_errors':
      return 'El procesamiento termino con hallazgos. Corrige la tabla y revisa los errores.';
    case 'completed':
      return 'Los resultados estan listos para revisar y exportar.';
    case 'failed':
      return 'El procesamiento fallo. Revisa los logs antes de reintentar.';
    default:
      return 'Revisa el estado actual y continua.';
  }
}

function getStatusTone(status: ProcessingStatus, errorMessage: string) {
  if (errorMessage || status === 'failed' || status === 'completed_with_errors') {
    return 'content-block-danger';
  }
  if (status === 'completed') {
    return 'content-block-subtle';
  }
  return 'content-block-accent';
}

export function ResultsHeader({ fileName, status, totalImages, totalRecords, errorMessage }: ResultsHeaderProps) {
  const hasErrors = Boolean(errorMessage);

  return (
    <div className='max-w-3xl space-y-3'>
      <div className='space-y-2'>
        <div className='flex flex-wrap items-center gap-2'>
          <p className='section-eyebrow'>Resultados</p>
        </div>
        <div className='space-y-1.5'>
          <h2 className='section-title text-[clamp(1.6rem,1.45rem+0.35vw,2rem)]'>Revision de resultados</h2>
          <p className='section-body max-w-2xl'>{getStatusGuidance(status, errorMessage)}</p>
        </div>
      </div>

      <div className='flex flex-wrap items-center gap-2 text-sm'>
        <div className='content-block min-w-[220px] px-4 py-3'>
          <p className='section-kicker'>Archivo activo</p>
          <p className='mt-1 truncate font-medium text-foreground'>{fileName}</p>
        </div>
        <StatusBadge status={status} prefix='Estado' />
        <span className='meta-pill'>Imágenes {totalImages}</span>
        <span className='meta-pill'>Registros {totalRecords}</span>
      </div>

      <div className={`${getStatusTone(status, errorMessage)} px-4 py-3 text-sm`}>
        <p className='font-medium text-foreground'>{hasErrors ? 'Hay observaciones en esta ejecucion.' : 'Revision en curso'}</p>
      </div>
    </div>
  );
}
