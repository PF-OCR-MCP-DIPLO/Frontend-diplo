import { Modal } from '@/components/shared/Modal';
import { ResultsErrorPanel } from '@/features/processing/components/results/ResultsErrorPanel';
import type { ConsignmentRow } from '@/features/processing/types/processing.types';

interface ResultsErrorDialogProps {
  open: boolean;
  errorMessage: string;
  data: ConsignmentRow[];
  onClose: () => void;
  onErrorClick: (rowId: string) => void;
}

export function ResultsErrorDialog({ open, errorMessage, data, onClose, onErrorClick }: ResultsErrorDialogProps) {
  return (
    <Modal open={open} onClose={onClose} title='Hallazgos del procesamiento'>
      {errorMessage ? <p className='mb-4 rounded-2xl border border-danger/18 bg-danger/12 p-3 text-sm text-danger'>{errorMessage}</p> : null}
      <ResultsErrorPanel data={data} onErrorClick={onErrorClick} />
    </Modal>
  );
}
