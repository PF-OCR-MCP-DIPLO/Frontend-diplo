/**
 * Encapsula la carga, edición y persistencia de la configuración.
 *
 * El hook coordina el estado del formulario, las opciones disponibles y los
 * modelos detectados sin mezclar esta lógica con la UI.
 */
import { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import {
  getOllamaModels,
  getProcessingSettings,
  getProcessingSettingsOptions,
  updateProcessingSettings,
} from '@/features/settings/api/settings.api';
import { DEFAULT_EXTRACTION_CRITERIA } from '@/features/settings/types/extraction-criteria.types';
import type {
  ApiOllamaModelsResponse,
  ApiProcessingSettings,
  ApiProcessingSettingsOptions,
} from '@/features/settings/types/settings.api';
import type { SettingsFormValues } from '@/features/settings/types/settings.types';
import {
  normalizeSettings,
  normalizeSettingsOptions,
} from '@/features/settings/utils/settings-normalizers';

function createFormValues(settings: ApiProcessingSettings): SettingsFormValues {
  // Las API keys nunca se rehidratan en texto plano para evitar exposición
  // accidental en UI o snapshots de estado del navegador.
  return {
    ocr_mode: settings.ocr_mode,
    ocr_provider: settings.ocr_provider,
    ocr_model: settings.ocr_model,
    llm_provider: settings.llm_provider,
    llm_model: settings.llm_model,
    assistant_provider: settings.assistant_provider,
    assistant_model: settings.assistant_model,
    assistant_show_debug_details: settings.assistant_show_debug_details,
    assistant_temperature: settings.assistant_temperature,
    assistant_num_predict: settings.assistant_num_predict,
    request_timeout_seconds: settings.request_timeout_seconds,
    ocr_api_key: '',
    llm_api_key: '',
    assistant_api_key: '',
    extraction_criteria: settings.extraction_criteria ?? DEFAULT_EXTRACTION_CRITERIA,
  };
}

function serializeValues(values: SettingsFormValues | null) {
  return values ? JSON.stringify(values) : '';
}

function uniqueStrings(values: Array<string | undefined | null>) {
  return Array.from(
    new Set(
      values
        .map((value) => String(value ?? '').trim())
        .filter(Boolean),
    ),
  );
}

function buildModelOptions(
  options: ApiProcessingSettingsOptions,
  ollamaModels: ApiOllamaModelsResponse | null,
  values: SettingsFormValues,
) {
  const ollamaModelNames = (ollamaModels?.models ?? [])
    .map((model) => model.name)
    .filter(Boolean);

  const providerModels = options.provider_models ?? {};

  const ocrModels =
    values.ocr_provider === 'ollama'
      ? ollamaModelNames
      : providerModels[values.ocr_provider]?.ocr ?? [];

  const llmModels =
    values.llm_provider === 'ollama'
      ? ollamaModelNames
      : providerModels[values.llm_provider]?.llm ?? [];

  const assistantModels =
    values.assistant_provider === 'ollama'
      ? ollamaModelNames
      : providerModels[values.assistant_provider]?.llm ?? [];

  return {
    ocr: uniqueStrings([values.ocr_model, ...ocrModels]),
    llm: uniqueStrings([values.llm_model, ...llmModels]),
    assistant: uniqueStrings([values.assistant_model, ...assistantModels]),
  };
}

export function useSettingsForm() {
  const [settings, setSettings] = useState<ApiProcessingSettings | null>(null);
  const [options, setOptions] = useState<ApiProcessingSettingsOptions | null>(null);
  const [ollamaModels, setOllamaModels] = useState<ApiOllamaModelsResponse | null>(null);
  const [values, setValues] = useState<SettingsFormValues | null>(null);
  const [baselineValues, setBaselineValues] = useState<SettingsFormValues | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    setLoadError(null);

    try {
      const [loadedSettings, loadedOptions, loadedOllamaModels] = await Promise.all([
        getProcessingSettings(),
        getProcessingSettingsOptions(),
        getOllamaModels(),
      ]);

      const safeSettings = normalizeSettings(loadedSettings);
      const safeOptions = normalizeSettingsOptions(loadedOptions);
      const nextValues = createFormValues(safeSettings);

      setSettings(safeSettings);
      setOptions(safeOptions);
      setOllamaModels(loadedOllamaModels);
      setValues(nextValues);
      setBaselineValues(nextValues);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'No se pudo cargar la configuracion';

      setLoadError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const hasUnsavedChanges = useMemo(
    () => serializeValues(values) !== serializeValues(baselineValues),
    [baselineValues, values],
  );

  useEffect(() => {
    if (!hasUnsavedChanges) {
      return;
    }

    function handleBeforeUnload(event: BeforeUnloadEvent) {
      event.preventDefault();
      event.returnValue = '';
    }

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);

  const modelOptions = useMemo(() => {
    if (!options || !values) {
      return { ocr: [], llm: [], assistant: [] };
    }

    return buildModelOptions(options, ollamaModels, values);
  }, [ollamaModels, options, values]);

  const save = useCallback(async (): Promise<boolean> => {
    if (!values) {
      return false;
    }

    setIsSaving(true);

    try {
      const {
        ocr_api_key,
        llm_api_key,
        assistant_api_key,
        ...rest
      } = values;

      const payload: Record<string, unknown> = {
        ...rest,
        extraction_criteria: values.extraction_criteria,
      };

      if (ocr_api_key.trim()) {
        payload.ocr_api_key = ocr_api_key.trim();
      }

      if (llm_api_key.trim()) {
        payload.llm_api_key = llm_api_key.trim();
      }

      if (assistant_api_key.trim()) {
        payload.assistant_api_key = assistant_api_key.trim();
      }

      const savedSettings = normalizeSettings(
        await updateProcessingSettings(payload),
      );

      if (
        values.assistant_provider === 'ollama' &&
        values.assistant_model &&
        savedSettings.assistant_model !== values.assistant_model
      ) {
        throw new Error(
          `El backend no guardó el modelo del asistente. Enviado: ${values.assistant_model}. Recibido: ${savedSettings.assistant_model}`,
        );
      }

      const nextValues = createFormValues(savedSettings);

      setSettings(savedSettings);
      setValues(nextValues);
      setBaselineValues(nextValues);

      toast.success('Configuracion guardada correctamente');
      return true;
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'No se pudo guardar la configuracion';

      toast.error(message);
      return false;
    } finally {
      setIsSaving(false);
    }
  }, [values]);

  function discardChanges() {
    if (!baselineValues) return;
    setValues(baselineValues);
  }

  return {
    settings,
    options,
    values,
    setValues,
    hasUnsavedChanges,
    modelOptions,
    ollamaModels,
    isLoading,
    isSaving,
    loadError,
    reload: load,
    save,
    discardChanges,
  };
}