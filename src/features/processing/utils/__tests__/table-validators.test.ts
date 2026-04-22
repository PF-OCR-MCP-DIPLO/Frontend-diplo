import { describe, expect, it } from 'vitest';
import { validateRow, validateRowField } from '@/features/processing/utils/table-validators';
import type { ConsignmentRow } from '@/features/processing/types/processing.types';

const baseRow: ConsignmentRow = {
  id: '1',
  depositId: 1,
  sourceImageId: 10,
  fecha: '01/01/2025',
  hora: '09:30',
  monto: '$ 1200',
  referencia: 'ABC123',
  sourceName: 'image1.png',
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
        fecha: '2025-01-01',
        hora: '123',
        monto: 'abc',
        referencia: 'x',
        sourceName: '',
      })
    ).toEqual({
      estado: 'error',
      errors: [
        'La fecha debe tener formato DD/MM/YYYY',
        'La hora debe tener formato HH:MM',
        'El monto debe ser numerico',
        'La referencia debe tener al menos 3 caracteres',
        'El archivo origen es obligatorio',
      ],
    });
  });
});
