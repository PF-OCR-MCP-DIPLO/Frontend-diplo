import { Download, FileDown, Play, RefreshCw } from 'lucide-react';
import type { ProcessingStatus } from '@/features/processing/types/processing.types';
import { Button } from '@/components/ui/button';

interface ResultsActionsProps {
  isProcessing: boolean;
  isRefreshing: boolean;
  isExporting: boolean;
  status: ProcessingStatus;
  excelUrl: string | null;
  canExport: boolean;
  onRefresh: () => void;
  onProcess: () => void;
  onExport: () => void;
}

function getPrimaryActionLabel(status: ProcessingStatus) {
  if (status === 'completed' || status === 'completed_with_errors') {
    return 'Procesar de nuevo';
  }
  if (status === 'processing') {
    return 'Procesando';
  }
  return 'Procesar';
}

function getPrimaryActionDescription(status: ProcessingStatus, canExport: boolean) {
  if (status === 'processing') {
    return 'La ejecucion ya se esta procesando.';
  }

  if (status === 'completed' || status === 'completed_with_errors') {
    return canExport
      ? 'Puedes exportar el resultado actual o volver a ejecutarlo.'
      : 'Guarda los cambios antes de exportar.';
  }

  if (status === 'failed') {
    return 'Revisa los logs antes de volver a intentarlo.';
  }

  return 'Inicia el procesamiento para cargar los resultados.';
}

export function ResultsActions(props: ResultsActionsProps) {
  return (
    <div className='w-full max-w-xl space-y-2'>
      <div className='content-block-accent flex flex-col gap-3 p-4'>
        <div>
          <p className='section-eyebrow text-accent'>Acción principal</p>
          <p className='mt-1 text-base font-semibold text-foreground'>{getPrimaryActionLabel(props.status)}</p>
          <p className='mt-1 text-sm text-surface-accent-foreground/82'>{getPrimaryActionDescription(props.status, props.canExport)}</p>
        </div>
        <Button onClick={props.onProcess} className='gap-2 self-start' disabled={props.isProcessing || props.status === 'processing'}>
          <Play className='size-4' />
          {props.isProcessing ? 'Procesando...' : getPrimaryActionLabel(props.status)}
        </Button>
      </div>

      <div className='content-block-subtle flex flex-wrap items-center gap-2 px-4 py-3'>
        <Button variant='outline' onClick={props.onRefresh} className='gap-2' disabled={props.isRefreshing}>
          <RefreshCw className={`size-4 ${props.isRefreshing ? 'animate-spin' : ''}`} />
          {props.isRefreshing ? 'Actualizando...' : 'Actualizar'}
        </Button>
        <Button variant='outline' onClick={props.onExport} className='gap-2' disabled={props.isExporting || !props.canExport}>
          <Download className='size-4' />
          {props.isExporting ? 'Generando...' : 'Generar Excel'}
        </Button>
        {props.excelUrl ? (
          <Button asChild className='gap-2'>
            <a href={props.excelUrl} target='_blank' rel='noreferrer'>
              <FileDown className='size-4' />
              Descargar
            </a>
          </Button>
        ) : null}
      </div>
    </div>
  );
}
