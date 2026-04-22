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
    <div className='max-w-3xl space-y-4'>
      <div className='space-y-2'>
        <div className='flex flex-wrap items-center gap-2'>
          <p className='section-eyebrow'>Resultados</p>
          <span className='eyebrow-chip'>Paso 3 de 3</span>
        </div>
        <div className='space-y-1.5'>
          <h2 className='section-title text-[clamp(1.8rem,1.7rem+0.4vw,2.2rem)]'>Revision de resultados</h2>
          <p className='section-body max-w-2xl'>{getStatusGuidance(status, errorMessage)}</p>
        </div>
      </div>

      <div className='flex flex-wrap items-start gap-3'>
        <div className='content-block min-w-[240px] p-4'>
          <p className='section-kicker'>Archivo activo</p>
          <p className='mt-2 truncate text-sm font-medium text-foreground'>{fileName}</p>
        </div>
        <StatusBadge status={status} prefix='Estado' />
        <span className='meta-pill'>Imagenes {totalImages}</span>
        <span className='meta-pill'>Registros {totalRecords}</span>
      </div>

      <div className={`${getStatusTone(status, errorMessage)} px-5 py-4 text-sm`}>
        <p className='font-medium text-foreground'>{hasErrors ? 'Hay observaciones en esta ejecucion.' : 'Revision en curso'}</p>
        <p className='mt-1 leading-6'>{getStatusGuidance(status, errorMessage)}</p>
      </div>
    </div>
  );
}
