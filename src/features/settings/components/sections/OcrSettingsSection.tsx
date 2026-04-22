import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { SettingsSection } from '@/features/settings/components/SettingsSection';
import type { ApiProcessingSettings, ApiProcessingSettingsOptions } from '@/features/settings/types/settings.api';
import type { SettingsFormValues } from '@/features/settings/types/settings.types';

interface OcrSettingsSectionProps {
  settings: ApiProcessingSettings;
  options: ApiProcessingSettingsOptions;
  values: SettingsFormValues;
  modelOptions: string[];
  onChange: (values: SettingsFormValues) => void;
}

export function OcrSettingsSection({ settings, options, values, modelOptions, onChange }: OcrSettingsSectionProps) {
  const shouldShowOcrProvider = values.ocr_mode !== 'tesseract';
  const ocrRequirements = options.provider_requirements[values.ocr_provider];

  return (
    <SettingsSection title='OCR'>
      <div className='grid gap-5 sm:grid-cols-2'>
        <div className='field-stack'>
          <Label htmlFor='ocr-mode'>OCR mode</Label>
          <Select
            id='ocr-mode'
            value={values.ocr_mode}
            onChange={(event) => onChange({ ...values, ocr_mode: event.target.value as SettingsFormValues['ocr_mode'] })}
          >
            {options.ocr_modes.map((mode) => <option key={mode} value={mode}>{mode}</option>)}
          </Select>
          <p className='field-help'>tesseract usa OCR local; vision y auto permiten proveedor remoto.</p>
        </div>
        {shouldShowOcrProvider ? (
          <div className='field-stack'>
            <Label htmlFor='ocr-provider'>OCR provider</Label>
            <Select
              id='ocr-provider'
              value={values.ocr_provider}
              onChange={(event) => onChange({ ...values, ocr_provider: event.target.value as SettingsFormValues['ocr_provider'] })}
            >
              {options.providers.ocr.map((provider) => <option key={provider} value={provider}>{provider}</option>)}
            </Select>
          </div>
        ) : null}
      </div>

      <div className='grid gap-5 sm:grid-cols-2'>
        <div className='field-stack'>
          <Label htmlFor='ocr-model'>OCR model</Label>
          <Input
            id='ocr-model'
            value={values.ocr_model}
            onChange={(event) => onChange({ ...values, ocr_model: event.target.value })}
            placeholder={values.ocr_mode === 'tesseract' ? 'spa' : modelOptions[0] ?? 'model'}
          />
          {values.ocr_mode === 'tesseract' ? (
            <p className='field-help'>Ejemplo: `spa`, `eng` o `spa+eng`.</p>
          ) : modelOptions.length > 0 ? (
            <p className='field-help'>Sugeridos: {modelOptions.join(', ')}</p>
          ) : null}
        </div>
        {shouldShowOcrProvider && ocrRequirements?.requires_api_key ? (
          <div className='field-stack'>
            <Label htmlFor='ocr-api-key'>OCR provider API key</Label>
            <Input
              id='ocr-api-key'
              type='password'
              value={values.ocr_api_key}
              onChange={(event) => onChange({ ...values, ocr_api_key: event.target.value })}
              placeholder={settings.has_ocr_api_key ? 'API key configurada' : 'Ingresa API key'}
            />
          </div>
        ) : null}
      </div>

      {shouldShowOcrProvider && ocrRequirements && !ocrRequirements.operational ? (
        <p className='notice-warning'>El provider OCR seleccionado aun no esta operativo en este MVP.</p>
      ) : null}
    </SettingsSection>
  );
}
