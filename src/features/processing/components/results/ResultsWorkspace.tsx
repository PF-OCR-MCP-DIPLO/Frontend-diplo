import { ResultsDataPanel } from '@/features/processing/components/results/ResultsDataPanel';
import type { ResultsValidationMap } from '@/features/processing/components/results/results-validation';
import type { ConsignmentRow, ResultFieldKey } from '@/features/processing/types/processing.types';

interface ResultsWorkspaceProps {
  data: ConsignmentRow[];
  validationMap: ResultsValidationMap;
  onDataChange: (data: ConsignmentRow[]) => void;
  onRowFocus: (rowId: string) => void;
  selectedRowId?: string | null;
  selectedField?: string | null;
  onCellFocus?: (rowId: string, field: ResultFieldKey) => void;
  onAskAssistant?: (rowId: string, field: ResultFieldKey) => void;
}

export function ResultsWorkspace({ data, validationMap, onDataChange, onRowFocus, selectedRowId, selectedField, onCellFocus, onAskAssistant }: ResultsWorkspaceProps) {
  return (
    <section className='min-h-0'>
      <ResultsDataPanel
        data={data}
        validationMap={validationMap}
        onDataChange={onDataChange}
        onRowFocus={onRowFocus}
        selectedRowId={selectedRowId}
        selectedField={selectedField}
        onCellFocus={onCellFocus}
        onAskAssistant={onAskAssistant}
      />
    </section>
  );
}
