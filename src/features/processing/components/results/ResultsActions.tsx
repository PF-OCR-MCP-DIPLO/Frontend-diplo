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
    return 'Procesando en curso';
  }
  return 'Iniciar procesamiento';
}

function getPrimaryActionDescription(status: ProcessingStatus, canExport: boolean) {
  if (status === 'processing') {
    return 'La ejecucion ya se esta procesando. Actualiza el estado para confirmar cuando termine.';
  }

  if (status === 'completed' || status === 'completed_with_errors') {
    return canExport
      ? 'Puedes exportar el resultado actual o volver a ejecutar la extraccion si necesitas una nueva corrida.'
      : 'Los datos ya fueron procesados. Revisa la tabla y define si conviene volver a ejecutar.';
  }

  if (status === 'failed') {
    return 'Revisa los logs y vuelve a intentar cuando tengas claro el origen del fallo.';
  }

  return 'Cuando inicies el procesamiento, esta vista se convertira en tu espacio principal de validacion.';
}

export function ResultsActions(props: ResultsActionsProps) {
  return (
    <div className='w-full max-w-2xl space-y-4 xl:sticky xl:top-24'>
      <div className='content-block-accent'>
        <div className='flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between'>
          <div>
            <p className='section-eyebrow text-accent'>Siguiente paso recomendado</p>
            <p className='mt-2 text-lg font-semibold text-foreground'>{getPrimaryActionLabel(props.status)}</p>
            <p className='mt-1 max-w-lg text-body text-surface-accent-foreground/82'>{getPrimaryActionDescription(props.status, props.canExport)}</p>
          </div>
          <Button onClick={props.onProcess} className='gap-2' disabled={props.isProcessing || props.status === 'processing'}>
            <Play className='size-4' />
            {props.isProcessing ? 'Procesando...' : getPrimaryActionLabel(props.status)}
          </Button>
        </div>
      </div>

      <div className='content-block'>
        <div className='flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between'>
          <div>
            <p className='section-kicker'>Acciones operativas</p>
            <p className='mt-1 text-body text-muted-foreground'>Usa estas acciones para controlar ciclo del procesamiento sin salir del flujo principal.</p>
          </div>
          <div className='meta-pill'>Control de ejecucion</div>
        </div>
        <div className='flex flex-wrap gap-2'>
          <Button variant='outline' onClick={props.onRefresh} className='gap-2' disabled={props.isRefreshing}>
            <RefreshCw className={`size-4 ${props.isRefreshing ? 'animate-spin' : ''}`} />
            {props.isRefreshing ? 'Actualizando...' : 'Actualizar estado'}
          </Button>
        </div>
      </div>

      <div className='content-block-subtle flex flex-wrap items-center gap-3 p-4'>
        <div className='min-w-[180px] flex-1'>
          <p className='text-sm font-medium text-foreground'>Salida del trabajo</p>
          <p className='text-sm text-muted-foreground'>Genera un Excel nuevo o descarga el ultimo archivo disponible.</p>
        </div>
        <Button variant='outline' onClick={props.onExport} className='gap-2' disabled={props.isExporting || !props.canExport}>
          <Download className='size-4' />
          {props.isExporting ? 'Generando Excel...' : 'Generar Excel'}
        </Button>
        {props.excelUrl ? (
          <Button asChild className='gap-2'>
            <a href={props.excelUrl} target='_blank' rel='noreferrer'>
              <FileDown className='size-4' />
              Descargar Excel
            </a>
          </Button>
        ) : null}
      </div>
    </div>
  );
}
