import type { FastifyPluginAsync } from 'fastify';
import fp from 'fastify-plugin';
import { ForbiddenError } from '../lib/errors.js';
import { MUTATING_METHODS } from './error-handler.js';

const CSRF_HEADER = 'x-requested-with';
const CSRF_VALUE = 'maze-web';

const csrfPlugin: FastifyPluginAsync = async (fastify) => {
  fastify.addHook('onRequest', async (request) => {
    if (!MUTATING_METHODS.has(request.method)) return;

    const header = request.headers[CSRF_HEADER];
    const value = Array.isArray(header) ? header[0] : header;

    if (value?.toLowerCase() !== CSRF_VALUE) {
      throw new ForbiddenError('CSRF_VALIDATION_FAILED', 'CSRF validation failed');
    }
  });
};

export default fp(csrfPlugin, { name: 'csrf' });
