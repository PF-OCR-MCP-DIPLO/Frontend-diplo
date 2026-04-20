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
      {error ? <p className='mb-4 rounded-2xl border border-red-200 bg-red-50 p-3 text-sm text-red-700'>{error}</p> : null}
      {!error && logs.length === 0 ? <p className='rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600'>Todavia no hay eventos de log para esta ejecucion.</p> : null}
      <div className='space-y-2'>
        {logs.map((item) => (
          <div key={item.id} className={`rounded-2xl border p-4 text-sm ${item.is_error ? 'border-red-200 bg-red-50/80' : 'border-slate-200 bg-slate-50/90'}`}>
            <p className='font-medium text-slate-900'>#{item.sequence_index} · {item.stage}</p>
            <p className='mt-1 leading-6 text-slate-700'>Proveedor: {item.provider || '-'} · Modelo: {item.model || '-'} · Modo: {item.ocr_mode || '-'}</p>
            {item.notes ? <p className='mt-2 leading-6 text-slate-700'>{item.notes}</p> : null}
            {item.raw_text ? <pre className='mt-3 overflow-auto rounded-2xl border border-slate-200 bg-white p-3 text-xs'>{item.raw_text}</pre> : null}
          </div>
        ))}
      </div>
    </Modal>
  );
}
