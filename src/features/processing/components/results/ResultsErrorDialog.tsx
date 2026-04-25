import { Modal } from '@/components/shared/Modal';
import { ResultsErrorPanel } from '@/features/processing/components/results/ResultsErrorPanel';
import type { ResultsValidationMap } from '@/features/processing/components/results/results-validation';
import type { ConsignmentRow } from '@/features/processing/types/processing.types';

interface ResultsErrorDialogProps {
  open: boolean;
  errorMessage: string;
  data: ConsignmentRow[];
  validationMap: ResultsValidationMap;
  selectedRowId?: string | null;
  selectedField?: string | null;
  onClose: () => void;
  onErrorClick: (rowId: string) => void;
  onFocusCell: (rowId: string, field: keyof ConsignmentRow) => void;
}

export function ResultsErrorDialog({ open, errorMessage, data, validationMap, selectedRowId, selectedField, onClose, onErrorClick, onFocusCell }: ResultsErrorDialogProps) {
  return (
    <Modal open={open} onClose={onClose} title='Hallazgos del procesamiento'>
      {errorMessage ? <p className='notice-danger mb-4'>{errorMessage}</p> : null}
      <ResultsErrorPanel data={data} validationMap={validationMap} selectedRowId={selectedRowId} selectedField={selectedField} onErrorClick={onErrorClick} onFocusCell={onFocusCell} />
    </Modal>
  );
}
