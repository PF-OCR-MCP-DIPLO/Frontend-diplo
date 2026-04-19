import type { ReactNode } from "react";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { ConsignmentRow } from "../components/EditableTable";
import {
  exportJob,
  getJob,
  listJobs,
  processJob,
  type ApiJobDetail,
  type ApiJobListItem,
  type ApiSourceImage,
  uploadDocument,
} from "../lib/api";

export type ProcessingStatus =
  | "uploaded"
  | "processing"
  | "completed"
  | "completed_with_errors"
  | "failed";

export interface ProcessedFile {
  id: string;
  jobId: number;
  name: string;
  date: Date;
  status: ProcessingStatus;
  displayStatus: "success" | "error";
  sourceDocxUrl: string;
  excelUrl: string | null;
  totalImages: number;
  totalRecords: number;
  errorMessage: string;
  sourceImages: ApiSourceImage[];
  data: ConsignmentRow[];
  errorCount: number;
}

interface ProcessingContextValue {
  isProcessing: boolean;
  isExporting: boolean;
  isLoadingHistory: boolean;
  isRefreshing: boolean;
  processedFiles: ProcessedFile[];
  currentResults: ProcessedFile | null;
  processFile: (file: File) => Promise<ProcessedFile>;
  runProcessing: (jobId?: number) => Promise<ProcessedFile | null>;
  refreshJob: (jobId?: number) => Promise<ProcessedFile | null>;
  refreshHistory: () => Promise<void>;
  exportCurrentJob: (jobId?: number) => Promise<ProcessedFile | null>;
  selectResult: (id: string) => Promise<ProcessedFile | null>;
  selectResultByJobId: (jobId: number) => Promise<ProcessedFile | null>;
}

const ProcessingContext = createContext<ProcessingContextValue | null>(null);

function normalizeMonto(value: string) {
  const numeric = Number(value);
  if (Number.isNaN(numeric)) {
    return value;
  }
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 2,
  }).format(numeric);
}

function toConsignmentRows(job: ApiJobDetail): ConsignmentRow[] {
  return job.source_images
    .flatMap((image) =>
      image.deposits.map((deposit) => ({
        id: `${image.id}-${deposit.id}`,
        fecha: deposit.fecha_consignacion || "Sin fecha",
        monto: normalizeMonto(deposit.valor),
        referencia: deposit.referencia,
        banco: image.source_name,
        estado: image.ocr_status === "failed" || deposit.observations.length > 0 ? "error" : "valid",
        errors: [
          ...deposit.observations,
          ...(image.error_message ? [image.error_message] : []),
        ],
      }))
    )
    .sort((left, right) => left.id.localeCompare(right.id, undefined, { numeric: true }));
}

function toProcessedFile(job: ApiJobDetail): ProcessedFile {
  const data = toConsignmentRows(job);
  const imageErrors = job.source_images.filter((image) => image.ocr_status === "failed").length;
  const rowErrors = data.filter((row) => row.estado === "error").length;
  return {
    id: job.id.toString(),
    jobId: job.id,
    name: job.original_filename,
    date: new Date(job.created_at),
    status: job.status,
    displayStatus: job.status === "failed" || rowErrors > 0 || imageErrors > 0 ? "error" : "success",
    sourceDocxUrl: job.source_docx,
    excelUrl: job.excel_file,
    totalImages: job.total_images,
    totalRecords: job.total_records,
    errorMessage: job.error_message,
    sourceImages: job.source_images,
    data,
    errorCount: Math.max(rowErrors, imageErrors),
  };
}

function mergeJob(previous: ProcessedFile[], next: ProcessedFile) {
  return [next, ...previous.filter((item) => item.jobId !== next.jobId)].sort(
    (left, right) => right.date.getTime() - left.date.getTime()
  );
}

function toPlaceholderJob(job: ApiJobListItem): ProcessedFile {
  return {
    id: job.id.toString(),
    jobId: job.id,
    name: job.original_filename,
    date: new Date(job.created_at),
    status: job.status,
    displayStatus: job.status === "failed" ? "error" : "success",
    sourceDocxUrl: "",
    excelUrl: null,
    totalImages: job.total_images,
    totalRecords: job.total_records,
    errorMessage: "",
    sourceImages: [],
    data: [],
    errorCount: job.status === "failed" ? 1 : 0,
  };
}

