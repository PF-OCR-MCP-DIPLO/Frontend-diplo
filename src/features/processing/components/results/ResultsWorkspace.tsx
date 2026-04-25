import { ResultsDataPanel } from '@/features/processing/components/results/ResultsDataPanel';
import type { ResultsValidationMap } from '@/features/processing/components/results/results-validation';
import type { ConsignmentRow } from '@/features/processing/types/processing.types';

interface ResultsWorkspaceProps {
  data: ConsignmentRow[];
  validationMap: ResultsValidationMap;
  onDataChange: (data: ConsignmentRow[]) => void;
  onRowFocus: (rowId: string) => void;
}

export function ResultsWorkspace({ data, validationMap, onDataChange, onRowFocus }: ResultsWorkspaceProps) {
  return (
    <section className='min-h-0'>
      <ResultsDataPanel data={data} validationMap={validationMap} onDataChange={onDataChange} onRowFocus={onRowFocus} />
    </section>
  );
}
