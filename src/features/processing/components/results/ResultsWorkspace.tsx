/**
 * Coordina el panel principal de resultados de procesamiento.
 *
 * Este componente actúa como envoltorio fino para mantener la composición
 * visual separada de la lógica de selección, edición y ayuda contextual.
 *
 * @remarks
 * La workspace no transforma datos; solo reenvía el contrato de la vista
 * superior al panel que contiene la tabla editable.
 */
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

/**
 * Renderiza el espacio de trabajo de resultados con la tabla y sus controles.
 */
export function ResultsWorkspace({ data, validationMap, onDataChange, onRowFocus, selectedRowId, selectedField, onCellFocus, onAskAssistant }: ResultsWorkspaceProps) {
  return (
    <section className='min-h-0 min-w-0 overflow-hidden'>
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
