import { createHash } from 'node:crypto';
import { getRedis } from '../config/redis.js';
import { ConflictError } from './errors.js';

const IDEMPOTENCY_TTL_SEC = 24 * 60 * 60;

export interface StoredIdempotency<T> {
  bodyHash: string;
  response: T;
}

function idempotencyKey(key: string) {
  return `idempotency:order:${key}`;
}

export function hashCheckoutBody(body: unknown): string {
  return createHash('sha256').update(JSON.stringify(body)).digest('hex');
}

export async function getIdempotentResponse<T>(key: string): Promise<StoredIdempotency<T> | null> {
  const raw = await getRedis().get(idempotencyKey(key));
  if (!raw) return null;
  return JSON.parse(raw) as StoredIdempotency<T>;
}

export async function saveIdempotentResponse<T>(
  key: string,
  bodyHash: string,
  response: T,
): Promise<void> {
  await getRedis().set(
    idempotencyKey(key),
    JSON.stringify({ bodyHash, response }),
    'EX',
    IDEMPOTENCY_TTL_SEC,
  );
}

export function assertIdempotencyBodyMatch(
  storedHash: string,
  bodyHash: string,
): void {
  if (storedHash !== bodyHash) {
    throw new ConflictError(
      'IDEMPOTENCY_CONFLICT',
      'Idempotency key was already used with a different payload',
    );
  }
}
