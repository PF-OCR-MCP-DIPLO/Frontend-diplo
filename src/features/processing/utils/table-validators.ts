import type { ConsignmentRow, RowStatus } from '@/features/processing/types/processing.types';
import { isValidCurrencyInput } from '@/features/processing/utils/table-formatters';

function validateFecha(value: string) {
  return value.trim() ? [] : ['La fecha es obligatoria'];
}

function validateMonto(value: string) {
  return isValidCurrencyInput(value) ? [] : ['El monto debe ser numerico'];
}

function validateReferencia(value: string) {
  return value.trim().length >= 3 ? [] : ['La referencia debe tener al menos 3 caracteres'];
}

function validateBanco(value: string) {
  return value.trim() ? [] : ['El banco es obligatorio'];
}

export function validateRow(row: ConsignmentRow): { estado: RowStatus; errors: string[] } {
  const nextErrors = [
    ...validateFecha(row.fecha),
    ...validateMonto(row.monto),
    ...validateReferencia(row.referencia),
    ...validateBanco(row.banco),
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
