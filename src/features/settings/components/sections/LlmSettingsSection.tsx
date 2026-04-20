import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SettingsSection } from '@/features/settings/components/SettingsSection';
import type { ApiProcessingSettings, ApiProcessingSettingsOptions } from '@/features/settings/types/settings.api';
import type { SettingsFormValues } from '@/features/settings/types/settings.types';

interface LlmSettingsSectionProps {
  settings: ApiProcessingSettings;
  options: ApiProcessingSettingsOptions;
  values: SettingsFormValues;
  modelOptions: string[];
  onChange: (values: SettingsFormValues) => void;
}

export function LlmSettingsSection({ settings, options, values, modelOptions, onChange }: LlmSettingsSectionProps) {
  const llmRequirements = options.provider_requirements[values.llm_provider];

  return (
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
            placeholder={modelOptions[0] ?? 'model'}
          />
          {modelOptions.length > 0 ? <p className='text-xs text-slate-500'>Sugeridos: {modelOptions.join(', ')}</p> : null}
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
  );
}
