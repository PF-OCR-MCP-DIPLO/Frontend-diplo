import { Input } from '@/components/ui/input';
import type { ConsignmentRow } from '@/features/processing/types/processing.types';

interface EditableCellProps {
  row: ConsignmentRow;
  field: keyof ConsignmentRow;
  editable: boolean;
  isEditing: boolean;
  onEdit: (rowId: string, field: keyof ConsignmentRow) => void;
  onChange: (rowId: string, field: keyof ConsignmentRow, value: string) => void;
  onBlur: () => void;
  onKeyDown: (event: React.KeyboardEvent<HTMLInputElement>) => void;
}

export function EditableCell({ row, field, editable, isEditing, onEdit, onChange, onBlur, onKeyDown }: EditableCellProps) {
  const value = String(row[field]);
  const hasError = row.estado === 'error';
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
    return <span className='block px-2 py-1 text-surface-foreground'>{value}</span>;
  }

  return (
    <button
      type='button'
      aria-label={label}
      onClick={() => onEdit(row.id, field)}
      className={`focus-ring flex w-full items-center justify-between rounded-lg px-2 py-1 text-left transition hover:bg-primary/6 ${hasError ? 'text-danger' : ''}`}
    >
      <span>{value}</span>
      <span className='text-[11px] text-muted-foreground'>Editar</span>
    </button>
  );
}
