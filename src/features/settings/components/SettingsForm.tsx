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
    <Card className='max-w-5xl rounded-[32px] border-slate-200 bg-white/95 p-6 shadow-sm'>
      <div className='space-y-8'>
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

        <div className='rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700'>
          Ultima actualizacion: {new Date(settings.updated_at).toLocaleString('es-CO')}
        </div>

        <div className='flex flex-wrap justify-end gap-3'>
          <Button onClick={onSave} className='rounded-2xl' disabled={isSaving}>{isSaving ? 'Guardando cambios...' : 'Guardar cambios'}</Button>
        </div>
      </div>
    </Card>
  );
}
