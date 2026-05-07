/**
 * Encapsula las operaciones de negocio de la pantalla de procesamiento.
 *
 * Concentra acceso a API, sincronización del historial, polling de corridas,
 * exportación y persistencia de la ejecución activa en almacenamiento local.
 *
 * @remarks
 * Este hook coordina varios efectos secundarios que la UI no debe repetir en
 * cada componente: fetch, localStorage y reconciliación del resultado activo.
 */
import { useCallback, useMemo, useRef } from "react";
import { HttpError } from "@/services/http/client";
import {
  deleteJob,
  exportJob,
  getJob,
  getJobDiagnostics,
  getProcessingState,
  listJobs,
  processJob,
  reprocessFailed,
  saveJobCorrections,
  uploadDocument,
} from "@/features/processing/api/processing.api";
import type { ProcessingState } from "@/features/processing/hooks/useProcessingState";
import {
  mapJobListItemToPlaceholder,
  mapJobToProcessedFile,
} from "@/features/processing/mappers/processing.mappers";
import type { ConsignmentRow } from "@/features/processing/types/processing.types";
import { mergeProcessedJob } from "@/features/processing/utils/processing-store";

const TERMINAL_STATUSES = new Set([
  "completed",
  "completed_with_errors",
  "failed",
]);
const KNOWN_JOB_STATUSES = new Set([
  "uploaded",
  "processing",
  "completed",
  "completed_with_errors",
  "failed",
]);
const PROCESSING_INITIAL_POLL_INTERVAL_MS = 1500;
const PROCESSING_SLOW_POLL_INTERVAL_MS = 5000;
const PROCESSING_BACKOFF_AFTER_MS = 30_000;
const PROCESSING_POLL_TIMEOUT_MS = 180_000;
export const ACTIVE_JOB_STORAGE_KEY = "diplo.active-job-id";

/**
 * Provee acciones de alto nivel para el dominio de procesamiento.
 *
 * @param state - Setters y estado interno administrado por `useProcessingState`.
 * @returns Acciones memoizadas para upload, procesamiento, polling, exportación y guardado.
 *
 * @remarks
 * Este hook es la frontera de side effects del módulo: llamadas HTTP, polling
 * adaptativo y sincronización con `localStorage` de la corrida activa.
 */
