import { AlertTriangle, Clock, RefreshCw } from "lucide-react";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import type {
  ApiProcessingTrace,
  ApiProcessingTraceEvent,
  ApiProcessingTraceSourceImage,
} from "@/features/processing/types/processing.api";

interface ResultsTracePanelProps {
  trace: ApiProcessingTrace | null;
  isLoading: boolean;
  error: string | null;
  onRefresh: () => void;
}

function uniqueValues(
  events: ApiProcessingTraceEvent[],
  key: keyof Pick<ApiProcessingTraceEvent, "stage" | "status" | "agent">,
) {
  return Array.from(new Set(events.map((event) => event[key]).filter(Boolean))).sort();
}

function formatDuration(value: number | null | undefined) {
  const ms = Number(value ?? 0);
  if (ms >= 1000) return `${(ms / 1000).toFixed(1)}s`;
  return `${ms}ms`;
}

function stringify(value: unknown) {
  if (!value || (typeof value === "object" && Object.keys(value).length === 0)) {
    return "{}";
  }
  return JSON.stringify(value, null, 2);
}

function errorText(error: ApiProcessingTraceEvent["error"]) {
  if (!error) return "";
  if (typeof error === "string") return error;
  return [error.class, error.message].filter(Boolean).join(": ");
}

function compactReasons(items: Array<Record<string, unknown>>) {
  const reasons = items
    .map((item) => String(item.reason ?? item.notes ?? "rechazado"))
    .filter(Boolean);
  return Array.from(new Set(reasons)).slice(0, 4).join(", ");
}

function imageTraceLabel(image: ApiProcessingTraceSourceImage) {
  return image.source_name || `Imagen ${image.sequence_index}`;
}

