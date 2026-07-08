import type { FastifyPluginAsync, FastifyRequest } from 'fastify';
import fp from 'fastify-plugin';
import { ForbiddenError, UnauthorizedError } from '../lib/errors.js';
import { verifyAccessToken, type AccessTokenPayload } from '../lib/jwt.js';

export interface AuthUser {
  id: string;
  type: 'user';
}

export interface AuthStaff {
  id: string;
  type: 'staff';
  role: 'manager' | 'admin';
}

declare module 'fastify' {
  interface FastifyRequest {
    auth?: AuthUser | AuthStaff;
    accessToken?: AccessTokenPayload;
  }
}

async function authenticate(request: FastifyRequest, expectedType?: 'user' | 'staff') {
  const header = request.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    throw new UnauthorizedError();
  }

  const token = header.slice(7);
  const payload = await verifyAccessToken(token);

  if (expectedType && payload.type !== expectedType) {
    throw new UnauthorizedError();
  }

  request.accessToken = payload;

  if (payload.type === 'user') {
    request.auth = { id: payload.sub, type: 'user' };
  } else {
    request.auth = {
      id: payload.sub,
      type: 'staff',
      role: payload.role ?? 'manager',
    };
  }
}

const authPlugin: FastifyPluginAsync = async (fastify) => {
  fastify.decorateRequest('auth', undefined);
  fastify.decorateRequest('accessToken', undefined);

  fastify.decorate('authenticateUser', async (request: FastifyRequest) => {
    await authenticate(request, 'user');
  });

  fastify.decorate('authenticateStaff', async (request: FastifyRequest) => {
    await authenticate(request, 'staff');
  });

  fastify.decorate('authenticateAdmin', async (request: FastifyRequest) => {
    await authenticate(request, 'staff');
    const auth = request.auth;
    if (!auth || auth.type !== 'staff' || auth.role !== 'admin') {
      throw new ForbiddenError();
    }
  });
};

declare module 'fastify' {
  interface FastifyInstance {
    authenticateUser: (request: FastifyRequest) => Promise<void>;
    authenticateStaff: (request: FastifyRequest) => Promise<void>;
    authenticateAdmin: (request: FastifyRequest) => Promise<void>;
  }
}

export default fp(authPlugin, { name: 'auth' });
