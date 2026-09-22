const API_BASE = '/api';

interface ApiRequestOptions {
  method?: string;
  body?: unknown;
  headers?: Record<string, string>;
  /** Skip the { success, data } envelope — return parsed JSON directly. Use for Better Auth endpoints. */
  raw?: boolean;
}

export class ApiError extends Error {
  code: string;
  status: number;
  requestId?: string;

  constructor(code: string, message: string, status: number, requestId?: string) {
    super(message);
    this.code = code;
    this.status = status;
    this.requestId = requestId;
  }
}

export async function apiClient<T>(
  path: string,
  options: ApiRequestOptions = {},
): Promise<T> {
  const { method = 'GET', body, headers = {}, raw = false } = options;

  let response: Response;

  try {
    response = await fetch(`${API_BASE}${path}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
      body: body ? JSON.stringify(body) : undefined,
      credentials: 'include',
    });
  } catch (error) {
    // Network error — backend not running, DNS failure, etc.
    throw new ApiError(
      'NETWORK_ERROR',
      'No se ha podido conectar con el servidor. Comprueba que el backend está iniciado.',
      0,
    );
  }

  // Handle empty responses (502, 204, etc.)
  const text = await response.text();

  if (!text) {
    if (response.ok) {
      return undefined as T;
    }
    throw new ApiError(
      'EMPTY_RESPONSE',
      `Error del servidor (${response.status}). Comprueba que el backend está iniciado.`,
      response.status,
    );
  }

  // Try to parse JSON
  let data: any;
  try {
    data = JSON.parse(text);
  } catch {
    // Response is not JSON (HTML error page, proxy error, etc.)
    if (text.includes('502') || text.includes('Bad Gateway')) {
      throw new ApiError(
        'BAD_GATEWAY',
        'El servidor no está disponible. Comprueba que el backend está iniciado.',
        502,
      );
    }
    throw new ApiError(
      'INVALID_RESPONSE',
      'Respuesta inesperada del servidor.',
      response.status,
    );
  }

  // Raw mode: return parsed JSON directly (for Better Auth endpoints)
  if (raw) {
    if (!response.ok) {
      throw new ApiError(
        data.code || data.error?.code || 'UNKNOWN_ERROR',
        data.message || data.error?.message || 'Ha ocurrido un error',
        response.status,
      );
    }
    return data as T;
  }

  // Envelope mode: expect { success: true, data: ..., meta?: ... } wrapper
  if (!response.ok || !data.success) {
    throw new ApiError(
      data.error?.code || 'UNKNOWN_ERROR',
      data.error?.message || 'Ha ocurrido un error',
      response.status,
      data.error?.requestId,
    );
  }

  // Preserve meta for paginated responses (e.g., { success, data: [...], meta: { page, limit, total } })
  if (data.meta) {
    return { data: data.data, meta: data.meta } as T;
  }

  return data.data;
}
