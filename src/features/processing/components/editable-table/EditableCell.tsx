import { Input } from '@/components/ui/input';
import type { ConsignmentRow } from '@/features/processing/types/processing.types';

interface EditableCellProps {
  row: ConsignmentRow;
  field: keyof ConsignmentRow;
  isEditing: boolean;
  onEdit: (rowId: string, field: keyof ConsignmentRow) => void;
  onChange: (rowId: string, field: keyof ConsignmentRow, value: string) => void;
  onBlur: () => void;
}

export function EditableCell({ row, field, isEditing, onEdit, onChange, onBlur }: EditableCellProps) {
  const value = String(row[field]);
  const hasError = row.estado === 'error' && field === 'monto';

  if (isEditing) {
    return (
      <Input
        autoFocus
        value={value}
        onChange={(event) => onChange(row.id, field, event.target.value)}
        onBlur={onBlur}
        className={`h-8 ${hasError ? 'border-red-500' : ''}`}
      />
    );
  }

  return (
    <div
      onDoubleClick={() => onEdit(row.id, field)}
      className={`cursor-pointer rounded-lg px-2 py-1 transition hover:bg-slate-100 ${hasError ? 'text-red-600' : ''}`}
    >
      {value}
    </div>
  );
}
