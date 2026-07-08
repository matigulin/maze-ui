import { randomUUID } from 'node:crypto';
import type { FastifyPluginAsync } from 'fastify';
import fp from 'fastify-plugin';
import { z } from 'zod';
import { requestContext } from '../lib/context.js';

const requestIdSchema = z.string().max(64).regex(/^[a-zA-Z0-9_-]+$/);

function resolveRequestId(header: string | string[] | undefined): string {
  const raw = Array.isArray(header) ? header[0] : header;
  if (raw && requestIdSchema.safeParse(raw).success) {
    return raw;
  }
  return randomUUID();
}

const requestIdPlugin: FastifyPluginAsync = async (fastify) => {
  fastify.addHook('onRequest', async (request, reply) => {
    const requestId = resolveRequestId(request.headers['x-request-id']);
    request.requestId = requestId;
    reply.header('X-Request-Id', requestId);
    requestContext.enterWith({ requestId, correlationId: requestId });
  });
};

declare module 'fastify' {
  interface FastifyRequest {
    requestId: string;
  }
}

export default fp(requestIdPlugin, { name: 'request-id' });
