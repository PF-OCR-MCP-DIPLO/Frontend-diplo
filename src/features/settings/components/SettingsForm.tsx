import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { AssistantSettingsSection } from '@/features/settings/components/sections/AssistantSettingsSection';
import { ExtractionCriteriaSection } from '@/features/settings/components/sections/ExtractionCriteriaSection';
import { LlmSettingsSection } from '@/features/settings/components/sections/LlmSettingsSection';
import { OcrSettingsSection } from '@/features/settings/components/sections/OcrSettingsSection';
import type { AssistantQueryContext } from '@/features/assistant/types/assistant-query-context.types';
import type { ApiProcessingSettings, ApiProcessingSettingsOptions } from '@/features/settings/types/settings.api';
import type { SettingsFormValues } from '@/features/settings/types/settings.types';

interface SettingsFormProps {
  settings: ApiProcessingSettings;
  options: ApiProcessingSettingsOptions;
  values: SettingsFormValues;
  onChange: (values: SettingsFormValues) => void;
  onSave: () => void;
  isSaving: boolean;
  modelOptions: { ocr: string[]; llm: string[]; assistant: string[] };
  onOpenAssistant: (context: AssistantQueryContext, prompt: string) => void;
}

export function SettingsForm({ settings, options, values, onChange, onSave, isSaving, modelOptions, onOpenAssistant }: SettingsFormProps) {
  const updatedLabel = settings.updated_at
    ? new Date(settings.updated_at).toLocaleString('es-CO')
    : 'sin registro';

  return (
    <Card className='max-w p-6'>
      <div className='space-y-6'>
        <div className='flex flex-col gap-3 border-b border-border/70 pb-5 sm:flex-row sm:items-center sm:justify-between'>
          <div>
            <h2 className='font-semibold text-foreground'>Parametros</h2>
            <p className='text-sm text-muted-foreground'>Aplica solo los cambios que necesites.</p>
          </div>
          <div className='flex flex-wrap items-center gap-3'>
            <span className='meta-pill'>Actualizado {updatedLabel}</span>
            <Button onClick={onSave} disabled={isSaving}>{isSaving ? 'Guardando...' : 'Guardar'}</Button>
            <Button
              type='button'
              variant='outline'
              onClick={() => onOpenAssistant(
                {
                  page: 'settings',
                  jobId: undefined,
                  intentHint: 'explain_settings',
                },
                'Ayúdame a revisar y simplificar esta configuración.',
              )}
            >
              Ayúdame con Assistant
            </Button>
          </div>
        </div>

        <div className='notice-warning'>
          Para una demo estable de este MVP, prioriza `tesseract` u `ollama`. Otros proveedores visibles se muestran como referencia de expansión, pero no están operativos de extremo a extremo.
        </div>

        <OcrSettingsSection
          settings={settings}
          options={options}
          values={values}
          modelOptions={modelOptions.ocr}
          onChange={onChange}
        />

        <LlmSettingsSection
          settings={settings}
          options={options}
          values={values}
          modelOptions={modelOptions.llm}
          onChange={onChange}
        />

        <AssistantSettingsSection
          settings={settings}
          options={options}
          values={values}
          modelOptions={modelOptions.assistant}
          onChange={onChange}
        />

        <ExtractionCriteriaSection
          value={values.extraction_criteria}
          onChange={(next) => onChange({ ...values, extraction_criteria: next })}
        />
      </div>
    </Card>
  );
}
