import { Input } from '@/components/ui/input';
import { ContextualTooltip } from '@/components/shared/ContextualTooltip';
import type { FieldValidationIssue } from '@/features/processing/components/results/results-validation';
import { getCellIssueSummary, getFieldLabel } from '@/features/processing/components/results/results-validation';
import type { ConsignmentRow } from '@/features/processing/types/processing.types';
import { Button } from '@/components/ui/button';

interface EditableCellProps {
  row: ConsignmentRow;
  field: keyof ConsignmentRow;
  editable: boolean;
  issues: FieldValidationIssue[];
  isEditing: boolean;
  isSelected?: boolean;
  onFocusCell?: (rowId: string, field: keyof ConsignmentRow) => void;
  onEdit: (rowId: string, field: keyof ConsignmentRow) => void;
  onChange: (rowId: string, field: keyof ConsignmentRow, value: string) => void;
  onBlur: () => void;
  onKeyDown: (event: React.KeyboardEvent<HTMLInputElement>) => void;
  onAskAssistant?: (rowId: string, field: keyof ConsignmentRow) => void;
}

export function EditableCell({ row, field, editable, issues, isEditing, isSelected, onFocusCell, onEdit, onChange, onBlur, onKeyDown, onAskAssistant }: EditableCellProps) {
  const value = String(row[field]);
  const hasError = row.estado === 'error' || issues.length > 0;
  const label = `Editar ${getFieldLabel(field)} de la fila ${row.referencia || row.id}`;
  const tooltipModel = getCellIssueSummary(row, field as never, issues);
  const content = (
    <div className='space-y-2'>
      <div>
        <p className='font-semibold text-foreground'>{tooltipModel.title}</p>
        <p className='text-muted-foreground'>Valor actual: {tooltipModel.currentValue}</p>
      </div>
      <div className='space-y-1'>
        {tooltipModel.issues.length > 0 ? tooltipModel.issues.map((issue) => <p key={issue} className='text-danger'>{issue}</p>) : <p className='text-muted-foreground'>Sin errores detectados.</p>}
      </div>
      <p className='text-muted-foreground'>Sugerencia: {tooltipModel.correctionHint}</p>
      <div className='flex gap-2 pt-1'>
        <Button type='button' size='sm' variant='outline' className='h-7 rounded-full px-2 text-[11px]' onClick={() => onAskAssistant?.(row.id, field)}>
          Preguntar al asistente
        </Button>
        {editable ? (
          <Button type='button' size='sm' className='h-7 rounded-full px-2 text-[11px]' onClick={() => onEdit(row.id, field)}>
            Editar
          </Button>
        ) : null}
      </div>
    </div>
  );

  if (isEditing) {
    return (
      <Input
        autoFocus
        aria-label={label}
        value={value}
        onChange={(event) => onChange(row.id, field, event.target.value)}
        onBlur={onBlur}
        onKeyDown={onKeyDown}
        className={`h-8 rounded-md px-2 text-sm ${hasError ? 'border-danger ring-danger/12' : ''} ${isSelected ? 'ring-1 ring-primary/25' : ''}`}
      />
    );
  }

  if (!editable) {
    return (
      <ContextualTooltip
        trigger={<span className={`block rounded-md px-2 py-1 ${hasError ? 'bg-danger/8 text-danger ring-1 ring-danger/20' : 'text-surface-foreground'} ${isSelected ? 'ring-1 ring-primary/25' : ''}`} tabIndex={0} onFocus={() => onFocusCell?.(row.id, field)}>{value}</span>}
        content={content}
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
          className={`focus-ring flex w-full items-center justify-between rounded-md px-2 py-1 text-left text-sm transition hover:bg-primary/6 ${hasError ? 'bg-danger/8 text-danger ring-1 ring-danger/20' : ''} ${isSelected ? 'ring-1 ring-primary/25' : ''}`}
        >
          <span>{value}</span>
          <span className='text-[11px] text-muted-foreground'>{issues.length > 0 ? `${issues.length} issue${issues.length === 1 ? '' : 's'}` : 'Editar'}</span>
        </button>
      )}
      content={content}
    />
  );
}
