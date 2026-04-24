import { EditableTable } from '@/features/processing/components/editable-table/EditableTable';
import type { ConsignmentRow } from '@/features/processing/types/processing.types';

interface ResultsDataPanelProps {
  data: ConsignmentRow[];
  onDataChange: (data: ConsignmentRow[]) => void;
  onRowFocus: (rowId: string) => void;
}

export function ResultsDataPanel({ data, onDataChange, onRowFocus }: ResultsDataPanelProps) {
  return (
    <EditableTable
      data={data}
      onDataChange={onDataChange}
      onRowClick={(row) => onRowFocus(row.id)}
    />
  );
}
