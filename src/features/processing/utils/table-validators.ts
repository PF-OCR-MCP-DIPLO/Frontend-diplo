import type { ConsignmentRow, RowStatus } from '@/features/processing/types/processing.types';
import { isValidCurrencyInput } from '@/features/processing/utils/table-formatters';

export function validateRowField(row: ConsignmentRow, field: keyof ConsignmentRow, value: string): { estado: RowStatus; errors: string[] } {
  if (field !== 'monto') {
    return {
      estado: row.estado,
      errors: row.errors,
    };
  }

  const valid = isValidCurrencyInput(value);
  return {
    estado: valid ? 'valid' : 'error',
    errors: valid ? [] : ['Monto no es numerico'],
  };
}
