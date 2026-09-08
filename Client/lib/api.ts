function getApiBaseUrl(): string {
  if (typeof window !== "undefined") {
    return process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000/api/v1";
  }
  // SSR на Render: через свой /api proxy (не будить отдельный хост API при cold start)
  const site = process.env.RENDER_EXTERNAL_URL;
  if (site) return `${site.replace(/\/$/, "")}/api/v1`;
  const internal = process.env.API_INTERNAL_URL;
  if (internal) return `${internal.replace(/\/$/, "")}/api/v1`;
  const pub = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000/api/v1";
  if (pub.startsWith("http")) return pub;
  return `http://localhost:4000${pub.startsWith("/") ? pub : `/${pub}`}`;
}

const API_FETCH_TIMEOUT_MS =
  typeof window === "undefined" ? 45_000 : 8_000;

export type PaginationMeta = {
  page: number;
  limit: number;
  total: number;
};

type ApiEnvelope<T> = {
  data: T;
  requestId?: string;
  meta?: PaginationMeta;
};

export class ApiError extends Error {
  status: number;
  code?: string;
  requestId?: string;

  constructor(opts: {
    message: string;
    status: number;
    code?: string;
    requestId?: string;
  }) {
    super(opts.message);
    this.status = opts.status;
    this.code = opts.code;
    this.requestId = opts.requestId;
  }
}

/** true для ECONNREFUSED / offline / DNS — удобно для SSR-фолбэка. */
export function isNetworkApiError(err: unknown): boolean {
  return err instanceof ApiError && (err.status === 0 || err.code === "NETWORK_ERROR");
}

async function apiFetch(
  input: string,
  init?: RequestInit,
): Promise<Response> {
  try {
    return await fetch(input, {
      ...init,
      signal: init?.signal ?? AbortSignal.timeout(API_FETCH_TIMEOUT_MS),
    });
  } catch {
    throw new ApiError({
      message: "Сервер API недоступен",
      status: 0,
      code: "NETWORK_ERROR",
    });
  }
}

function buildUrl(endpoint: string, query?: Record<string, unknown>) {
  const base = getApiBaseUrl().replace(/\/$/, "");
  const clean = endpoint.startsWith("/") ? endpoint.slice(1) : endpoint;
  const path = `${base}/${clean}`;

  if (base.startsWith("/")) {
    if (!query) return path;
    const params = new URLSearchParams();
    for (const [k, v] of Object.entries(query)) {
      if (v === undefined || v === null || v === "") continue;
      params.set(k, String(v));
    }
    const qs = params.toString();
    return qs ? `${path}?${qs}` : path;
  }

  const url = new URL(base);
  url.pathname = `${url.pathname.replace(/\/$/, "")}/${clean}`;
  if (query) {
    for (const [k, v] of Object.entries(query)) {
      if (v === undefined || v === null || v === "") continue;
      url.searchParams.set(k, String(v));
    }
  }
  return url.toString();
}

function authHeaders(accessToken?: string | null): HeadersInit {
  return accessToken ? { Authorization: `Bearer ${accessToken}` } : {};
}

async function parseEnvelope<T>(
  res: Response,
): Promise<{ data: T; meta?: PaginationMeta }> {
  const json = await res.json().catch(() => null);

  if (!res.ok) {
    const message =
      json?.error?.message ??
      `Request failed: ${res.status} ${res.statusText}`;
    throw new ApiError({
      message,
      status: res.status,
      code: json?.error?.code,
      requestId: json?.requestId ?? json?.error?.requestId,
    });
  }

  const envelope = json as ApiEnvelope<T> | null;
  const data = envelope && "data" in envelope ? envelope.data : undefined;
  if (data === undefined || data === null) {
    throw new ApiError({
      message: "Invalid API response: missing data",
      status: res.status,
      requestId: envelope?.requestId,
    });
  }

  return {
    data: data as T,
    meta: envelope?.meta,
  };
}

export async function apiGet<T>(
  endpoint: string,
  query?: Record<string, unknown>,
  opts?: { credentials?: RequestCredentials; accessToken?: string | null },
): Promise<T> {
  const url = buildUrl(endpoint, query);
  const res = await apiFetch(url, {
    method: "GET",
    credentials: opts?.credentials,
    headers: {
      ...authHeaders(opts?.accessToken),
    },
  });
  const parsed = await parseEnvelope<T>(res);
  return parsed.data;
}

export async function apiGetWithMeta<T>(
  endpoint: string,
  query?: Record<string, unknown>,
  opts?: { credentials?: RequestCredentials; accessToken?: string | null },
): Promise<{ data: T; meta?: PaginationMeta }> {
  const url = buildUrl(endpoint, query);
  const res = await apiFetch(url, {
    method: "GET",
    credentials: opts?.credentials,
    headers: {
      ...authHeaders(opts?.accessToken),
    },
  });
  return parseEnvelope<T>(res);
}

async function apiMutate<T>(
  method: "POST" | "PUT" | "PATCH" | "DELETE",
  endpoint: string,
  body?: unknown,
  opts?: { accessToken?: string | null },
): Promise<T> {
  const url = buildUrl(endpoint);
  const hasBody = body !== undefined;
  const res = await apiFetch(url, {
    method,
    headers: {
      ...(hasBody ? { "Content-Type": "application/json" } : {}),
      "X-Requested-With": "maze-web",
      ...authHeaders(opts?.accessToken),
    },
    credentials: "include",
    body: hasBody ? JSON.stringify(body) : undefined,
  });
  const parsed = await parseEnvelope<T>(res);
  return parsed.data;
}

export async function apiPutJson<T>(
  endpoint: string,
  body: unknown,
  opts?: { accessToken?: string | null },
): Promise<T> {
  return apiMutate<T>("PUT", endpoint, body, opts);
}

export async function apiPatchJson<T>(
  endpoint: string,
  body: unknown,
  opts?: { accessToken?: string | null },
): Promise<T> {
  return apiMutate<T>("PATCH", endpoint, body, opts);
}

export async function apiDelete<T>(
  endpoint: string,
  opts?: { accessToken?: string | null },
): Promise<T> {
  return apiMutate<T>("DELETE", endpoint, undefined, opts);
}

export async function apiPostJson<T>(
  endpoint: string,
  body?: unknown,
  opts?: {
    csrfHeader?: { name: string; value: string };
    accessToken?: string | null;
    headers?: Record<string, string>;
  },
): Promise<T> {
  const url = buildUrl(endpoint);
  const hasBody = body !== undefined;
  const res = await apiFetch(url, {
    method: "POST",
    headers: {
      ...(hasBody ? { "Content-Type": "application/json" } : {}),
      "X-Requested-With": "maze-web",
      ...authHeaders(opts?.accessToken),
      ...(opts?.csrfHeader
        ? { [opts.csrfHeader.name]: opts.csrfHeader.value }
        : null),
      ...opts?.headers,
    },
    credentials: "include",
    body: hasBody ? JSON.stringify(body) : undefined,
  });
  const parsed = await parseEnvelope<T>(res);
  return parsed.data;
}

export async function apiUpload<T>(
  endpoint: string,
  file: File,
  opts?: { accessToken?: string | null; fieldName?: string },
): Promise<T> {
  const url = buildUrl(endpoint);
  const form = new FormData();
  form.append(opts?.fieldName ?? "file", file);

  const res = await apiFetch(url, {
    method: "POST",
    headers: {
      "X-Requested-With": "maze-web",
      ...authHeaders(opts?.accessToken),
    },
    credentials: "include",
    body: form,
  });
  const parsed = await parseEnvelope<T>(res);
  return parsed.data;
}
