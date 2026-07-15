import cors from '@fastify/cors';
import type { FastifyCorsOptions } from '@fastify/cors';
import helmet from '@fastify/helmet';
import rateLimit from '@fastify/rate-limit';
import type { FastifyPluginAsync } from 'fastify';
import fp from 'fastify-plugin';
import { loadEnv } from '../config/env.js';

function parseCorsOrigins(raw: string): string[] {
  return raw
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

/** Dev: localhost / 127.0.0.1 / LAN / VPN рядом с CORS_ORIGIN из .env. */
function isDevBrowserOrigin(origin: string): boolean {
  try {
    const url = new URL(origin);
    if (url.protocol !== 'http:' && url.protocol !== 'https:') return false;
    const host = url.hostname;
    if (host === 'localhost' || host === '127.0.0.1') return true;
    // Частный IPv4 (Wi‑Fi / VPN), чтобы storefront с Network URL мог бить в API
    if (/^10\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(host)) return true;
    if (/^192\.168\.\d{1,3}\.\d{1,3}$/.test(host)) return true;
    if (/^172\.(1[6-9]|2\d|3[0-1])\.\d{1,3}\.\d{1,3}$/.test(host)) return true;
    return false;
  } catch {
    return false;
  }
}

function buildCorsOriginOption(
  configured: string,
  nodeEnv: string,
): FastifyCorsOptions['origin'] {
  const allowlist = parseCorsOrigins(configured);

  if (nodeEnv === 'production') {
    if (allowlist.length === 1) return allowlist[0]!;
    return allowlist;
  }

  return (origin, cb) => {
    // SSR / curl без Origin
    if (!origin) {
      cb(null, true);
      return;
    }
    if (allowlist.includes(origin) || isDevBrowserOrigin(origin)) {
      cb(null, origin);
      return;
    }
    cb(null, false);
  };
}

const securityPlugin: FastifyPluginAsync = async (fastify) => {
  const env = loadEnv();

  await fastify.register(helmet, {
    contentSecurityPolicy: false,
    // Storefront и API на разных портах — иначе Safari рвёт cross-origin fetch
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  });

  await fastify.register(cors, {
    origin: buildCorsOriginOption(env.CORS_ORIGIN, env.NODE_ENV),
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'X-Requested-With',
      'Idempotency-Key',
      'X-Request-Id',
    ],
  });

  await fastify.register(rateLimit, {
    global: true,
    max: env.NODE_ENV === 'development' ? 1000 : 300,
    timeWindow: '1 minute',
  });
};

export default fp(securityPlugin, { name: 'security' });
