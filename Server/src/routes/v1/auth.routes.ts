import type { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import {
  clearStaffRefreshCookieOptions,
  clearUserRefreshCookieOptions,
  COOKIE_NAMES,
  staffRefreshCookieOptions,
  userRefreshCookieOptions,
} from '../../lib/cookies.js';
import { UnauthorizedError } from '../../lib/errors.js';
import { success } from '../../lib/envelope.js';
import { refreshStaffSession, refreshUserSession } from '../../services/auth.service.js';
import { sendSmsCode, verifySmsCode } from '../../services/sms-auth.service.js';
import { loginStaff } from '../../services/staff-auth.service.js';
import { revokeRefreshSession } from '../../services/token.service.js';

const phoneBodySchema = z.object({
  phone: z.string().min(10).max(20),
});

const verifyBodySchema = z.object({
  phone: z.string().min(10).max(20),
  code: z.string().regex(/^\d{4}$/),
});

const staffLoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(128),
});

function clientIp(request: { ip: string; headers: Record<string, unknown> }): string {
  const forwarded = request.headers['x-forwarded-for'];
  if (typeof forwarded === 'string' && forwarded.length > 0) {
    return forwarded.split(',')[0]?.trim() ?? request.ip;
  }
  return request.ip;
}

const authRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.post('/sms/send', async (request) => {
    const body = phoneBodySchema.parse(request.body);
    const data = await sendSmsCode(body.phone, clientIp(request));
    return success(data, request.requestId);
  });

  fastify.post('/sms/verify', async (request, reply) => {
    const body = verifyBodySchema.parse(request.body);
    const guestSessionId = request.cookies[COOKIE_NAMES.GUEST];
    const result = await verifySmsCode(body.phone, body.code, guestSessionId);

    reply.setCookie(COOKIE_NAMES.USER_REFRESH, result.refreshJti, userRefreshCookieOptions());

    return success(
      {
        accessToken: result.accessToken,
        expiresIn: result.expiresIn,
        user: result.user,
      },
      request.requestId,
    );
  });

  fastify.post('/refresh', async (request, reply) => {
    const refreshJti = request.cookies[COOKIE_NAMES.USER_REFRESH];
    if (!refreshJti) {
      reply.clearCookie(COOKIE_NAMES.USER_REFRESH, clearUserRefreshCookieOptions());
      throw new UnauthorizedError();
    }

    const result = await refreshUserSession(refreshJti);
    reply.setCookie(COOKIE_NAMES.USER_REFRESH, result.refreshJti, userRefreshCookieOptions());

    return success(
      {
        accessToken: result.accessToken,
        expiresIn: result.expiresIn,
      },
      request.requestId,
    );
  });

  fastify.post('/logout', async (request, reply) => {
    const refreshJti = request.cookies[COOKIE_NAMES.USER_REFRESH];
    if (refreshJti) {
      await revokeRefreshSession(refreshJti);
    }

    reply.clearCookie(COOKIE_NAMES.USER_REFRESH, clearUserRefreshCookieOptions());
    return success({ ok: true }, request.requestId);
  });
};

const staffAuthRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.post('/login', async (request, reply) => {
    const body = staffLoginSchema.parse(request.body);
    const result = await loginStaff({
      email: body.email,
      password: body.password,
      ip: clientIp(request),
      userAgent: typeof request.headers['user-agent'] === 'string' ? request.headers['user-agent'] : null,
    });

    reply.setCookie(COOKIE_NAMES.STAFF_REFRESH, result.refreshJti, staffRefreshCookieOptions());

    return success(
      {
        accessToken: result.accessToken,
        expiresIn: result.expiresIn,
        staff: {
          id: result.staff.id,
          role: result.staff.role,
          email: result.staff.email,
          firstName: result.staff.firstName,
          lastName: result.staff.lastName,
        },
      },
      request.requestId,
    );
  });

  fastify.post('/logout', async (request, reply) => {
    const refreshJti = request.cookies[COOKIE_NAMES.STAFF_REFRESH];
    if (refreshJti) {
      await revokeRefreshSession(refreshJti);
    }

    reply.clearCookie(COOKIE_NAMES.STAFF_REFRESH, clearStaffRefreshCookieOptions());
    return success({ ok: true }, request.requestId);
  });

  fastify.post('/refresh', async (request, reply) => {
    const refreshJti = request.cookies[COOKIE_NAMES.STAFF_REFRESH];
    if (!refreshJti) {
      reply.clearCookie(COOKIE_NAMES.STAFF_REFRESH, clearStaffRefreshCookieOptions());
      throw new UnauthorizedError();
    }

    const result = await refreshStaffSession(refreshJti);
    reply.setCookie(COOKIE_NAMES.STAFF_REFRESH, result.refreshJti, staffRefreshCookieOptions());

    return success(
      {
        accessToken: result.accessToken,
        expiresIn: result.expiresIn,
        staff: result.staff,
      },
      request.requestId,
    );
  });
};

export { authRoutes, staffAuthRoutes };
