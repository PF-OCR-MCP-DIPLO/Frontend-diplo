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
        className={`h-8 ${hasError ? 'border-red-500' : ''}`}
      />
    );
  }

  if (!editable) {
    return <span className='block px-2 py-1 text-slate-600'>{value}</span>;
  }

  return (
    <button
      type='button'
      aria-label={label}
      onClick={() => onEdit(row.id, field)}
      className={`flex w-full items-center justify-between rounded-lg px-2 py-1 text-left transition hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 ${hasError ? 'text-red-600' : ''}`}
    >
      <span>{value}</span>
      <span className='text-[11px] text-slate-400'>Editar</span>
    </button>
  );
}
