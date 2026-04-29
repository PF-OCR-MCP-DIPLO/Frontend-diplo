import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { SettingsSection } from '@/features/settings/components/SettingsSection';
import type { SettingsFormValues } from '@/features/settings/types/settings.types';

const MONTH_OPTIONS = [
  { value: 1, label: 'Enero' },
  { value: 2, label: 'Febrero' },
  { value: 3, label: 'Marzo' },
  { value: 4, label: 'Abril' },
  { value: 5, label: 'Mayo' },
  { value: 6, label: 'Junio' },
  { value: 7, label: 'Julio' },
  { value: 8, label: 'Agosto' },
  { value: 9, label: 'Septiembre' },
  { value: 10, label: 'Octubre' },
  { value: 11, label: 'Noviembre' },
  { value: 12, label: 'Diciembre' },
];

interface ValidConsignationPeriodSectionProps {
  values: SettingsFormValues;
  onChange: (values: SettingsFormValues) => void;
}

export function ValidConsignationPeriodSection({
  values,
  onChange,
}: ValidConsignationPeriodSectionProps) {
  return (
    <SettingsSection
      title='Periodo de consignacion'
      description='Define el mes y año que el sistema usará para validar la fecha de cada consignación.'
    >
      <p className='field-help'>
        Las consignaciones serán válidas si su fecha pertenece a este mes y año, no al mes actual del sistema.
      </p>

      <div className='grid gap-5 sm:grid-cols-2'>
        <div className='field-stack'>
          <Label htmlFor='valid-consignation-month'>Mes válido de consignación</Label>
          <Select
            id='valid-consignation-month'
            value={String(values.valid_consignation_month)}
            onChange={(event) =>
              onChange({
                ...values,
                valid_consignation_month: Number.parseInt(event.target.value, 10),
              })
            }
          >
            {MONTH_OPTIONS.map((month) => (
              <option key={month.value} value={month.value}>
                {month.label}
              </option>
            ))}
          </Select>
        </div>

        <div className='field-stack'>
          <Label htmlFor='valid-consignation-year'>Año válido de consignación</Label>
          <Input
            id='valid-consignation-year'
            type='number'
            min={2000}
            max={2100}
            step={1}
            value={values.valid_consignation_year}
            onChange={(event) =>
              onChange({
                ...values,
                valid_consignation_year: Number.parseInt(event.target.value, 10) || values.valid_consignation_year,
              })
            }
          />
        </div>
      </div>
    </SettingsSection>
  );
}
