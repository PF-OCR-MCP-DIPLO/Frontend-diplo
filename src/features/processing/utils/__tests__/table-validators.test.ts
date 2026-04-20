import { describe, expect, it } from 'vitest';
import { validateRow, validateRowField } from '@/features/processing/utils/table-validators';
import type { ConsignmentRow } from '@/features/processing/types/processing.types';

const baseRow: ConsignmentRow = {
  id: '1',
  fecha: '2025-01-01',
  monto: '$ 1200',
  referencia: 'ABC123',
  banco: 'Bancolombia',
  estado: 'valid',
  errors: [],
};

describe('table validators', () => {
  it('marks a valid row as valid', () => {
    expect(validateRow(baseRow)).toEqual({ estado: 'valid', errors: [] });
  });

  it('marks monto as invalid when not numeric', () => {
    expect(validateRowField(baseRow, 'monto', 'abc')).toEqual({
      estado: 'error',
      errors: ['El monto debe ser numerico'],
    });
  });

  it('aggregates validation errors across fields', () => {
    expect(
      validateRow({
        ...baseRow,
        fecha: '',
        monto: 'abc',
        referencia: 'x',
        banco: '',
      })
    ).toEqual({
      estado: 'error',
      errors: [
        'La fecha es obligatoria',
        'El monto debe ser numerico',
        'La referencia debe tener al menos 3 caracteres',
        'El banco es obligatorio',
      ],
    });
  });
});
