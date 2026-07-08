import { getRedis } from '../config/redis.js';
import { RateLimitError } from './errors.js';

export async function consumeRateLimit(
  key: string,
  limit: number,
  windowSeconds: number,
): Promise<void> {
  const redis = getRedis();
  const count = await redis.incr(key);

  if (count === 1) {
    await redis.expire(key, windowSeconds);
  }

  if (count > limit) {
    const ttl = await redis.ttl(key);
    const retryAfter = ttl > 0 ? ttl : windowSeconds;
    const error = new RateLimitError('Too many requests');
    (error as RateLimitError & { retryAfter: number }).retryAfter = retryAfter;
    throw error;
  }
}

export async function isRateLimitExceeded(
  key: string,
  limit: number,
  windowSeconds: number,
): Promise<boolean> {
  const redis = getRedis();
  const current = await redis.get(key);
  if (current && Number(current) >= limit) {
    return true;
  }

  try {
    await consumeRateLimit(key, limit, windowSeconds);
    return false;
  } catch (error) {
    if (error instanceof RateLimitError) {
      return true;
    }
    throw error;
  }
}
