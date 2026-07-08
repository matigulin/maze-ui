import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import rateLimit from '@fastify/rate-limit';
import type { FastifyPluginAsync } from 'fastify';
import fp from 'fastify-plugin';
import { loadEnv } from '../config/env.js';

const securityPlugin: FastifyPluginAsync = async (fastify) => {
  const env = loadEnv();

  await fastify.register(helmet, {
    contentSecurityPolicy: false,
  });

  await fastify.register(cors, {
    origin: env.CORS_ORIGIN,
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
