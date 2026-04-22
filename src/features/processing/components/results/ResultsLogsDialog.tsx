import type { ApiExtractionLog } from '@/features/processing/types/processing.api';
import { Modal } from '@/components/shared/Modal';

interface ResultsLogsDialogProps {
  open: boolean;
  logs: ApiExtractionLog[];
  error: string | null;
  onClose: () => void;
}

export function ResultsLogsDialog({ open, logs, error, onClose }: ResultsLogsDialogProps) {
  return (
    <Modal open={open} onClose={onClose} title='Logs del procesamiento' size='lg'>
      {error ? <p className='notice-danger mb-4'>{error}</p> : null}
      {!error && logs.length === 0 ? <p className='info-strip'>Todavia no hay eventos de log para esta ejecucion.</p> : null}
      <div className='space-y-2'>
        {logs.map((item) => (
          <div key={item.id} className={`${item.is_error ? 'content-block-danger' : 'content-block-subtle'} p-4 text-sm`}>
            <p className='font-medium text-foreground'>#{item.sequence_index} · {item.stage}</p>
            <p className='mt-1 leading-6 text-surface-foreground'>Proveedor: {item.provider || '-'} · Modelo: {item.model || '-'} · Modo: {item.ocr_mode || '-'}</p>
            {item.notes ? <p className='mt-2 leading-6 text-surface-foreground'>{item.notes}</p> : null}
            {item.raw_text ? <pre className='surface-code mt-3'>{item.raw_text}</pre> : null}
          </div>
        ))}
      </div>
    </Modal>
  );
}
