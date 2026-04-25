import { Input } from '@/components/ui/input';
import { ContextualTooltip } from '@/components/shared/ContextualTooltip';
import type { FieldValidationIssue, ResultsValidationMap } from '@/features/processing/components/results/results-validation';
import { getCellIssueSummary, getCellStatus, getFieldLabel } from '@/features/processing/components/results/results-validation';
import type { ConsignmentRow, ResultFieldKey } from '@/features/processing/types/processing.types';

interface EditableCellProps {
  row: ConsignmentRow;
  field: ResultFieldKey;
  editable: boolean;
  issues: FieldValidationIssue[];
  isEditing: boolean;
  isSelected?: boolean;
  onFocusCell?: (rowId: string, field: ResultFieldKey) => void;
  onEdit: (rowId: string, field: ResultFieldKey) => void;
  onChange: (rowId: string, field: ResultFieldKey, value: string) => void;
  onBlur: () => void;
  onKeyDown: (event: React.KeyboardEvent<HTMLInputElement>) => void;
  onAskAssistant?: (rowId: string, field: ResultFieldKey) => void;
  validationMap: ResultsValidationMap;
}

export function EditableCell({ row, field, editable, issues, isEditing, isSelected, onFocusCell, onEdit, onChange, onBlur, onKeyDown, validationMap }: EditableCellProps) {
  const value = String(row[field]);
  const cellStatus = getCellStatus(row, field as never, validationMap);
  const hasError = cellStatus === 'error';
  const label = `Editar ${getFieldLabel(field)} de la fila ${row.referencia || row.id}`;
  const tooltipModel = getCellIssueSummary(row, field as never, issues);

  const pillClass = `block rounded-md px-2 py-1 text-sm transition ${hasError ? 'bg-danger/8 text-danger ring-1 ring-danger/20' : cellStatus === 'valid' ? 'bg-success/5 text-foreground ring-1 ring-success/20' : 'text-surface-foreground'} ${isSelected ? 'ring-1 ring-primary/25' : ''}`;

  if (isEditing) {
    return (
      <Input
        autoFocus
        aria-label={label}
        value={value}
        onChange={(event) => onChange(row.id, field, event.target.value)}
        onBlur={onBlur}
        onKeyDown={onKeyDown}
        className={`h-8 rounded-md px-2 text-sm ${hasError ? 'border-danger bg-danger/5 ring-danger/12' : cellStatus === 'valid' ? 'border-success/30 bg-success/5' : ''} ${isSelected ? 'ring-1 ring-primary/25' : ''}`}
      />
    );
  }

  const content = <span className={pillClass} tabIndex={0} onFocus={() => onFocusCell?.(row.id, field)}>{value}</span>;

  if (!editable) {
    return (
      <ContextualTooltip
        trigger={content}
        content={
          <div className='space-y-1'>
            <p className='font-medium text-foreground'>{tooltipModel.title}</p>
            <p className='text-muted-foreground'>Valor actual: {tooltipModel.currentValue}</p>
            <p className='text-muted-foreground'>Sugerencia: {tooltipModel.correctionHint}</p>
          </div>
        }
      />
    );
  }

  return (
    <ContextualTooltip
      trigger={(
        <button
          type='button'
          aria-label={label}
          onClick={() => onEdit(row.id, field)}
          onFocus={() => onFocusCell?.(row.id, field)}
          className={`focus-ring flex w-full items-center justify-between rounded-md px-2 py-1 text-left text-sm transition hover:bg-primary/6 ${hasError ? 'bg-danger/8 text-danger ring-1 ring-danger/20' : cellStatus === 'valid' ? 'bg-success/5 text-foreground ring-1 ring-success/20' : ''} ${isSelected ? 'ring-1 ring-primary/25' : ''}`}
        >
          <span>{value}</span>
          <span className='text-[11px] text-muted-foreground'>{issues.length > 0 ? `${issues.length} issue${issues.length === 1 ? '' : 's'}` : cellStatus === 'valid' ? 'OK' : 'Editar'}</span>
        </button>
      )}
      content={
        <div className='space-y-1'>
          <p className='font-medium text-foreground'>{tooltipModel.title}</p>
          <p className='text-muted-foreground'>Valor actual: {tooltipModel.currentValue}</p>
          <p className='text-muted-foreground'>Sugerencia: {tooltipModel.correctionHint}</p>
        </div>
      }
    />
  );
}
