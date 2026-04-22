import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { LlmSettingsSection } from '@/features/settings/components/sections/LlmSettingsSection';
import { OcrSettingsSection } from '@/features/settings/components/sections/OcrSettingsSection';
import type { ApiProcessingSettings, ApiProcessingSettingsOptions } from '@/features/settings/types/settings.api';
import type { SettingsFormValues } from '@/features/settings/types/settings.types';

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
  return (
    <Card className='max-w-5xl p-6'>
      <div className='space-y-6'>
        <div className='flex flex-col gap-3 border-b border-border/70 pb-5 sm:flex-row sm:items-center sm:justify-between'>
          <div>
            <h2 className='font-semibold text-foreground'>Parametros</h2>
            <p className='text-sm text-muted-foreground'>Aplica solo los cambios que necesites.</p>
          </div>
          <div className='flex flex-wrap items-center gap-3'>
            <span className='meta-pill'>Actualizado {new Date(settings.updated_at).toLocaleString('es-CO')}</span>
            <Button onClick={onSave} disabled={isSaving}>{isSaving ? 'Guardando...' : 'Guardar'}</Button>
          </div>
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
      </div>
    </Card>
  );
}
