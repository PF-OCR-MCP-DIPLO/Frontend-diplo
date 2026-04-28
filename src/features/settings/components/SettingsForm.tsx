/**
 * Coordina el formulario principal de configuración.
 *
 * Agrupa proveedores OCR/LLM/asistente y criterios de extracción para que la
 * pantalla persista un único contrato con el backend.
 */
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { AssistantSettingsSection } from '@/features/settings/components/sections/AssistantSettingsSection';
import { ExtractionCriteriaSection } from '@/features/settings/components/sections/ExtractionCriteriaSection';
import { LlmSettingsSection } from '@/features/settings/components/sections/LlmSettingsSection';
import { OcrSettingsSection } from '@/features/settings/components/sections/OcrSettingsSection';
import type { AssistantQueryContext } from '@/features/assistant/types/assistant-query-context.types';
import type {
  ApiProcessingSettings,
  ApiProcessingSettingsOptions,
} from '@/features/settings/types/settings.api';
import type { SettingsFormValues } from '@/features/settings/types/settings.types';

interface SettingsFormProps {
  settings: ApiProcessingSettings;
  options: ApiProcessingSettingsOptions;
  values: SettingsFormValues;
  onChange: (values: SettingsFormValues) => void;
  onSave: () => void | Promise<void>;
  onDiscard: () => void;
  isSaving: boolean;
  hasUnsavedChanges: boolean;
  modelOptions: { ocr: string[]; llm: string[]; assistant: string[] };
  onOpenAssistant: (
    context: AssistantQueryContext,
    prompt: string,
  ) => void | Promise<void>;
}

export function SettingsForm({
  settings,
  options,
  values,
  onChange,
  onSave,
  onDiscard,
  isSaving,
  hasUnsavedChanges,
  modelOptions,
  onOpenAssistant,
}: SettingsFormProps) {
  const updatedLabel = settings.updated_at
    ? new Date(settings.updated_at).toLocaleString('es-CO')
    : 'sin registro';

  return (
    <Card className='max-w p-6'>
      <div className='space-y-6'>
        <div className='flex flex-col gap-3 border-b border-border/70 pb-5 sm:flex-row sm:items-center sm:justify-between'>
          <div>
            <h2 className='font-semibold text-foreground'>Parametros</h2>
            <p className='text-sm text-muted-foreground'>
              Aplica solo los cambios que necesites.
            </p>
          </div>

          <div className='flex flex-wrap items-center gap-3'>
            <span className='meta-pill'>Actualizado {updatedLabel}</span>

            <Button
              type='button'
              variant='outline'
              onClick={onDiscard}
              disabled={!hasUnsavedChanges || isSaving}
            >
              Descartar cambios
            </Button>

            <Button
              type='button'
              onClick={() => void onSave()}
              disabled={isSaving || !hasUnsavedChanges}
              variant={hasUnsavedChanges ? 'default' : 'outline'}
            >
              {isSaving ? 'Guardando...' : 'Guardar'}
            </Button>

            <Button
              type='button'
              variant='outline'
              disabled={isSaving}
              onClick={() =>
                void onOpenAssistant(
                  {
                    page: 'settings',
                    jobId: undefined,
                    intentHint: 'explain_settings',
                  },
                  'Ayúdame a revisar y simplificar esta configuración.',
                )
              }
            >
              Ayúdame con Assistant
            </Button>
          </div>
        </div>

        {hasUnsavedChanges ? (
          <div className='notice-warning' role='status'>
            Tienes cambios sin guardar. Guarda para actualizar la configuración
            activa o descártalos para volver al último estado guardado.
          </div>
        ) : null}

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