export function ResultsTracePanel({
  trace,
  isLoading,
  error,
  onRefresh,
}: ResultsTracePanelProps) {
  const events = useMemo(() => trace?.events ?? [], [trace]);
  const imageTraces = useMemo(() => trace?.source_images ?? [], [trace]);
  const [stageFilter, setStageFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [agentFilter, setAgentFilter] = useState("");
  const [imageFilter, setImageFilter] = useState("");

  const stageOptions = useMemo(() => uniqueValues(events, "stage"), [events]);
  const statusOptions = useMemo(() => uniqueValues(events, "status"), [events]);
  const agentOptions = useMemo(() => uniqueValues(events, "agent"), [events]);
  const imageOptions = useMemo(
    () =>
      Array.from(
        new Set([
          ...events
            .map((event) => event.source_image_id)
            .filter((value): value is number => typeof value === "number"),
          ...imageTraces.map((image) => image.id),
        ]),
      ).sort((a, b) => a - b),
    [events, imageTraces],
  );

  const filteredEvents = events.filter((event) => {
    return (
      (!stageFilter || event.stage === stageFilter) &&
      (!statusFilter || event.status === statusFilter) &&
      (!agentFilter || event.agent === agentFilter) &&
      (!imageFilter || String(event.source_image_id ?? "") === imageFilter)
    );
  });

  return (
    <div className="space-y-4 text-sm">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="font-medium text-foreground">Trazabilidad del proceso</p>
          <p className="text-xs text-muted-foreground">
            {trace
              ? `${trace.summary.processed_images}/${trace.summary.total_images} imágenes · ${trace.summary.total_records} registros`
              : "Trace del procesamiento por etapa y agente."}
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onRefresh}
          disabled={isLoading}
          aria-label="Refrescar trazabilidad"
        >
          <RefreshCw className={`size-4 ${isLoading ? "animate-spin" : ""}`} />
          Refrescar trazabilidad
        </Button>
      </div>

      {trace ? (
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="rounded-lg border border-border/60 p-2">
            <p className="text-muted-foreground">Estado</p>
            <p className="font-medium text-foreground">{trace.status}</p>
          </div>
          <div className="rounded-lg border border-border/60 p-2">
            <p className="text-muted-foreground">Duración</p>
            <p className="font-medium text-foreground">
              {formatDuration(trace.duration_ms)}
            </p>
          </div>
        </div>
      ) : null}

      {imageTraces.length > 0 ? (
        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground">
            Resumen por imagen
          </p>
          <div className="space-y-2">
            {imageTraces
              .filter((image) => !imageFilter || String(image.id) === imageFilter)
              .map((image) => (
                <details
                  key={image.id}
                  className="rounded-lg border border-border/60 bg-surface-subtle p-3"
                >
                  <summary className="cursor-pointer list-none">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate font-medium text-foreground">
                          {imageTraceLabel(image)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Contexto {image.context_date || "sin fecha"} · final{" "}
                          {image.final_date_used || "sin fecha"} ·{" "}
                          {image.final_date_source || "sin fuente"}
                        </p>
                      </div>
                      <span className="shrink-0 rounded-md border border-border/60 px-2 py-1 text-xs">
                        {image.persisted_records.length} registros
                      </span>
                    </div>
                  </summary>
                  <div className="mt-3 grid gap-2 text-xs sm:grid-cols-2">
                    <div>
                      <p className="text-muted-foreground">Fecha OCR explícita</p>
                      <p className="font-medium">
                        {image.explicit_ocr_date || "No detectada"}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Candidatos</p>
                      <p className="font-medium">
                        LLM {image.llm_candidates_count} · fallback{" "}
                        {image.fallback_candidates_count}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Rechazos</p>
                      <p className="font-medium">
                        {image.rejected_candidates.length
                          ? compactReasons(image.rejected_candidates)
                          : "Sin rechazos"}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Encabezado DOCX</p>
                      <p className="font-medium">
                        {image.context_text || "Sin contexto"}
                      </p>
                    </div>
                  </div>
                </details>
              ))}
          </div>
        </div>
      ) : null}

      <div className="grid gap-2 sm:grid-cols-2">
        <select
          className="h-9 rounded-md border border-border bg-background px-2 text-sm"
          value={stageFilter}
          onChange={(event) => setStageFilter(event.target.value)}
          aria-label="Filtrar por etapa"
        >
          <option value="">Todas las etapas</option>
          {stageOptions.map((stage) => (
            <option key={stage} value={stage}>
              {stage}
            </option>
          ))}
        </select>
        <select
          className="h-9 rounded-md border border-border bg-background px-2 text-sm"
          value={agentFilter}
          onChange={(event) => setAgentFilter(event.target.value)}
          aria-label="Filtrar por agente"
        >
          <option value="">Todos los agentes</option>
          {agentOptions.map((agent) => (
            <option key={agent} value={agent}>
              {agent}
            </option>
          ))}
        </select>
        <select
          className="h-9 rounded-md border border-border bg-background px-2 text-sm"
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value)}
          aria-label="Filtrar por estado"
        >
          <option value="">Todos los estados</option>
          {statusOptions.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>
        <select
          className="h-9 rounded-md border border-border bg-background px-2 text-sm"
          value={imageFilter}
          onChange={(event) => setImageFilter(event.target.value)}
          aria-label="Filtrar por imagen"
        >
          <option value="">Todas las imágenes</option>
          {imageOptions.map((imageId) => (
            <option key={imageId} value={imageId}>
              Imagen {imageId}
            </option>
          ))}
        </select>
      </div>

      {isLoading && !trace ? <p className="text-muted-foreground">Cargando trazabilidad...</p> : null}
      {error ? <p className="text-danger">{error}</p> : null}

      <div className="space-y-3">
        {filteredEvents.map((event) => {
          const message = errorText(event.error);
          return (
            <details
              key={event.id}
              className={`rounded-lg border p-3 ${
                message || event.status === "failed"
                  ? "border-danger/30 bg-danger/8"
                  : "border-border/60 bg-surface-subtle"
              }`}
            >
              <summary className="cursor-pointer list-none">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate font-medium text-foreground">
                      {event.stage}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {event.agent || "Sin agente"} · intento {event.attempt || 0}
                      {event.source_image_id ? ` · imagen ${event.source_image_id}` : ""}
                    </p>
                  </div>
                  <span className="shrink-0 rounded-md border border-border/60 px-2 py-1 text-xs">
                    {event.status}
                  </span>
                </div>
                <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-1">
                    <Clock className="size-3" />
                    {formatDuration(event.duration_ms)}
                  </span>
                  {event.provider || event.model ? (
                    <span>
                      {[event.provider, event.model].filter(Boolean).join(" / ")}
                    </span>
                  ) : null}
                </div>
                {message ? (
                  <p className="mt-2 flex items-start gap-2 text-xs text-danger">
                    <AlertTriangle className="mt-0.5 size-3 shrink-0" />
                    <span>{message}</span>
                  </p>
                ) : null}
              </summary>
              <div className="mt-3 space-y-3">
                {event.decision ? (
                  <p className="rounded-md border border-border/60 bg-background p-2 text-xs">
                    {event.decision}
                  </p>
                ) : null}
                <div>
                  <p className="mb-1 text-xs font-medium text-muted-foreground">Input</p>
                  <pre className="max-h-64 overflow-auto rounded-md bg-background p-2 text-xs">
                    {stringify(event.input)}
                  </pre>
                </div>
                <div>
                  <p className="mb-1 text-xs font-medium text-muted-foreground">Output</p>
                  <pre className="max-h-64 overflow-auto rounded-md bg-background p-2 text-xs">
                    {stringify(event.output)}
                  </pre>
                </div>
              </div>
            </details>
          );
        })}
      </div>
    </div>
  );
}
