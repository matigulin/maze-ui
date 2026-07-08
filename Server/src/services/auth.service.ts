import { ACCESS_TOKEN_TTL_SEC } from '../lib/constants.js';
import { UnauthorizedError } from '../lib/errors.js';
import { consumeRateLimit } from '../lib/rate-limit.js';
import { signAccessToken } from '../lib/jwt.js';
import { rotateRefreshSession, getRefreshSession } from './token.service.js';

const RATE_WINDOW_SEC = 15 * 60;

export async function refreshUserSession(refreshJti: string) {
  const session = await getRefreshSession(refreshJti);
  if (!session || session.type !== 'user') {
    throw new UnauthorizedError('UNAUTHORIZED', 'Invalid refresh token');
  }

  await consumeRateLimit(`rate:refresh:user:${session.sub}`, 30, RATE_WINDOW_SEC);

  const { jti, session: rotated } = await rotateRefreshSession(refreshJti);

  const accessToken = await signAccessToken({ sub: rotated.sub, type: 'user' });

  return {
    accessToken,
    expiresIn: ACCESS_TOKEN_TTL_SEC,
    refreshJti: jti,
  };
}

export async function refreshStaffSession(refreshJti: string) {
  const { jti, session } = await rotateRefreshSession(refreshJti);

  if (session.type !== 'staff' || !session.role) {
    throw new UnauthorizedError('UNAUTHORIZED', 'Invalid refresh token');
  }

  const accessToken = await signAccessToken({
    sub: session.sub,
    type: 'staff',
    role: session.role,
  });

  return {
    accessToken,
    expiresIn: ACCESS_TOKEN_TTL_SEC,
    refreshJti: jti,
    staff: {
      id: session.sub,
      role: session.role,
    },
  };
}
