/**
 * Cliente HTTP compartido para la API Django.
 *
 * Centraliza la resolución de URLs, la inyección opcional de `X-API-Key` y la
 * normalización de errores para que los feature clients no repitan lógica.
 *
 * @remarks
 * El cliente intenta extraer mensajes útiles de distintos formatos de error
 * porque el backend mantiene compatibilidad con varios sobres de respuesta.
 */
export class HttpError extends Error {
  status: number;
  code?: string;
  details?: unknown;

  constructor(status: number, message: string, extras?: { code?: string; details?: unknown }) {
    super(message);
    this.name = 'HttpError';
    this.status = status;
    this.code = extras?.code;
    this.details = extras?.details;
  }
}

const rawApiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000/api';
const apiKey = import.meta.env.VITE_API_KEY ?? '';
const apiBaseUrl = rawApiBaseUrl.replace(/\/$/, '');
const backendBaseUrl = apiBaseUrl.replace(/\/api$/, '');

/**
 * Resuelve una ruta de media o asset del backend a una URL navegable desde el frontend.
 *
 * @param path - Ruta absoluta o relativa devuelta por Django.
 * @returns URL completa o cadena vacía cuando no hay valor útil.
 */
export function resolveAssetUrl(path?: string | null) {
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

/**
 * Extrae el mensaje más accionable posible desde una respuesta fallida.
 *
 * @param response - Respuesta HTTP no satisfactoria.
 * @returns Mensaje legible para la interfaz.
 */
async function extractErrorMessage(response: Response) {
  let message = `Error ${response.status}`;

  try {
    const payload = await response.clone().json();
    if (payload && typeof payload === 'object' && payload.error && typeof payload.error === 'object') {
      const apiError = payload.error as { message?: unknown; code?: unknown; details?: unknown };
      if (typeof apiError.message === 'string' && apiError.message.trim()) {
        return apiError.message;
      }

      // If we have validation details, show the first field error (most actionable).
      if (apiError.details && typeof apiError.details === 'object' && !Array.isArray(apiError.details)) {
        const detailsObj = apiError.details as Record<string, unknown>;
        const firstEntry = Object.entries(detailsObj)[0];
        if (firstEntry) {
          const [, value] = firstEntry;
          if (typeof value === 'string') return value;
          if (Array.isArray(value) && typeof value[0] === 'string') return value[0];
        }
      }
    }
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
    const text = await response.clone().text();
    if (text) {
      message = text;
    }
  }

  return message;
}

/**
 * Ejecuta una petición HTTP contra la API Django.
 *
 * @param path - Ruta relativa o absoluta de la API.
 * @param init - Opciones estándar de `fetch`.
 * @returns Datos tipados cuando la respuesta es JSON o `undefined` en 204.
 *
 * @remarks
 * El helper inyecta `X-API-Key` cuando existe en el entorno y convierte los
 * fallos no exitosos en `HttpError`.
 */
export async function httpRequest<T>(path: string, init?: RequestInit): Promise<T> {
  const headers = new Headers(init?.headers);
  if (apiKey) {
    headers.set('X-API-Key', apiKey);
  }

  const response = await fetch(buildApiUrl(path), { ...init, headers });
  if (!response.ok) {
    // We attempt to parse the standard API error envelope, but remain backwards compatible.
    let code: string | undefined;
    let details: unknown;
    try {
      const payload = await response.clone().json();
      if (payload && typeof payload === 'object' && payload.error && typeof payload.error === 'object') {
        const apiError = payload.error as { code?: unknown; details?: unknown };
        if (typeof apiError.code === 'string') code = apiError.code;
        details = apiError.details;
      }
    } catch {
      // ignore
    }
    throw new HttpError(response.status, await extractErrorMessage(response), { code, details });
  }

  if (response.status === 204) {
    return undefined as T;
  }

  const contentType = response.headers.get('content-type') ?? '';
  if (!contentType.includes('application/json')) {
    return undefined as T;
  }

  try {
    return await response.json() as T;
  } catch (error) {
    throw new HttpError(response.status, 'Respuesta invalida del servidor', {
      code: 'invalid_json',
      details: error instanceof Error ? error.message : undefined,
    });
  }
}

export function getBackendBaseUrl() {
  return backendBaseUrl;
}