export function useProcessingActions({
  currentResults,
  processedFiles,
  setCurrentResults,
  setIsExporting,
  setIsLoadingHistory,
  setIsProcessing,
  setIsRefreshing,
  setIsSavingCorrections,
  setProcessedFiles,
  setHistoryError,
}: ProcessingState) {
  const currentJobId = currentResults?.jobId;
  const activePollsRef = useRef(
    new Map<number, Promise<ReturnType<typeof mapJobToProcessedFile> | null>>(),
  );
  const activeUploadsRef = useRef(
    new Map<string, Promise<ReturnType<typeof mapJobToProcessedFile>>>(),
  );
  const activeProcessRequestsRef = useRef(
    new Map<number, Promise<ReturnType<typeof mapJobToProcessedFile> | null>>(),
  );

  const upsertCurrentJob = useCallback(
    (job: ReturnType<typeof mapJobToProcessedFile>) => {
      setProcessedFiles((previous) => mergeProcessedJob(previous, job));
      setCurrentResults(job);
      if (typeof window !== "undefined") {
        window.localStorage.setItem(ACTIVE_JOB_STORAGE_KEY, String(job.jobId));
      }
      return job;
    },
    [setCurrentResults, setProcessedFiles],
  );

  const refreshHistory = useCallback(async () => {
    setIsLoadingHistory(true);
    setHistoryError(null);
    try {
      const jobs = await listJobs();
      setProcessedFiles((previous) => {
        const preserved = new Map(previous.map((item) => [item.jobId, item]));
        return jobs.map(
          (job) => preserved.get(job.id) ?? mapJobListItemToPlaceholder(job),
        );
      });
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "No se pudo cargar el historial";
      setHistoryError(message);
      throw error;
    } finally {
      setIsLoadingHistory(false);
    }
  }, [setHistoryError, setIsLoadingHistory, setProcessedFiles]);

  const selectResultByJobId = useCallback(
    async (jobId: number) => {
      setIsRefreshing(true);
      try {
        const job = mapJobToProcessedFile(await getJob(jobId));
        return upsertCurrentJob(job);
      } finally {
        setIsRefreshing(false);
      }
    },
    [setIsRefreshing, upsertCurrentJob],
  );

  const mergeProcessingState = useCallback(
    async (jobId: number) => {
      const state = await getProcessingState(jobId);
      setProcessedFiles((previous) =>
        previous.map((item) =>
          item.jobId === jobId
            ? {
                ...item,
                status: state.status,
                totalImages: state.total_images,
                totalRecords: state.total_records,
                errorCount: state.failed_images,
                displayStatus:
                  state.failed_images > 0 || state.status === "failed"
                    ? "error"
                    : item.displayStatus,
                processingState: state,
              }
            : item,
        ),
      );
      setCurrentResults((previous) =>
        previous?.jobId === jobId
          ? {
              ...previous,
              status: state.status,
              totalImages: state.total_images,
              totalRecords: state.total_records,
              errorCount: state.failed_images,
              displayStatus:
                state.failed_images > 0 || state.status === "failed"
                  ? "error"
                  : previous.displayStatus,
              processingState: state,
            }
          : previous,
      );
      return state;
    },
    [setCurrentResults, setProcessedFiles],
  );

  const deleteJobResult = useCallback(
    async (jobId: number) => {
      await deleteJob(jobId);
      setProcessedFiles((previous) =>
        previous.filter((item) => item.jobId !== jobId),
      );
      setCurrentResults((previous) => {
        if (previous?.jobId === jobId) {
          if (typeof window !== "undefined") {
            window.localStorage.removeItem(ACTIVE_JOB_STORAGE_KEY);
          }
          return null;
        }
        return previous;
      });
    },
    [setCurrentResults, setProcessedFiles],
  );

  const pollJobUntilSettled = useCallback(
    async (jobId: number) => {
      // Se reutiliza un único polling por job para evitar carreras si varias
      // vistas disparan refresco simultáneo del mismo procesamiento.
      const existing = activePollsRef.current.get(jobId);
      if (existing) {
        return existing;
      }

      const pollPromise = (async () => {
        const startedAt = Date.now();
        let latestState = await mergeProcessingState(jobId);

        while (latestState && !TERMINAL_STATUSES.has(latestState.status)) {
          if (!KNOWN_JOB_STATUSES.has(String(latestState.status))) {
            throw new Error(
              `El backend devolvió un estado inválido (${String(latestState.status)}). Abre "Trazabilidad" para revisar el último evento del proceso.`,
            );
          }
          if (latestState.stale_processing) {
            throw new Error(
              `El procesamiento no registra progreso reciente. Última etapa observada: ${latestState.current_stage ?? "desconocida"}. Abre "Trazabilidad" para ver el detalle por agente.`,
            );
          }
          // Timeout defensivo para evitar loops infinitos cuando el backend no
          // transiciona a estado terminal por errores externos de proveedor.
          if (Date.now() - startedAt >= PROCESSING_POLL_TIMEOUT_MS) {
            const diagnostics = await getJobDiagnostics(jobId).catch(
              () => null,
            );
            const stage =
              diagnostics?.summary?.slowest_stage ??
              latestState.current_stage ??
              "desconocida";
            const message = `El procesamiento superó el tiempo de espera. Última etapa observada: ${stage}. Abre "Trazabilidad" para revisar input/output por agente.`;
            setCurrentResults((previous) =>
              previous?.jobId === jobId
                ? { ...previous, errorMessage: message }
                : previous,
            );
            setProcessedFiles((previous) =>
              previous.map((item) =>
                item.jobId === jobId ? { ...item, errorMessage: message } : item,
              ),
            );
            throw new Error(message);
          }
          const elapsed = Date.now() - startedAt;
          const interval =
            elapsed > PROCESSING_BACKOFF_AFTER_MS
              ? PROCESSING_SLOW_POLL_INTERVAL_MS
              : PROCESSING_INITIAL_POLL_INTERVAL_MS;
          await new Promise((resolve) => window.setTimeout(resolve, interval));
          try {
            latestState = await mergeProcessingState(jobId);
          } catch (error) {
            if (error instanceof HttpError && error.status === 404) {
              setProcessedFiles((previous) =>
                previous.filter((item) => item.jobId !== jobId),
              );
              setCurrentResults((previous) =>
                previous?.jobId === jobId ? null : previous,
              );

              if (typeof window !== "undefined") {
                window.localStorage.removeItem(ACTIVE_JOB_STORAGE_KEY);
              }

              throw new Error(
                "La ejecución fue eliminada mientras se consultaba el estado.",
                {
                  cause: error,
                },
              );
            }

            throw error;
          }
        }

        const latestJob = await selectResultByJobId(jobId);
        if (
          latestJob.status === "failed" ||
          latestJob.status === "completed_with_errors"
        ) {
          const diagnostics = await getJobDiagnostics(jobId).catch(() => null);
          if (diagnostics?.summary) {
            setCurrentResults((previous) =>
              previous?.jobId === jobId
                ? { ...previous, diagnosticsSummary: diagnostics.summary }
                : previous,
            );
            setProcessedFiles((previous) =>
              previous.map((item) =>
                item.jobId === jobId
                  ? { ...item, diagnosticsSummary: diagnostics.summary }
                  : item,
              ),
            );
          }
        }
        return latestJob;
      })();

      activePollsRef.current.set(jobId, pollPromise);
      try {
        return await pollPromise;
      } finally {
        activePollsRef.current.delete(jobId);
      }
    },
    [
      mergeProcessingState,
      selectResultByJobId,
      setCurrentResults,
      setProcessedFiles,
    ],
  );

  const processFile = useCallback(
    async (file: File) => {
      const fileKey = `${file.name}:${file.size}:${file.lastModified}`;
      const existingUpload = activeUploadsRef.current.get(fileKey);
      if (existingUpload) {
        return existingUpload;
      }

      setIsProcessing(true);
      const uploadPromise = (async () => {
        const job = mapJobToProcessedFile(await uploadDocument(file));
        return upsertCurrentJob(job);
      })();

      activeUploadsRef.current.set(fileKey, uploadPromise);
      try {
        return await uploadPromise;
      } finally {
        activeUploadsRef.current.delete(fileKey);
        setIsProcessing(false);
      }
    },
    [setIsProcessing, upsertCurrentJob],
  );

  const runProcessing = useCallback(
    async (jobId?: number) => {
      const targetJobId = jobId ?? currentJobId;
      if (!targetJobId) {
        return null;
      }
      const existingRequest = activeProcessRequestsRef.current.get(targetJobId);
      if (existingRequest) {
        return existingRequest;
      }

      const targetStatus =
        currentResults?.jobId === targetJobId
          ? currentResults.status
          : processedFiles.find((item) => item.jobId === targetJobId)?.status;
      const force = targetStatus === "completed";

      setIsProcessing(true);
      const processPromise = (async () => {
        const response = force
          ? await processJob(targetJobId, { force: true })
          : await processJob(targetJobId);
        const job = mapJobToProcessedFile(response);
        const updatedJob = upsertCurrentJob(job);
        if (TERMINAL_STATUSES.has(updatedJob.status)) {
          return updatedJob;
        }
        return await pollJobUntilSettled(targetJobId);
      })();

      activeProcessRequestsRef.current.set(targetJobId, processPromise);
      try {
        return await processPromise;
      } finally {
        activeProcessRequestsRef.current.delete(targetJobId);
        setIsProcessing(false);
      }
    },
    [
      currentJobId,
      currentResults,
      pollJobUntilSettled,
      processedFiles,
      setIsProcessing,
      upsertCurrentJob,
    ],
  );

  const reprocessFailedJob = useCallback(
    async (jobId?: number) => {
      const targetJobId = jobId ?? currentJobId;
      if (!targetJobId) {
        return null;
      }

      setIsProcessing(true);
      try {
        const job = mapJobToProcessedFile(await reprocessFailed(targetJobId));
        return upsertCurrentJob(job);
      } finally {
        setIsProcessing(false);
      }
    },
    [currentJobId, setIsProcessing, upsertCurrentJob],
  );

  const refreshJob = useCallback(
    async (jobId?: number) => {
      const targetJobId = jobId ?? currentJobId;
      if (!targetJobId) {
        return null;
      }
      return selectResultByJobId(targetJobId);
    },
    [currentJobId, selectResultByJobId],
  );

  const exportCurrentJob = useCallback(
    async (jobId?: number) => {
      const targetJobId = jobId ?? currentJobId;
      if (!targetJobId) {
        return null;
      }

      setIsExporting(true);
      try {
        const job = mapJobToProcessedFile(await exportJob(targetJobId));
        return upsertCurrentJob(job);
      } finally {
        setIsExporting(false);
      }
    },
    [currentJobId, setIsExporting, upsertCurrentJob],
  );

  const saveCurrentCorrections = useCallback(
    async (rows: ConsignmentRow[], jobId?: number) => {
      const targetJobId = jobId ?? currentJobId;
      if (!targetJobId) {
        return null;
      }

      setIsSavingCorrections(true);
      try {
        // Se traduce la tabla editable al contrato PATCH esperado por backend.
        const job = mapJobToProcessedFile(
          await saveJobCorrections(targetJobId, {
            items: rows.map((row) => ({
              id: row.depositId,
              fecha_consignacion: row.fecha === "Sin fecha" ? "" : row.fecha,
              hora_consignacion: row.hora,
              referencia: row.referencia,
              valor: row.monto,
            })),
          }),
        );
        return upsertCurrentJob(job);
      } finally {
        setIsSavingCorrections(false);
      }
    },
    [currentJobId, setIsSavingCorrections, upsertCurrentJob],
  );

  const selectResult = useCallback(
    async (id: string) => {
      const jobId = Number(id);
      if (Number.isNaN(jobId)) {
        return null;
      }
      return selectResultByJobId(jobId);
    },
    [selectResultByJobId],
  );

  return useMemo(
    () => ({
      refreshHistory,
      selectResultByJobId,
      processFile,
      runProcessing,
      reprocessFailedJob,
      deleteJobResult,
      saveCurrentCorrections,
      refreshJob,
      exportCurrentJob,
      selectResult,
    }),
    [
      deleteJobResult,
      exportCurrentJob,
      processFile,
      refreshHistory,
      refreshJob,
      reprocessFailedJob,
      runProcessing,
      saveCurrentCorrections,
      selectResult,
      selectResultByJobId,
    ],
  );
}
