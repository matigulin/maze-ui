import type { FastifyPluginAsync } from 'fastify';
import { checkDatabaseConnection } from '../config/database.js';
import { checkRedisConnection } from '../config/redis.js';
import { success } from '../lib/envelope.js';

const healthRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.get('/health/live', async (request) => {
    return success({ status: 'ok' }, request.requestId);
  });

  fastify.get('/health/ready', async (request, reply) => {
    const [postgres, redis] = await Promise.all([
      checkDatabaseConnection(),
      checkRedisConnection(),
    ]);

    const ready = postgres && redis;

    if (!ready) {
      return reply.status(503).send(
        success(
          { status: 'not_ready', postgres, redis },
          request.requestId,
        ),
      );
    }

    return success({ status: 'ready', postgres, redis }, request.requestId);
  });
};

export default healthRoutes;
