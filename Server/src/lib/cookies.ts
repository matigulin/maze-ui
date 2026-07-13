import type { CookieSerializeOptions } from '@fastify/cookie';
import { loadEnv } from '../config/env.js';
import { CART_TTL_SEC, COOKIE_NAMES, REFRESH_TOKEN_TTL_SEC } from './constants.js';

function baseCookieOptions(): CookieSerializeOptions {
  const env = loadEnv();
  const secure = env.NODE_ENV === 'production';

  return {
    httpOnly: true,
    secure,
    sameSite: 'strict',
    maxAge: REFRESH_TOKEN_TTL_SEC,
    ...(env.COOKIE_DOMAIN ? { domain: env.COOKIE_DOMAIN } : {}),
  };
}

export function userRefreshCookieOptions(): CookieSerializeOptions {
  return {
    ...baseCookieOptions(),
    path: '/api/v1/auth',
  };
}

export function staffRefreshCookieOptions(): CookieSerializeOptions {
  return {
    ...baseCookieOptions(),
    path: '/api/v1/auth/staff',
  };
}

export function guestCookieOptions(): CookieSerializeOptions {
  const env = loadEnv();
  const secure = env.NODE_ENV === 'production';

  return {
    httpOnly: true,
    secure,
    sameSite: 'lax',
    path: '/',
    maxAge: CART_TTL_SEC,
    ...(env.COOKIE_DOMAIN ? { domain: env.COOKIE_DOMAIN } : {}),
  };
}

export function clearUserRefreshCookieOptions(): CookieSerializeOptions {
  return {
    ...userRefreshCookieOptions(),
    maxAge: 0,
  };
}

export function clearStaffRefreshCookieOptions(): CookieSerializeOptions {
  return {
    ...staffRefreshCookieOptions(),
    maxAge: 0,
  };
}

export { COOKIE_NAMES };
