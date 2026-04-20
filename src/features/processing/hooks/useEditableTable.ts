import { useMemo, useState } from 'react';
import type { ConsignmentRow } from '@/features/processing/types/processing.types';
import { validateRowField } from '@/features/processing/utils/table-validators';

export function useEditableTable(data: ConsignmentRow[], onDataChange: (data: ConsignmentRow[]) => void) {
  const [editingCell, setEditingCell] = useState<{ rowId: string; field: keyof ConsignmentRow } | null>(null);

  const errorCount = useMemo(() => data.filter((row) => row.estado === 'error').length, [data]);

  function startEditing(rowId: string, field: keyof ConsignmentRow) {
    setEditingCell({ rowId, field });
  }

  function stopEditing() {
    setEditingCell(null);
  }

  function updateCell(rowId: string, field: keyof ConsignmentRow, value: string) {
    const nextRows = data.map((row): ConsignmentRow => {
      if (row.id !== rowId) {
        return row;
      }

      const validation = validateRowField(row, field, value);
      return {
        ...row,
        [field]: value,
        estado: validation.estado,
        errors: validation.errors,
      };
    });

    onDataChange(nextRows);
  }

  return {
    editingCell,
    errorCount,
    startEditing,
    stopEditing,
    updateCell,
  };
}
