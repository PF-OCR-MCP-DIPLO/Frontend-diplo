import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import type { ApiProcessingSettings, ApiProcessingSettingsOptions } from '@/features/settings/types/settings.api';
import type { SettingsFormValues } from '@/features/settings/types/settings.types';
import { SettingsSection } from '@/features/settings/components/SettingsSection';

interface SettingsFormProps {
  settings: ApiProcessingSettings;
  options: ApiProcessingSettingsOptions;
  values: SettingsFormValues;
  onChange: (values: SettingsFormValues) => void;
  onSave: () => void;
  isSaving: boolean;
  modelOptions: { ocr: string[]; llm: string[] };
}

export function SettingsForm({ settings, options, values, onChange, onSave, isSaving, modelOptions }: SettingsFormProps) {
  const shouldShowOcrProvider = values.ocr_mode !== 'tesseract';
  const ocrRequirements = options.provider_requirements[values.ocr_provider];
  const llmRequirements = options.provider_requirements[values.llm_provider];

  return (
    <Card className='max-w-5xl rounded-[32px] border-slate-200 p-6 shadow-sm'>
      <div className='space-y-8'>
        <SettingsSection title='OCR'>
          <div className='grid gap-4 sm:grid-cols-2'>
            <div className='space-y-2'>
              <Label htmlFor='ocr-mode'>OCR mode</Label>
              <select
                id='ocr-mode'
                className='h-10 w-full rounded-md border border-slate-200 px-3 text-sm'
                value={values.ocr_mode}
                onChange={(event) => onChange({ ...values, ocr_mode: event.target.value as SettingsFormValues['ocr_mode'] })}
              >
                {options.ocr_modes.map((mode) => <option key={mode} value={mode}>{mode}</option>)}
              </select>
              <p className='text-xs text-slate-500'>tesseract usa OCR local; vision y auto permiten proveedor remoto.</p>
            </div>
            {shouldShowOcrProvider ? (
              <div className='space-y-2'>
                <Label htmlFor='ocr-provider'>OCR provider</Label>
                <select
                  id='ocr-provider'
                  className='h-10 w-full rounded-md border border-slate-200 px-3 text-sm'
                  value={values.ocr_provider}
                  onChange={(event) => onChange({ ...values, ocr_provider: event.target.value as SettingsFormValues['ocr_provider'] })}
                >
                  {options.providers.ocr.map((provider) => <option key={provider} value={provider}>{provider}</option>)}
                </select>
              </div>
            ) : null}
          </div>

          <div className='grid gap-4 sm:grid-cols-2'>
            <div className='space-y-2'>
              <Label htmlFor='ocr-model'>OCR model</Label>
              <Input
                id='ocr-model'
                value={values.ocr_model}
                onChange={(event) => onChange({ ...values, ocr_model: event.target.value })}
                placeholder={values.ocr_mode === 'tesseract' ? 'spa' : modelOptions.ocr[0] ?? 'model'}
              />
              {values.ocr_mode === 'tesseract' ? (
                <p className='text-xs text-slate-500'>Ejemplo: `spa`, `eng` o `spa+eng`.</p>
              ) : modelOptions.ocr.length > 0 ? (
                <p className='text-xs text-slate-500'>Sugeridos: {modelOptions.ocr.join(', ')}</p>
              ) : null}
            </div>
            {shouldShowOcrProvider && ocrRequirements?.requires_api_key ? (
              <div className='space-y-2'>
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
            <p className='rounded-2xl bg-amber-50 p-3 text-sm text-amber-800'>El provider OCR seleccionado aun no esta operativo en este MVP.</p>
          ) : null}
        </SettingsSection>

        <SettingsSection title='Extraccion estructurada (LLM)'>
          <div className='grid gap-4 sm:grid-cols-2'>
            <div className='space-y-2'>
              <Label htmlFor='llm-provider'>LLM provider</Label>
              <select
                id='llm-provider'
                className='h-10 w-full rounded-md border border-slate-200 px-3 text-sm'
                value={values.llm_provider}
                onChange={(event) => onChange({ ...values, llm_provider: event.target.value as SettingsFormValues['llm_provider'] })}
              >
                {options.providers.llm.map((provider) => <option key={provider} value={provider}>{provider}</option>)}
              </select>
            </div>
            <div className='space-y-2'>
              <Label htmlFor='llm-model'>LLM model</Label>
              <Input
                id='llm-model'
                value={values.llm_model}
                onChange={(event) => onChange({ ...values, llm_model: event.target.value })}
                placeholder={modelOptions.llm[0] ?? 'model'}
              />
              {modelOptions.llm.length > 0 ? <p className='text-xs text-slate-500'>Sugeridos: {modelOptions.llm.join(', ')}</p> : null}
            </div>
          </div>

          <div className='grid gap-4 sm:grid-cols-2'>
            {llmRequirements?.requires_api_key ? (
              <div className='space-y-2'>
                <Label htmlFor='llm-api-key'>LLM provider API key</Label>
                <Input
                  id='llm-api-key'
                  type='password'
                  value={values.llm_api_key}
                  onChange={(event) => onChange({ ...values, llm_api_key: event.target.value })}
                  placeholder={settings.has_llm_api_key ? 'API key configurada' : 'Ingresa API key'}
                />
              </div>
            ) : null}
            <div className='space-y-2'>
              <Label htmlFor='timeout'>Request timeout (seconds)</Label>
              <Input
                id='timeout'
                type='number'
                min={30}
                value={values.request_timeout_seconds}
                onChange={(event) => onChange({ ...values, request_timeout_seconds: Number(event.target.value) || 30 })}
              />
              <p className='text-xs text-slate-500'>Aplica a proveedores remotos y extraccion LLM.</p>
            </div>
          </div>

          {llmRequirements && !llmRequirements.operational ? (
            <p className='rounded-2xl bg-amber-50 p-3 text-sm text-amber-800'>El provider LLM seleccionado aun no esta operativo en este MVP.</p>
          ) : null}
        </SettingsSection>

        <div className='rounded-2xl bg-slate-50 p-4 text-sm text-slate-700'>
          Ultima actualizacion: {new Date(settings.updated_at).toLocaleString('es-CO')}
        </div>

        <div className='flex flex-wrap justify-end gap-3'>
          <Button onClick={onSave} disabled={isSaving}>{isSaving ? 'Guardando...' : 'Guardar cambios'}</Button>
        </div>
      </div>
    </Card>
  );
}
