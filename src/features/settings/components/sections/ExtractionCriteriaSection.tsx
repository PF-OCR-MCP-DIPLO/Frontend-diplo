/**
 * Edita los criterios de extracción que el backend usa como contrato semántico.
 *
 * La sección permite definir campos, validaciones y orden sin abandonar la
 * pantalla de configuración.
 */
import { Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { SettingsSection } from '@/features/settings/components/SettingsSection';
import { createBlankCriterion } from '@/features/settings/types/extraction-criteria.types';
import type { ExtractionCriteriaConfig, ExtractionFieldCriterion, ExtractionValidationRule } from '@/features/settings/types/extraction-criteria.types';

interface ExtractionCriteriaSectionProps {
  value: ExtractionCriteriaConfig;
  onChange: (next: ExtractionCriteriaConfig) => void;
}

const FIELD_TYPES: Array<ExtractionFieldCriterion['type']> = ['text', 'number', 'date', 'currency', 'boolean'];

function buildRules(field: ExtractionFieldCriterion): ExtractionValidationRule[] {
  // Las reglas se derivan del estado del campo para que el backend reciba un
  // contrato coherente incluso si el usuario solo edita controles parciales.
  const rules: ExtractionValidationRule[] = [];
  if (field.required) {
    rules.push({ kind: 'required', message: `${field.label || field.key} es obligatorio.` });
  }
  if (field.expectedValue !== null && field.expectedValue !== undefined && field.expectedValue !== '') {
    rules.push({ kind: 'equals', value: field.expectedValue, message: `${field.label || field.key} debe coincidir con el valor esperado.` });
  }
  return rules;
}

function updateField(fields: ExtractionFieldCriterion[], index: number, nextPartial: Partial<ExtractionFieldCriterion>) {
  return fields.map((field, currentIndex) => {
    if (currentIndex !== index) return field;
    const nextField = { ...field, ...nextPartial };
    return {
      ...nextField,
      validationRules: buildRules(nextField),
    };
  });
}

export function ExtractionCriteriaSection({ value, onChange }: ExtractionCriteriaSectionProps) {
  const fields = [...value.fields].sort((left, right) => (left.order ?? 0) - (right.order ?? 0));

  return (
    <SettingsSection title='Criterios de extraccion' description='Define campos, reglas y texto de ayuda antes de procesar documentos.'>
      <div className='flex items-center justify-between gap-3'>
        <p className='text-sm text-muted-foreground'>Estos criterios se guardan en la configuracion y viajan al backend durante el procesamiento.</p>
        <Button
          type='button'
          variant='outline'
          className='gap-2'
          onClick={() => onChange({ fields: [...fields, createBlankCriterion(fields.length + 1)] })}
        >
          <Plus className='size-4' />
          Agregar campo
        </Button>
      </div>

      <div className='space-y-4'>
        {fields.map((field, index) => (
          <div key={`${field.key}-${index}`} className='rounded-2xl border border-border/70 bg-white/72 p-4 shadow-[var(--shadow-soft)]'>
            <div className='mb-4 flex items-start justify-between gap-3'>
              <div>
                <h4 className='font-semibold text-foreground'>{field.label || field.key}</h4>
                <p className='text-sm text-muted-foreground'>{field.helpText || 'Sin ayuda adicional'}</p>
              </div>
              <Button
                type='button'
                variant='ghost'
                size='sm'
                onClick={() => onChange({ fields: fields.filter((_, currentIndex) => currentIndex !== index).map((item, currentIndex) => ({ ...item, order: currentIndex + 1 })) })}
              >
                <Trash2 className='size-4' />
              </Button>
            </div>

            <div className='grid gap-4 md:grid-cols-2 xl:grid-cols-3'>
              <div className='field-stack'>
                <Label htmlFor={`criteria-key-${field.key}`}>Clave</Label>
                <Input
                  id={`criteria-key-${field.key}`}
                  value={field.key}
                  onChange={(event) => onChange({ fields: updateField(fields, index, { key: event.target.value }) })}
                />
              </div>
              <div className='field-stack'>
                <Label htmlFor={`criteria-label-${field.key}`}>Etiqueta</Label>
                <Input
                  id={`criteria-label-${field.key}`}
                  value={field.label}
                  onChange={(event) => onChange({ fields: updateField(fields, index, { label: event.target.value }) })}
                />
              </div>
              <div className='field-stack'>
                <Label htmlFor={`criteria-type-${field.key}`}>Tipo</Label>
                <Select
                  id={`criteria-type-${field.key}`}
                  value={field.type}
                  onChange={(event) => onChange({ fields: updateField(fields, index, { type: event.target.value as ExtractionFieldCriterion['type'] }) })}
                >
                  {FIELD_TYPES.map((type) => <option key={type} value={type}>{type}</option>)}
                </Select>
              </div>
              <div className='field-stack'>
                <Label htmlFor={`criteria-order-${field.key}`}>Orden</Label>
                <Input
                  id={`criteria-order-${field.key}`}
                  type='number'
                  min={1}
                  value={field.order ?? index + 1}
                  onChange={(event) => onChange({ fields: updateField(fields, index, { order: Number(event.target.value) || index + 1 }) })}
                />
              </div>
              <div className='field-stack'>
                <Label htmlFor={`criteria-expected-${field.key}`}>Valor esperado</Label>
                <Input
                  id={`criteria-expected-${field.key}`}
                  value={String(field.expectedValue ?? '')}
                  onChange={(event) => onChange({ fields: updateField(fields, index, { expectedValue: event.target.value }) })}
                />
              </div>
              <div className='field-stack'>
                <Label htmlFor={`criteria-help-${field.key}`}>Ayuda</Label>
                <textarea
                  id={`criteria-help-${field.key}`}
                  className='focus-ring min-h-24 w-full rounded-xl border border-border/82 bg-input-background px-3.5 py-2 text-sm text-foreground'
                  value={field.helpText ?? ''}
                  onChange={(event) => onChange({ fields: updateField(fields, index, { helpText: event.target.value }) })}
                />
              </div>
            </div>

            <div className='mt-4 flex flex-wrap items-center gap-4'>
              <label className='inline-flex items-center gap-2 text-sm text-foreground'>
                <input
                  type='checkbox'
                  checked={field.required}
                  onChange={(event) => onChange({ fields: updateField(fields, index, { required: event.target.checked }) })}
                />
                Requerido
              </label>
              <label className='inline-flex items-center gap-2 text-sm text-foreground'>
                <input
                  type='checkbox'
                  checked={field.enabled}
                  onChange={(event) => onChange({ fields: updateField(fields, index, { enabled: event.target.checked }) })}
                />
                Habilitado
              </label>
            </div>
          </div>
        ))}
      </div>
    </SettingsSection>
  );
}
