import { randomUUID } from 'node:crypto';
import { getRedis } from '../config/redis.js';
import { REFRESH_TOKEN_TTL_SEC } from '../lib/constants.js';
import { UnauthorizedError } from '../lib/errors.js';
import type { StaffRole } from '../lib/jwt.js';

export interface RefreshSession {
  sub: string;
  type: 'user' | 'staff';
  role?: StaffRole;
  familyId: string;
}

function refreshKey(jti: string) {
  return `refresh:${jti}`;
}

function usedKey(jti: string) {
  return `refresh:used:${jti}`;
}

function familyRevokedKey(familyId: string) {
  return `refresh:family:${familyId}:revoked`;
}

async function revokeFamily(familyId: string): Promise<void> {
  const redis = getRedis();
  await redis.set(familyRevokedKey(familyId), '1', 'EX', REFRESH_TOKEN_TTL_SEC);
}

export async function createRefreshSession(session: Omit<RefreshSession, 'familyId'>): Promise<string> {
  const redis = getRedis();
  const jti = randomUUID();
  const familyId = randomUUID();
  const payload: RefreshSession = { ...session, familyId };

  await redis.set(refreshKey(jti), JSON.stringify(payload), 'EX', REFRESH_TOKEN_TTL_SEC);
  return jti;
}

export async function rotateRefreshSession(oldJti: string): Promise<{ jti: string; session: RefreshSession }> {
  const redis = getRedis();
  const raw = await redis.get(refreshKey(oldJti));

  if (!raw) {
    const reusedFamilyId = await redis.get(usedKey(oldJti));
    if (reusedFamilyId) {
      await revokeFamily(reusedFamilyId);
    }
    throw new UnauthorizedError('UNAUTHORIZED', 'Invalid refresh token');
  }

  const session = JSON.parse(raw) as RefreshSession;

  if (await redis.get(familyRevokedKey(session.familyId))) {
    throw new UnauthorizedError('UNAUTHORIZED', 'Refresh session revoked');
  }

  await redis.del(refreshKey(oldJti));
  await redis.set(usedKey(oldJti), session.familyId, 'EX', REFRESH_TOKEN_TTL_SEC);

  const newJti = randomUUID();
  await redis.set(refreshKey(newJti), JSON.stringify(session), 'EX', REFRESH_TOKEN_TTL_SEC);

  return { jti: newJti, session };
}

export async function revokeRefreshSession(jti: string): Promise<void> {
  const redis = getRedis();
  const raw = await redis.get(refreshKey(jti));
  if (!raw) return;

  const session = JSON.parse(raw) as RefreshSession;
  await redis.del(refreshKey(jti));
  await revokeFamily(session.familyId);
}

export async function getRefreshSession(jti: string): Promise<RefreshSession | null> {
  const redis = getRedis();
  const raw = await redis.get(refreshKey(jti));
  if (!raw) return null;
  return JSON.parse(raw) as RefreshSession;
}
