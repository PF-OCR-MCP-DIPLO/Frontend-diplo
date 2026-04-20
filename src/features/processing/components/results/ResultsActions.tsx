import { Download, FileDown, MessageSquare, Play, RefreshCw, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ResultsActionsProps {
  showChat: boolean;
  isProcessing: boolean;
  isRefreshing: boolean;
  isExporting: boolean;
  status: string;
  excelUrl: string | null;
  canShowErrors: boolean;
  onToggleChat: () => void;
  onRefresh: () => void;
  onProcess: () => void;
  onExport: () => void;
  onOpenLogs: () => void;
  onOpenErrors: () => void;
}

export function ResultsActions(props: ResultsActionsProps) {
  return (
    <div className='flex flex-wrap items-center gap-2'>
      <Button variant='outline' onClick={props.onToggleChat} className='gap-2'>
        <MessageSquare className='size-4' />
        {props.showChat ? 'Ocultar' : 'Mostrar'} Chat IA
      </Button>
      <Button variant='outline' onClick={props.onRefresh} className='gap-2' disabled={props.isRefreshing}>
        <RefreshCw className={`size-4 ${props.isRefreshing ? 'animate-spin' : ''}`} />
        Actualizar estado
      </Button>
      <Button onClick={props.onProcess} className='gap-2' disabled={props.isProcessing || props.status === 'processing'}>
        <Play className='size-4' />
        {props.status === 'completed' ? 'Procesar de nuevo' : 'Procesar'}
      </Button>
      <Button variant='outline' onClick={props.onExport} className='gap-2' disabled={props.isExporting}>
        <Download className='size-4' />
        Exportar Excel
      </Button>
      <Button variant='outline' onClick={props.onOpenLogs}>Ver logs</Button>
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
