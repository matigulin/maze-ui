import { describe, expect, it, beforeAll } from 'vitest';
import { resetEnvCache } from '../config/env.js';
import { normalizePhone } from './phone.js';
import { verifySecret, hashSecret } from './password.js';
import { signAccessToken, verifyAccessToken } from './jwt.js';

beforeAll(() => {
  process.env.NODE_ENV = 'test';
  process.env.DATABASE_URL = process.env.DATABASE_URL ?? 'postgres://maze:maze@localhost:5432/maze';
  process.env.REDIS_URL = process.env.REDIS_URL ?? 'redis://localhost:6379';
  process.env.JWT_SECRET = 'test-jwt-secret-with-32-characters!!';
  process.env.JWT_REFRESH_SECRET = 'test-refresh-secret-32-characters!!';
  process.env.CORS_ORIGIN = 'http://localhost:3000';
  resetEnvCache();
});

describe('normalizePhone', () => {
  it('normalizes russian mobile numbers', () => {
    expect(normalizePhone('+79161234567')).toBe('+79161234567');
    expect(normalizePhone('89161234567')).toBe('+79161234567');
    expect(normalizePhone('9161234567')).toBe('+79161234567');
  });

  it('rejects landline and impossible ranges', () => {
    expect(() => normalizePhone('+74951234567')).toThrow();
    expect(() => normalizePhone('+71111111111')).toThrow();
    expect(() => normalizePhone('+71234567890')).toThrow();
  });

  it('rejects obviously fake mobiles', () => {
    expect(() => normalizePhone('+79111111111')).toThrow();
    expect(() => normalizePhone('+79876543210')).toThrow();
    expect(() => normalizePhone('999')).toThrow();
  });
});

describe('password hashing', () => {
  it('verifies bcrypt hash', async () => {
    const hash = await hashSecret('123456');
    await expect(verifySecret('123456', hash)).resolves.toBe(true);
    await expect(verifySecret('000000', hash)).resolves.toBe(false);
  });
});

describe('jwt', () => {
  it('issues and verifies user access token', async () => {
    const token = await signAccessToken({ sub: 'user-1', type: 'user' });
    const payload = await verifyAccessToken(token);
    expect(payload.sub).toBe('user-1');
    expect(payload.type).toBe('user');
  });
});
