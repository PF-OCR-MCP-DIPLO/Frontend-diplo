import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
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
    <SettingsSection title='LLM' description='Configura la extraccion estructurada.'>
      <div className='grid gap-5 sm:grid-cols-2'>
        <div className='field-stack'>
          <Label htmlFor='llm-provider'>Proveedor</Label>
          <Select
            id='llm-provider'
            value={values.llm_provider}
            onChange={(event) => onChange({ ...values, llm_provider: event.target.value as SettingsFormValues['llm_provider'] })}
          >
            {options.providers.llm.map((provider) => <option key={provider} value={provider}>{provider}</option>)}
          </Select>
        </div>
        <div className='field-stack'>
          <Label htmlFor='llm-model'>Modelo</Label>
          {modelOptions.length > 0 ? (
            <Select
              id='llm-model'
              value={values.llm_model}
              onChange={(event) => onChange({ ...values, llm_model: event.target.value })}
            >
              {modelOptions.map((model) => <option key={model} value={model}>{model}</option>)}
            </Select>
          ) : (
            <Input
              id='llm-model'
              value={values.llm_model}
              onChange={(event) => onChange({ ...values, llm_model: event.target.value })}
              placeholder='model'
            />
          )}
          {modelOptions.length > 0 ? <p className='field-help'>Sugeridos: {modelOptions.join(', ')}</p> : null}
        </div>
      </div>

      <div className='grid gap-5 sm:grid-cols-2'>
        {llmRequirements?.requires_api_key ? (
          <div className='field-stack'>
            <Label htmlFor='llm-api-key'>API key</Label>
            <Input
              id='llm-api-key'
              type='password'
              value={values.llm_api_key}
              onChange={(event) => onChange({ ...values, llm_api_key: event.target.value })}
              placeholder={settings.has_llm_api_key ? 'API key configurada' : 'Ingresa API key'}
            />
          </div>
        ) : null}
        <div className='field-stack'>
          <Label htmlFor='timeout'>Timeout (segundos)</Label>
          <Input
            id='timeout'
            type='number'
            min={30}
            value={values.request_timeout_seconds}
            onChange={(event) => onChange({ ...values, request_timeout_seconds: Number(event.target.value) || 30 })}
          />
          <p className='field-help'>Aplica a solicitudes remotas.</p>
        </div>
      </div>

      {llmRequirements && !llmRequirements.operational ? (
        <p className='notice-warning'>Este proveedor LLM aun no esta operativo.</p>
      ) : null}
    </SettingsSection>
  );
}
