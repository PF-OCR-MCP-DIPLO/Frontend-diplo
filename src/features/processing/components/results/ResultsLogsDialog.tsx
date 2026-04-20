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
    <Modal open={open} onClose={onClose} title='Logs de extracción' size='lg'>
      {error ? <p className='mb-4 rounded-2xl bg-red-50 p-3 text-sm text-red-700'>{error}</p> : null}
      {!error && logs.length === 0 ? <p className='text-sm text-slate-600'>No hay logs disponibles para este job.</p> : null}
      <div className='space-y-2'>
        {logs.map((item) => (
          <div key={item.id} className={`rounded-2xl border p-3 text-sm ${item.is_error ? 'border-red-200 bg-red-50' : 'border-slate-200 bg-slate-50'}`}>
            <p className='font-medium text-slate-900'>#{item.sequence_index} {item.stage}</p>
            <p className='text-slate-700'>provider={item.provider || '-'} model={item.model || '-'} mode={item.ocr_mode || '-'}</p>
            {item.notes ? <p className='mt-1 text-slate-700'>{item.notes}</p> : null}
            {item.raw_text ? <pre className='mt-2 overflow-auto rounded-2xl bg-white p-2 text-xs'>{item.raw_text}</pre> : null}
          </div>
        ))}
      </div>
    </Modal>
  );
}
