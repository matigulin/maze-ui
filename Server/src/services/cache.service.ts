import { getRedis } from '../config/redis.js';

export class CacheService {
  async get<T>(key: string): Promise<T | null> {
    const raw = await getRedis().get(key);
    if (!raw) return null;
    return JSON.parse(raw) as T;
  }

  async set(key: string, value: unknown, ttlSeconds: number): Promise<void> {
    await getRedis().set(key, JSON.stringify(value), 'EX', ttlSeconds);
  }

  async getOrSet<T>(key: string, ttlSeconds: number, factory: () => Promise<T>): Promise<T> {
    const cached = await this.get<T>(key);
    if (cached !== null) return cached;

    const value = await factory();
    await this.set(key, value, ttlSeconds);
    return value;
  }
}

export const cache = new CacheService();
