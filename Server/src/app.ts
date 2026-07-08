import Fastify from 'fastify';
import cookie from '@fastify/cookie';
import fastifyStatic from '@fastify/static';
import { getSequelize } from './config/database.js';
import { loadEnv } from './config/env.js';
import { initModels } from './models/index.js';
import authPlugin from './plugins/auth.js';
import csrfPlugin from './plugins/csrf.js';
import errorHandlerPlugin from './plugins/error-handler.js';
import requestIdPlugin from './plugins/request-id.js';
import securityPlugin from './plugins/security.js';
import healthRoutes from './routes/health.routes.js';
import apiV1Routes from './routes/v1/index.js';
import { ensureUploadDir } from './services/admin-upload.service.js';

export async function buildApp() {
  const env = loadEnv();

  initModels(getSequelize());
  const uploadDir = await ensureUploadDir();

  const app = Fastify({
    logger: {
      level: env.NODE_ENV === 'development' ? 'info' : 'warn',
      redact: ['req.headers.authorization', 'req.headers.cookie', 'password', 'code'],
    },
    requestIdHeader: false,
    bodyLimit: 1024 * 1024,
  });

  await app.register(requestIdPlugin);
  await app.register(errorHandlerPlugin);
  await app.register(cookie);
  await app.register(securityPlugin);
  await app.register(csrfPlugin);
  await app.register(authPlugin);

  await app.register(fastifyStatic, {
    root: uploadDir,
    prefix: '/uploads/',
    decorateReply: false,
  });

  await app.register(healthRoutes);

  await app.register(apiV1Routes, { prefix: '/api/v1' });

  return app;
}