export function ProcessingProvider({ children }: { children: ReactNode }) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [processedFiles, setProcessedFiles] = useState<ProcessedFile[]>([]);
  const [currentResults, setCurrentResults] = useState<ProcessedFile | null>(null);

  const refreshHistory = useCallback(async () => {
    setIsLoadingHistory(true);
    try {
      const jobs = await listJobs();
      setProcessedFiles((previous) => {
        const preserved = new Map(previous.map((item) => [item.jobId, item]));
        return jobs.map((job) => preserved.get(job.id) ?? toPlaceholderJob(job));
      });
    } finally {
      setIsLoadingHistory(false);
    }
  }, []);

  useEffect(() => {
    refreshHistory().catch(() => {
      setIsLoadingHistory(false);
    });
  }, [refreshHistory]);

  const selectResultByJobId = useCallback(async (jobId: number) => {
    setIsRefreshing(true);
    try {
      const job = toProcessedFile(await getJob(jobId));
      setProcessedFiles((previous) => mergeJob(previous, job));
      setCurrentResults(job);
      return job;
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  const processFile = useCallback(async (file: File) => {
    setIsProcessing(true);
    try {
      const job = toProcessedFile(await uploadDocument(file));
      setProcessedFiles((previous) => mergeJob(previous, job));
      setCurrentResults(job);
      return job;
    } finally {
      setIsProcessing(false);
    }
  }, []);

  const runProcessing = useCallback(
    async (jobId?: number) => {
      const targetJobId = jobId ?? currentResults?.jobId;
      if (!targetJobId) {
        return null;
      }
      setIsProcessing(true);
      try {
        const job = toProcessedFile(await processJob(targetJobId));
        setProcessedFiles((previous) => mergeJob(previous, job));
        setCurrentResults(job);
        return job;
      } finally {
        setIsProcessing(false);
      }
    },
    [currentResults?.jobId]
  );

  const refreshJob = useCallback(
    async (jobId?: number) => {
      const targetJobId = jobId ?? currentResults?.jobId;
      if (!targetJobId) {
        return null;
      }
      return selectResultByJobId(targetJobId);
    },
    [currentResults?.jobId, selectResultByJobId]
  );

  const exportCurrentJob = useCallback(
    async (jobId?: number) => {
      const targetJobId = jobId ?? currentResults?.jobId;
      if (!targetJobId) {
        return null;
      }
      setIsExporting(true);
      try {
        const job = toProcessedFile(await exportJob(targetJobId));
        setProcessedFiles((previous) => mergeJob(previous, job));
        setCurrentResults(job);
        return job;
      } finally {
        setIsExporting(false);
      }
    },
    [currentResults?.jobId]
  );

  const selectResult = useCallback(
    async (id: string) => {
      const jobId = Number(id);
      if (Number.isNaN(jobId)) {
        return null;
      }
      return selectResultByJobId(jobId);
    },
    [selectResultByJobId]
  );

  const value = useMemo(
    () => ({
      isProcessing,
      isExporting,
      isLoadingHistory,
      isRefreshing,
      processedFiles,
      currentResults,
      processFile,
      runProcessing,
      refreshJob,
      refreshHistory,
      exportCurrentJob,
      selectResult,
      selectResultByJobId,
    }),
    [
      isProcessing,
      isExporting,
      isLoadingHistory,
      isRefreshing,
      processedFiles,
      currentResults,
      processFile,
      runProcessing,
      refreshJob,
      refreshHistory,
      exportCurrentJob,
      selectResult,
      selectResultByJobId,
    ]
  );

  return <ProcessingContext.Provider value={value}>{children}</ProcessingContext.Provider>;
}

export function useProcessing() {
  const context = useContext(ProcessingContext);
  if (!context) {
    throw new Error("useProcessing debe usarse dentro de ProcessingProvider.");
  }
  return context;
}
