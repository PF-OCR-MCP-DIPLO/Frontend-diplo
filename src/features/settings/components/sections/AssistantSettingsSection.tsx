import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { SettingsSection } from '@/features/settings/components/SettingsSection';
import type { ApiProcessingSettings, ApiProcessingSettingsOptions } from '@/features/settings/types/settings.api';
import type { SettingsFormValues } from '@/features/settings/types/settings.types';

interface AssistantSettingsSectionProps {
  settings: ApiProcessingSettings;
  options: ApiProcessingSettingsOptions;
  values: SettingsFormValues;
  modelOptions: string[];
  onChange: (values: SettingsFormValues) => void;
}

export function AssistantSettingsSection({ settings, options, values, modelOptions, onChange }: AssistantSettingsSectionProps) {
  const assistantRequirements = options.provider_requirements[values.assistant_provider];
  const providerModels = modelOptions.length > 0 ? modelOptions : [];
  const needsApiKey = assistantRequirements?.requires_api_key ?? values.assistant_provider !== 'ollama';

  return (
    <SettingsSection
      title='Chatbot / Agente'
      description='Este modelo se usa solo para el asistente conversacional. El modelo de extracción sigue configurándose aparte.'
    >
      <div className='grid gap-5 sm:grid-cols-2'>
        <div className='field-stack'>
          <Label htmlFor='assistant-provider'>Proveedor</Label>
          <Select
            id='assistant-provider'
            value={values.assistant_provider}
            onChange={(event) => onChange({ ...values, assistant_provider: event.target.value as SettingsFormValues['assistant_provider'] })}
          >
            {options.providers.llm.map((provider) => <option key={provider} value={provider}>{provider}</option>)}
          </Select>
        </div>
        <div className='field-stack'>
          <Label htmlFor='assistant-model'>Modelo</Label>
          {providerModels.length > 0 ? (
            <>
              <Input
                id='assistant-model'
                list='assistant-model-options'
                value={values.assistant_model}
                onChange={(event) => onChange({ ...values, assistant_model: event.target.value })}
                placeholder={providerModels[0] ?? 'model'}
              />
              <datalist id='assistant-model-options'>
                {providerModels.map((model) => <option key={model} value={model} />)}
              </datalist>
            </>
          ) : (
            <Input
              id='assistant-model'
              value={values.assistant_model}
              onChange={(event) => onChange({ ...values, assistant_model: event.target.value })}
              placeholder='Escribe el modelo manualmente'
            />
          )}
          <p className='field-help'>
            {providerModels.length > 0 ? `Sugeridos: ${providerModels.join(', ')}` : 'No hay modelos detectados; puedes escribir el nombre manualmente.'}
          </p>
        </div>
      </div>

      <div className='grid gap-5 sm:grid-cols-3'>
        <div className='field-stack'>
          <Label htmlFor='assistant-temperature'>Temperatura</Label>
          <Input
            id='assistant-temperature'
            type='number'
            step='0.1'
            min='0'
            max='2'
            value={values.assistant_temperature}
            onChange={(event) => onChange({ ...values, assistant_temperature: Number(event.target.value) || 0 })}
          />
        </div>
        <div className='field-stack'>
          <Label htmlFor='assistant-num-predict'>Max tokens</Label>
          <Input
            id='assistant-num-predict'
            type='number'
            min='16'
            step='16'
            value={values.assistant_num_predict}
            onChange={(event) => onChange({ ...values, assistant_num_predict: Number(event.target.value) || 256 })}
          />
        </div>
        {needsApiKey ? (
          <div className='field-stack'>
            <Label htmlFor='assistant-api-key'>API key</Label>
            <Input
              id='assistant-api-key'
              type='password'
              value={values.assistant_api_key}
              onChange={(event) => onChange({ ...values, assistant_api_key: event.target.value })}
              placeholder={settings.has_assistant_api_key ? 'API key configurada' : 'Ingresa API key'}
            />
          </div>
        ) : null}
      </div>

      <div className='text-sm text-muted-foreground'>
        {settings.has_assistant_api_key ? (
          <p>Ya hay una API key configurada para el asistente.</p>
        ) : (
          <p>El asistente puede usar Ollama local sin API key.</p>
        )}
      </div>
    </SettingsSection>
  );
}
