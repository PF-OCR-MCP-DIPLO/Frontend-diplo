import { Download, FileDown, Loader2, Play, RefreshCw, XCircle } from 'lucide-react';
import type { ProcessingStatus } from '@/features/processing/types/processing.types';
import { Button } from '@/components/ui/button';

interface ResultsActionsProps {
  isProcessing: boolean;
  isRefreshing: boolean;
  isExporting: boolean;
  isLoadingLogs: boolean;
  status: ProcessingStatus;
  excelUrl: string | null;
  canShowErrors: boolean;
  canExport: boolean;
  onRefresh: () => void;
  onProcess: () => void;
  onExport: () => void;
  onOpenLogs: () => void;
  onOpenErrors: () => void;
}

export function ResultsActions(props: ResultsActionsProps) {
  return (
    <div className='flex flex-wrap items-center gap-2'>
      <Button variant='outline' onClick={props.onRefresh} className='gap-2' disabled={props.isRefreshing}>
        <RefreshCw className={`size-4 ${props.isRefreshing ? 'animate-spin' : ''}`} />
        Actualizar estado
      </Button>
      <Button onClick={props.onProcess} className='gap-2' disabled={props.isProcessing || props.status === 'processing'}>
        <Play className='size-4' />
        {props.status === 'completed' || props.status === 'completed_with_errors' ? 'Procesar de nuevo' : 'Procesar'}
      </Button>
      <Button variant='outline' onClick={props.onExport} className='gap-2' disabled={props.isExporting || !props.canExport}>
        <Download className='size-4' />
        {props.isExporting ? 'Exportando...' : 'Exportar Excel'}
      </Button>
      <Button variant='outline' onClick={props.onOpenLogs} disabled={props.isLoadingLogs} className='gap-2'>
        {props.isLoadingLogs ? <Loader2 className='size-4 animate-spin' /> : null}
        Ver logs
      </Button>
      <Button variant='outline' onClick={props.onOpenErrors} className='gap-2' disabled={!props.canShowErrors}>
        <XCircle className='size-4' />
        Ver errores
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
  );
}
