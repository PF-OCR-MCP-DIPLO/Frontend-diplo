export type ExtractionFieldType = 'text' | 'number' | 'date' | 'currency' | 'boolean';

export type ExtractionValidationRule =
  | { kind: 'required'; message?: string }
  | { kind: 'equals'; value: string | number | boolean; message?: string }
  | { kind: 'regex'; pattern: string; message?: string }
  | { kind: 'min'; value: number; message?: string }
  | { kind: 'max'; value: number; message?: string };

export type ExtractionFieldCriterion = {
  key: string;
  label: string;
  type: ExtractionFieldType;
  required: boolean;
  enabled: boolean;
  expectedValue?: string | number | boolean | null;
  validationRules: ExtractionValidationRule[];
  helpText?: string;
  order?: number;
};

export type ExtractionCriteriaConfig = {
  fields: ExtractionFieldCriterion[];
};

export const DEFAULT_EXTRACTION_CRITERIA: ExtractionCriteriaConfig = {
  fields: [
    {
      key: 'fecha_consignacion',
      label: 'Fecha de consignacion',
      type: 'date',
      required: true,
      enabled: true,
      expectedValue: null,
      validationRules: [{ kind: 'required', message: 'La fecha de consignacion es obligatoria.' }],
      helpText: 'Fecha de la consignacion en formato DD/MM/YYYY.',
      order: 1,
    },
    {
      key: 'hora_consignacion',
      label: 'Hora de consignacion',
      type: 'text',
      required: false,
      enabled: true,
      expectedValue: null,
      validationRules: [],
      helpText: 'Hora capturada para la consignacion en formato HH:MM.',
      order: 2,
    },
    {
      key: 'referencia',
      label: 'Referencia',
      type: 'text',
      required: true,
      enabled: true,
      expectedValue: null,
      validationRules: [{ kind: 'required', message: 'La referencia es obligatoria.' }],
      helpText: 'Texto identificador del deposito.',
      order: 3,
    },
    {
      key: 'valor',
      label: 'Valor',
      type: 'currency',
      required: true,
      enabled: true,
      expectedValue: null,
      validationRules: [{ kind: 'required', message: 'El valor es obligatorio.' }],
      helpText: 'Monto monetario de la consignacion.',
      order: 4,
    },
  ],
};

export function createBlankCriterion(order: number): ExtractionFieldCriterion {
  return {
    key: `campo_${order}`,
    label: 'Nuevo campo',
    type: 'text',
    required: false,
    enabled: true,
    expectedValue: null,
    validationRules: [],
    helpText: '',
    order,
  };
}
