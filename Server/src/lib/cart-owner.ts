import { randomUUID } from 'node:crypto';
import type { FastifyRequest } from 'fastify';
import { COOKIE_NAMES } from './constants.js';
import { ForbiddenError } from './errors.js';
import { verifyAccessToken } from './jwt.js';

export interface CartOwner {
  type: 'user' | 'guest';
  id: string;
  newGuestSession?: string;
}

export function ownerKey(owner: CartOwner): string {
  return `${owner.type}:${owner.id}`;
}

export function assertOwnerAccess(payloadOwnerKey: string | undefined, owner: CartOwner): void {
  if (!payloadOwnerKey || payloadOwnerKey !== ownerKey(owner)) {
    throw new ForbiddenError();
  }
}

export async function resolveCartOwner(request: FastifyRequest): Promise<CartOwner> {
  const authHeader = request.headers.authorization;
  if (authHeader?.startsWith('Bearer ')) {
    try {
      const payload = await verifyAccessToken(authHeader.slice(7));
      if (payload.type === 'user') {
        return { type: 'user', id: payload.sub };
      }
    } catch {
      // Optional Bearer — fall back to guest session.
    }
  }

  const existing = request.cookies[COOKIE_NAMES.GUEST];
  if (existing) {
    return { type: 'guest', id: existing };
  }

  const sessionId = randomUUID();
  return { type: 'guest', id: sessionId, newGuestSession: sessionId };
}
