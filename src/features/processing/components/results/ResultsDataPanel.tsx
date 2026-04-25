import { EditableTable } from '@/features/processing/components/editable-table/EditableTable';
import type { ResultsValidationMap } from '@/features/processing/components/results/results-validation';
import type { ConsignmentRow } from '@/features/processing/types/processing.types';

interface ResultsDataPanelProps {
  data: ConsignmentRow[];
  validationMap: ResultsValidationMap;
  onDataChange: (data: ConsignmentRow[]) => void;
  onRowFocus: (rowId: string) => void;
  selectedRowId?: string | null;
  selectedField?: string | null;
  onCellFocus?: (rowId: string, field: keyof ConsignmentRow) => void;
  onAskAssistant?: (rowId: string, field: keyof ConsignmentRow) => void;
}

export function ResultsDataPanel({ data, validationMap, onDataChange, onRowFocus, selectedRowId, selectedField, onCellFocus, onAskAssistant }: ResultsDataPanelProps) {
  return (
    <EditableTable
      data={data}
      validationMap={validationMap}
      onDataChange={onDataChange}
      onRowClick={(row) => onRowFocus(row.id)}
      selectedRowId={selectedRowId}
      selectedField={selectedField}
      onCellFocus={onCellFocus}
      onAskAssistant={onAskAssistant}
    />
  );
}
