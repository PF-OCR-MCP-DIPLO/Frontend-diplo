export interface ApiExtractedDeposit {
  id: number;
  sequence_index: number;
  fecha_consignacion: string;
  hora_consignacion: string;
  referencia: string;
  valor: string;
  is_current_month: boolean | null;
  observations: string[];
  structured_payload: Record<string, unknown>;
  created_at: string;
}

export interface ApiSourceImage {
  id: number;
  sequence_index: number;
  source_name: string;
  content_hash: string;
  ocr_status: "pending" | "processed" | "failed";
  ocr_provider: string;
  ocr_raw_text: string;
  error_message: string;
  image_file: string;
  deposits: ApiExtractedDeposit[];
  created_at: string;
  updated_at: string;
}

export interface ApiJobListItem {
  id: number;
  original_filename: string;
  status: "uploaded" | "processing" | "completed" | "failed";
  total_images: number;
  total_records: number;
  started_at: string | null;
  finished_at: string | null;
  created_at: string;
}

export interface ApiJobDetail extends ApiJobListItem {
  source_docx: string;
  excel_file: string | null;
  error_message: string;
  provider_config_snapshot: Record<string, unknown>;
  updated_at: string;
  source_images: ApiSourceImage[];
}

const rawApiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000/api";
const apiBaseUrl = rawApiBaseUrl.replace(/\/$/, "");
const backendBaseUrl = apiBaseUrl.replace(/\/api$/, "");

function buildUrl(path: string) {
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }
  if (path.startsWith("/")) {
    return `${backendBaseUrl}${path}`;
  }
  return `${apiBaseUrl}/${path.replace(/^\//, "")}`;
}

function normalizeJobDetail(job: ApiJobDetail): ApiJobDetail {
  return {
    ...job,
    source_docx: job.source_docx ? buildUrl(job.source_docx) : "",
    excel_file: job.excel_file ? buildUrl(job.excel_file) : null,
    source_images: job.source_images.map((image) => ({
      ...image,
      image_file: image.image_file ? buildUrl(image.image_file) : "",
    })),
  };
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(buildUrl(path), init);
  if (!response.ok) {
    let message = `Error ${response.status}`;
    try {
      const payload = await response.json();
      if (typeof payload.detail === "string") {
        message = payload.detail;
      } else if (typeof payload.file?.[0] === "string") {
        message = payload.file[0];
      } else if (typeof payload.error_message === "string" && payload.error_message) {
        message = payload.error_message;
      }
    } catch {
      const text = await response.text();
      if (text) {
        message = text;
      }
    }
    throw new Error(message);
  }
  return response.json() as Promise<T>;
}

export function uploadDocument(file: File) {
  const formData = new FormData();
  formData.append("file", file);
  return request<ApiJobDetail>("documents/upload/", {
    method: "POST",
    body: formData,
  }).then(normalizeJobDetail);
}

export function processJob(jobId: number) {
  return request<ApiJobDetail>(`jobs/${jobId}/process/`, {
    method: "POST",
  }).then(normalizeJobDetail);
}

export function getJob(jobId: number) {
  return request<ApiJobDetail>(`jobs/${jobId}/`).then(normalizeJobDetail);
}

export function listJobs() {
  return request<ApiJobListItem[]>("jobs/");
}

export function exportJob(jobId: number) {
  return request<ApiJobDetail>(`jobs/${jobId}/export/`, {
    method: "POST",
  }).then(normalizeJobDetail);
}

export function getBackendBaseUrl() {
  return backendBaseUrl;
}
