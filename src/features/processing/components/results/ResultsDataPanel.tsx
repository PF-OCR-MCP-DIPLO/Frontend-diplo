/**
 * Enlaza la tabla editable con la vista de resultados.
 *
 * Este panel mantiene aislada la composición de la tabla para que la vista
 * principal solo orqueste estado y acciones de mayor nivel.
 */
import { EditableTable } from '@/features/processing/components/editable-table/EditableTable';
import type { ResultsValidationMap } from '@/features/processing/components/results/results-validation';
import type { ConsignmentRow, ResultFieldKey } from '@/features/processing/types/processing.types';

interface ResultsDataPanelProps {
  data: ConsignmentRow[];
  validationMap: ResultsValidationMap;
  onDataChange: (data: ConsignmentRow[]) => void;
  onRowFocus: (rowId: string) => void;
  selectedRowId?: string | null;
  selectedField?: string | null;
  onCellFocus?: (rowId: string, field: ResultFieldKey) => void;
  onAskAssistant?: (rowId: string, field: ResultFieldKey) => void;
}

export function ResultsDataPanel({ data, validationMap, onDataChange, onRowFocus, selectedRowId, selectedField, onCellFocus, onAskAssistant }: ResultsDataPanelProps) {
  return (
    <div className='min-w-0 overflow-hidden'>
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
    </div>
  );
}
