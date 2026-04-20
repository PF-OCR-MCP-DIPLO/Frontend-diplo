import { Download, FileDown, Loader2, MessageSquare, Play, RefreshCw, ScrollText, XCircle } from 'lucide-react';
import type { ProcessingStatus } from '@/features/processing/types/processing.types';
import { Button } from '@/components/ui/button';

interface ResultsActionsProps {
  showChat: boolean;
  isProcessing: boolean;
  isRefreshing: boolean;
  isExporting: boolean;
  isLoadingLogs: boolean;
  status: ProcessingStatus;
  excelUrl: string | null;
  canShowErrors: boolean;
  canExport: boolean;
  onToggleChat: () => void;
  onRefresh: () => void;
  onProcess: () => void;
  onExport: () => void;
  onOpenLogs: () => void;
  onOpenErrors: () => void;
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
      <div className='rounded-[28px] border border-teal-200 bg-[linear-gradient(135deg,rgba(240,253,250,1),rgba(255,255,255,0.95))] p-5 shadow-sm shadow-teal-900/5'>
        <div className='flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between'>
          <div>
            <p className='text-xs font-semibold uppercase tracking-[0.16em] text-teal-700'>Siguiente paso recomendado</p>
            <p className='mt-2 text-lg font-semibold text-slate-950'>{getPrimaryActionLabel(props.status)}</p>
            <p className='mt-1 max-w-lg text-sm leading-6 text-slate-600'>{getPrimaryActionDescription(props.status, props.canExport)}</p>
          </div>
          <Button onClick={props.onProcess} className='h-11 gap-2 rounded-2xl px-5' disabled={props.isProcessing || props.status === 'processing'}>
            <Play className='size-4' />
            {props.isProcessing ? 'Procesando...' : getPrimaryActionLabel(props.status)}
          </Button>
        </div>
      </div>

      <div className='space-y-4 rounded-[28px] border border-slate-200 bg-white/95 p-5 shadow-sm'>
        <div className='flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between'>
          <div>
            <p className='text-xs font-semibold uppercase tracking-[0.16em] text-slate-500'>Herramientas de revision</p>
            <p className='mt-1 text-sm leading-6 text-slate-600'>Consulta el estado, abre evidencia tecnica y mantente en la misma vista mientras corriges.</p>
          </div>
          <div className='rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-500'>Acciones de apoyo</div>
        </div>
        <div className='flex flex-wrap gap-2'>
          <Button variant='outline' onClick={props.onRefresh} className='gap-2 rounded-2xl' disabled={props.isRefreshing}>
            <RefreshCw className={`size-4 ${props.isRefreshing ? 'animate-spin' : ''}`} />
            {props.isRefreshing ? 'Actualizando...' : 'Actualizar estado'}
          </Button>
          <Button variant='outline' onClick={props.onOpenLogs} disabled={props.isLoadingLogs} className='gap-2 rounded-2xl'>
            {props.isLoadingLogs ? <Loader2 className='size-4 animate-spin' /> : <ScrollText className='size-4' />}
            Ver logs
          </Button>
          <Button variant='outline' onClick={props.onOpenErrors} className='gap-2 rounded-2xl' disabled={!props.canShowErrors}>
            <XCircle className='size-4' />
            Ver hallazgos
          </Button>
          <Button variant='outline' onClick={props.onToggleChat} className='gap-2 rounded-2xl'>
            <MessageSquare className='size-4' />
            {props.showChat ? 'Ocultar asistente' : 'Mostrar asistente'}
          </Button>
        </div>
      </div>

      <div className='flex flex-wrap items-center gap-3 rounded-[28px] border border-slate-200 bg-slate-50/80 p-4'>
        <div className='min-w-[180px] flex-1'>
          <p className='text-sm font-medium text-slate-900'>Salida del trabajo</p>
          <p className='text-sm text-slate-500'>Genera un Excel nuevo o descarga el ultimo archivo disponible.</p>
        </div>
        <Button variant='outline' onClick={props.onExport} className='gap-2 rounded-2xl' disabled={props.isExporting || !props.canExport}>
          <Download className='size-4' />
          {props.isExporting ? 'Generando Excel...' : 'Generar Excel'}
        </Button>
        {props.excelUrl ? (
          <Button asChild className='gap-2 rounded-2xl'>
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
