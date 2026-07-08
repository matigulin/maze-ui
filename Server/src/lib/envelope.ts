export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
}

export interface SuccessEnvelope<T> {
  data: T;
  requestId: string;
  meta?: PaginationMeta;
}

export function success<T>(
  data: T,
  requestId: string,
  meta?: PaginationMeta,
): SuccessEnvelope<T> {
  if (meta) {
    return { data, requestId, meta };
  }
  return { data, requestId };
}
