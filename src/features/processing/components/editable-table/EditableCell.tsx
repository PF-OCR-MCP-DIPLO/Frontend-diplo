import { Input } from '@/components/ui/input';
import type { FieldValidationIssue } from '@/features/processing/components/results/results-validation';
import type { ConsignmentRow } from '@/features/processing/types/processing.types';

interface EditableCellProps {
  row: ConsignmentRow;
  field: keyof ConsignmentRow;
  editable: boolean;
  issues: FieldValidationIssue[];
  isEditing: boolean;
  onEdit: (rowId: string, field: keyof ConsignmentRow) => void;
  onChange: (rowId: string, field: keyof ConsignmentRow, value: string) => void;
  onBlur: () => void;
  onKeyDown: (event: React.KeyboardEvent<HTMLInputElement>) => void;
}

export function EditableCell({ row, field, editable, issues, isEditing, onEdit, onChange, onBlur, onKeyDown }: EditableCellProps) {
  const value = String(row[field]);
  const hasError = row.estado === 'error' || issues.length > 0;
  const tooltip = issues.map((issue) => issue.message).join('\n');
  const label = `Editar ${field} de la fila ${row.referencia || row.id}`;

  if (isEditing) {
    return (
      <Input
        autoFocus
        aria-label={label}
        value={value}
        onChange={(event) => onChange(row.id, field, event.target.value)}
        onBlur={onBlur}
        onKeyDown={onKeyDown}
        className={`h-9 ${hasError ? 'border-danger ring-danger/12' : ''}`}
      />
    );
  }

  if (!editable) {
    return (
      <span
        className={`block rounded-md px-2 py-1 ${hasError ? 'bg-danger/8 text-danger ring-1 ring-danger/20' : 'text-surface-foreground'}`}
        title={tooltip || undefined}
      >
        {value}
      </span>
    );
  }

  return (
    <button
      type='button'
      aria-label={label}
      title={tooltip || undefined}
      onClick={() => onEdit(row.id, field)}
      className={`focus-ring flex w-full items-center justify-between rounded-lg px-2 py-1 text-left transition hover:bg-primary/6 ${hasError ? 'bg-danger/8 text-danger ring-1 ring-danger/20' : ''}`}
    >
      <span>{value}</span>
      <span className='text-[11px] text-muted-foreground'>{issues.length > 0 ? `${issues.length} issue${issues.length === 1 ? '' : 's'}` : 'Editar'}</span>
    </button>
  );
}
