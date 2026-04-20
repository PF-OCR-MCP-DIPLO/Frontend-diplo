export class HttpError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = 'HttpError';
    this.status = status;
  }
}

const rawApiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000/api';
const apiBaseUrl = rawApiBaseUrl.replace(/\/$/, '');
const backendBaseUrl = apiBaseUrl.replace(/\/api$/, '');

export function resolveAssetUrl(path: string) {
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }
  if (path.startsWith('/')) {
    return `${backendBaseUrl}${path}`;
  }
  return `${apiBaseUrl}/${path.replace(/^\//, '')}`;
}

function buildApiUrl(path: string) {
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }
  return `${apiBaseUrl}/${path.replace(/^\//, '')}`;
}

async function extractErrorMessage(response: Response) {
  let message = `Error ${response.status}`;

  try {
    const payload = await response.json();
    if (typeof payload.detail === 'string') {
      return payload.detail;
    }
    if (typeof payload.error_message === 'string' && payload.error_message) {
      return payload.error_message;
    }
    if (payload && typeof payload === 'object') {
      const firstFieldValue = Object.values(payload)[0];
      if (typeof firstFieldValue === 'string') {
        return firstFieldValue;
      }
      if (Array.isArray(firstFieldValue) && typeof firstFieldValue[0] === 'string') {
        return firstFieldValue[0];
      }
    }
  } catch {
    const text = await response.text();
    if (text) {
      message = text;
    }
  }

  return message;
}

export async function httpRequest<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(buildApiUrl(path), init);
  if (!response.ok) {
    throw new HttpError(response.status, await extractErrorMessage(response));
  }

  if (response.status === 204) {
    return undefined as T;
  }

  const contentType = response.headers.get('content-type') ?? '';
  if (!contentType.includes('application/json')) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

export function getBackendBaseUrl() {
  return backendBaseUrl;
}
