import { AsyncLocalStorage } from 'node:async_hooks';

export interface RequestContext {
  requestId: string;
  correlationId: string;
}

export const requestContext = new AsyncLocalStorage<RequestContext>();

export function getRequestContext(): RequestContext | undefined {
  return requestContext.getStore();
}

export function getRequestId(): string {
  return getRequestContext()?.requestId ?? 'unknown';
}

export function getCorrelationId(): string {
  return getRequestContext()?.correlationId ?? getRequestId();
}
