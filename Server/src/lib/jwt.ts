import { SignJWT, jwtVerify, type JWTPayload } from 'jose';
import { loadEnv } from '../config/env.js';
import { ACCESS_TOKEN_TTL_SEC } from './constants.js';
import { UnauthorizedError } from './errors.js';

export type TokenType = 'user' | 'staff';
export type StaffRole = 'manager' | 'admin';

export interface AccessTokenPayload extends JWTPayload {
  sub: string;
  type: TokenType;
  role?: StaffRole;
}

function getAccessSecret() {
  return new TextEncoder().encode(loadEnv().JWT_SECRET);
}

export async function signAccessToken(payload: {
  sub: string;
  type: TokenType;
  role?: StaffRole;
}): Promise<string> {
  const jwt = new SignJWT({ type: payload.type, role: payload.role })
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(payload.sub)
    .setIssuedAt()
    .setExpirationTime(`${ACCESS_TOKEN_TTL_SEC}s`);

  return jwt.sign(getAccessSecret());
}

export async function verifyAccessToken(token: string): Promise<AccessTokenPayload> {
  try {
    const { payload } = await jwtVerify(token, getAccessSecret());
    const sub = payload.sub;
    const type = payload.type;

    if (!sub || (type !== 'user' && type !== 'staff')) {
      throw new UnauthorizedError();
    }

    return {
      ...payload,
      sub,
      type,
      role: payload.role as StaffRole | undefined,
    };
  } catch (error) {
    const err = error as { code?: string };
    if (err.code === 'ERR_JWT_EXPIRED') {
      throw new UnauthorizedError('TOKEN_EXPIRED', 'Access token expired');
    }
    throw new UnauthorizedError();
  }
}
