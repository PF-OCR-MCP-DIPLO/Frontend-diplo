import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { SettingsSection } from "@/features/settings/components/SettingsSection";
import type {
  ApiProcessingSettings,
  ApiProcessingSettingsOptions,
} from "@/features/settings/types/settings.api";
import type { SettingsFormValues } from "@/features/settings/types/settings.types";

const TESSERACT_LANGUAGE_OPTIONS = [
  { value: "spa", label: "Español" },
  { value: "eng", label: "Inglés" },
  { value: "spa+eng", label: "Español + Inglés" },
] as const;

interface OcrSettingsSectionProps {
  settings: ApiProcessingSettings;
  options: ApiProcessingSettingsOptions;
  values: SettingsFormValues;
  ocrModelOptions: string[];
  visionModelOptions: string[];
  onChange: (values: SettingsFormValues) => void;
}

export function OcrSettingsSection({
  settings,
  options,
  values,
  ocrModelOptions,
  visionModelOptions,
  onChange,
}: OcrSettingsSectionProps) {
  const shouldShowOcrProvider = values.ocr_mode !== "tesseract";
  const ocrModes = options.ocr_modes ?? [];
  const ocrProviders = options.providers?.ocr ?? [];
  const ocrRequirements = options.provider_requirements?.[values.ocr_provider];
  type TesseractLanguage = (typeof TESSERACT_LANGUAGE_OPTIONS)[number]["value"];

  const tesseractLanguages = TESSERACT_LANGUAGE_OPTIONS.map(
    (option) => option.value,
  ) satisfies TesseractLanguage[];

  function isTesseractLanguage(value: string): value is TesseractLanguage {
    return (tesseractLanguages as readonly string[]).includes(value);
  }
  const formatProviderLabel = (provider: string) => {
    const requirement = options.provider_requirements?.[provider];
    return requirement && !requirement.operational
      ? `${provider} (MVP no operativo)`
      : provider;
  };

  return (
    <SettingsSection
      title="OCR"
      description="Configura la lectura inicial del documento."
    >
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="field-stack">
          <Label htmlFor="ocr-mode">Modo OCR</Label>
          <Select
            id="ocr-mode"
            value={values.ocr_mode}
            onChange={(event) => {
              const nextMode = event.target
                .value as SettingsFormValues["ocr_mode"];
              const nextValues: SettingsFormValues = {
                ...values,
                ocr_mode: nextMode,
              };

              if (
                nextMode === "tesseract" &&
                !isTesseractLanguage(values.ocr_model)
              ) {
                nextValues.ocr_model = "spa";
              }
              if (nextMode === "auto" && !isTesseractLanguage(values.ocr_model)) {
                nextValues.ocr_model = "spa";
              }

              onChange(nextValues);
            }}
          >
            {ocrModes.length > 0 ? (
              ocrModes.map((mode) => (
                <option key={mode} value={mode}>
                  {mode}
                </option>
              ))
            ) : (
              <option value={values.ocr_mode}>{values.ocr_mode}</option>
            )}
          </Select>
          <p className="field-help">
            `tesseract` es local. `vision` y `auto` usan proveedor remoto.
          </p>
        </div>
        {shouldShowOcrProvider ? (
          <div className="field-stack">
            <Label htmlFor="ocr-provider">Proveedor OCR</Label>
            <Select
              id="ocr-provider"
              value={values.ocr_provider}
              onChange={(event) =>
                onChange({
                  ...values,
                  ocr_provider: event.target
                    .value as SettingsFormValues["ocr_provider"],
                })
              }
            >
              {ocrProviders.length > 0 ? (
                ocrProviders.map((provider) => (
                  <option key={provider} value={provider}>
                    {formatProviderLabel(provider)}
                  </option>
                ))
              ) : (
                <option value={values.ocr_provider}>
                  {formatProviderLabel(values.ocr_provider)}
                </option>
              )}
            </Select>
            <p className="field-help">
              Para presentación, usa `tesseract` o `ollama`.
            </p>
          </div>
        ) : null}
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        {values.ocr_mode === "tesseract" || values.ocr_mode === "auto" ? (
          <div className="field-stack">
            <Label htmlFor="ocr-model">Modelo OCR</Label>
            <Select
              id="ocr-model"
              value={
                isTesseractLanguage(values.ocr_model) ? values.ocr_model : "spa"
              }
              onChange={(event) =>
                onChange({ ...values, ocr_model: event.target.value })
              }
            >
              {TESSERACT_LANGUAGE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
            <p className="field-help">
              Selecciona el idioma instalado para OCR local.
            </p>
          </div>
        ) : null}

        {values.ocr_mode === "vision" || values.ocr_mode === "auto" ? (
          <div className="field-stack">
            <Label htmlFor="vision-model">Modelo Vision</Label>
            {visionModelOptions.length > 0 ? (
              <Select
                id="vision-model"
                value={values.vision_model}
                onChange={(event) =>
                  onChange({ ...values, vision_model: event.target.value })
                }
              >
                {visionModelOptions.map((model) => (
                  <option key={model} value={model}>
                    {model}
                  </option>
                ))}
              </Select>
            ) : (
              <Input
                id="vision-model"
                value={values.vision_model}
                onChange={(event) =>
                  onChange({ ...values, vision_model: event.target.value })
                }
                placeholder={visionModelOptions[0] ?? "vision model"}
              />
            )}
            {visionModelOptions.length > 0 ? (
              <p className="field-help">Sugeridos: {visionModelOptions.join(", ")}</p>
            ) : null}
          </div>
        ) : null}

        {values.ocr_mode === "auto" && ocrModelOptions.length > 0 ? (
          <div className="field-stack sm:col-span-2">
            <p className="field-help">
              OCR local y Vision se enviaran como campos separados al backend.
            </p>
          </div>
        ) : null}
        {shouldShowOcrProvider && ocrRequirements?.requires_api_key ? (
          <div className="field-stack">
            <Label htmlFor="ocr-api-key">API key OCR</Label>
            <Input
              id="ocr-api-key"
              type="password"
              value={values.ocr_api_key}
              onChange={(event) =>
                onChange({ ...values, ocr_api_key: event.target.value })
              }
              placeholder={
                settings.has_ocr_api_key
                  ? "API key configurada"
                  : "Ingresa API key"
              }
            />
          </div>
        ) : null}
      </div>

      {shouldShowOcrProvider &&
      ocrRequirements &&
      !ocrRequirements.operational ? (
        <p className="notice-warning">
          Este proveedor OCR aparece como referencia, pero aun no esta operativo
          en este MVP.
        </p>
      ) : null}

      <div className="grid gap-5 border-t border-border/60 pt-5 sm:grid-cols-2">
        <div className="field-stack">
          <Label htmlFor="max-images-warning-threshold">
            Límite recomendado de imágenes
          </Label>
          <Input
            id="max-images-warning-threshold"
            type="number"
            min={1}
            max={1000}
            value={values.max_images_warning_threshold}
            onChange={(event) =>
              onChange({
                ...values,
                max_images_warning_threshold: Number.parseInt(
                  event.target.value || "1",
                  10,
                ),
              })
            }
          />
          <p className="field-help">
            Si el documento lo supera, se registrara una advertencia y seguira
            el procesamiento.
          </p>
        </div>

        <label
          htmlFor="block-documents-over-image-limit"
          className="flex items-start gap-3 rounded-lg border border-border/60 p-3 text-sm"
        >
          <input
            id="block-documents-over-image-limit"
            type="checkbox"
            checked={values.block_documents_over_image_limit}
            onChange={(event) =>
              onChange({
                ...values,
                block_documents_over_image_limit: event.target.checked,
              })
            }
            className="mt-1 size-4 rounded border-border text-primary focus:ring-primary"
          />
          <span>
            <span className="block font-medium text-foreground">
              Bloquear si supera el límite
            </span>
            <span className="text-muted-foreground">
              Desactivado por defecto; al activarlo el backend rechaza el DOCX
              con un error claro.
            </span>
          </span>
        </label>
      </div>
    </SettingsSection>
  );
}
