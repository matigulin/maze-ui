const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000/api/v1";

type ApiEnvelope<T> = {
  data: T;
  requestId?: string;
  meta?: unknown;
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

function buildUrl(endpoint: string, query?: Record<string, unknown>) {
  const url = new URL(API_BASE_URL);
  const clean = endpoint.startsWith("/") ? endpoint.slice(1) : endpoint;
  url.pathname = `${url.pathname.replace(/\/$/, "")}/${clean}`;
  if (query) {
    for (const [k, v] of Object.entries(query)) {
      if (v === undefined || v === null || v === "") continue;
      url.searchParams.set(k, String(v));
    }
  }
  return url.toString();
}

export async function apiGet<T>(
  endpoint: string,
  query?: Record<string, unknown>,
  opts?: { credentials?: RequestCredentials },
): Promise<T> {
  const url = buildUrl(endpoint, query);
  const res = await fetch(url, {
    method: "GET",
    credentials: opts?.credentials,
  });
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

  const envelope = json as ApiEnvelope<T>;
  return (envelope?.data ?? json) as T;
}

async function apiMutate<T>(
  method: "POST" | "PUT" | "DELETE",
  endpoint: string,
  body?: unknown,
): Promise<T> {
  const url = buildUrl(endpoint);
  const res = await fetch(url, {
    method,
    headers: {
      "Content-Type": "application/json",
      "X-Requested-With": "maze-web",
    },
    credentials: "include",
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

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

  const envelope = json as ApiEnvelope<T>;
  return (envelope?.data ?? json) as T;
}

export async function apiPutJson<T>(endpoint: string, body: unknown): Promise<T> {
  return apiMutate<T>("PUT", endpoint, body);
}

export async function apiDelete<T>(endpoint: string): Promise<T> {
  return apiMutate<T>("DELETE", endpoint);
}

export async function apiPostJson<T>(
  endpoint: string,
  body: unknown,
  opts?: { csrfHeader?: { name: string; value: string } },
): Promise<T> {
  const url = buildUrl(endpoint);
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Requested-With": "maze-web",
      ...(opts?.csrfHeader
        ? { [opts.csrfHeader.name]: opts.csrfHeader.value }
        : null),
    },
    credentials: "include",
    body: JSON.stringify(body),
  });

  const json = await res.json().catch(() => null);
  if (!res.ok) {
    const message =
      json?.error?.message ??
      `Request failed: ${res.status} ${res.statusText}`;
    throw new ApiError({
      message,
      status: res.status,
      code: json?.error?.code,
      requestId: json?.requestId,
    });
  }

  const envelope = json as ApiEnvelope<T>;
  return (envelope?.data ?? json) as T;
}

