import type { ConsignmentRow, RowStatus } from '@/features/processing/types/processing.types';
import { isValidCurrencyInput } from '@/features/processing/utils/table-formatters';

function validateFecha(value: string) {
  if (!value.trim()) {
    return [];
  }
  return /^\d{2}\/\d{2}\/\d{4}$/.test(value.trim()) ? [] : ['La fecha debe tener formato DD/MM/YYYY'];
}

function validateHora(value: string) {
  if (!value.trim()) {
    return [];
  }
  return /^\d{2}:\d{2}$/.test(value.trim()) ? [] : ['La hora debe tener formato HH:MM'];
}

function validateMonto(value: string) {
  return isValidCurrencyInput(value) ? [] : ['El monto debe ser numerico'];
}

function validateReferencia(value: string) {
  return value.trim().length >= 3 ? [] : ['La referencia debe tener al menos 3 caracteres'];
}

function validateSourceName(value: string) {
  return value.trim() ? [] : ['El archivo origen es obligatorio'];
}

export function validateRow(row: ConsignmentRow): { estado: RowStatus; errors: string[] } {
  const nextErrors = [
    ...validateFecha(row.fecha),
    ...validateHora(row.hora),
    ...validateMonto(row.monto),
    ...validateReferencia(row.referencia),
    ...validateSourceName(row.sourceName),
  ];

  return {
    estado: nextErrors.length > 0 ? 'error' : 'valid',
    errors: nextErrors,
  };
}

export function validateRowField(row: ConsignmentRow, field: keyof ConsignmentRow, value: string): { estado: RowStatus; errors: string[] } {
  const nextRow: ConsignmentRow = {
    ...row,
    [field]: value,
  };

  return validateRow(nextRow);
}
