import type { FastifyPluginAsync, FastifyReply, FastifyRequest } from 'fastify';
import { z } from 'zod';
import { DELIVERY_PROVIDERS } from '../../lib/constants.js';
import { guestCookieOptions, COOKIE_NAMES } from '../../lib/cookies.js';
import type { CartOwner } from '../../lib/cart-owner.js';
import { resolveCartOwner } from '../../lib/cart-owner.js';
import { consumeRateLimit } from '../../lib/rate-limit.js';
import { success } from '../../lib/envelope.js';
import {
  getQuoteForOwner,
  requestDeliveryQuote,
} from '../../services/delivery-quote.service.js';

const quoteBodySchema = z.object({
  provider: z.enum(DELIVERY_PROVIDERS),
  city: z.string().min(1).max(255),
  address: z
    .object({
      street: z.string().max(255).optional(),
      house: z.string().max(50).optional(),
      flat: z.string().max(50).optional(),
      postalCode: z.string().max(20).optional(),
    })
    .optional(),
  items: z
    .array(
      z.object({
        variantId: z.string().uuid(),
        quantity: z.coerce.number().int().min(1).max(10),
      }),
    )
    .min(1)
    .max(30),
});

function clientIp(request: { ip: string; headers: Record<string, unknown> }): string {
  const forwarded = request.headers['x-forwarded-for'];
  if (typeof forwarded === 'string' && forwarded.length > 0) {
    return forwarded.split(',')[0]?.trim() ?? request.ip;
  }
  return request.ip;
}

function applyGuestCookie(reply: FastifyReply, owner: CartOwner) {
  if (owner.newGuestSession) {
    reply.setCookie(COOKIE_NAMES.GUEST, owner.newGuestSession, guestCookieOptions());
  }
}

async function withCartOwner(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<CartOwner> {
  const owner = await resolveCartOwner(request);
  applyGuestCookie(reply, owner);
  return owner;
}

const deliveryRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.post('/quote', async (request, reply) => {
    await consumeRateLimit(`rate:delivery-quote:ip:${clientIp(request)}`, 20, 60 * 60);

    const owner = await withCartOwner(request, reply);
    const body = quoteBodySchema.parse(request.body);
    const data = await requestDeliveryQuote(owner, body);
    return success(data, request.requestId);
  });

  fastify.get('/quote/:quoteId', async (request, reply) => {
    const owner = await withCartOwner(request, reply);
    const { quoteId } = request.params as { quoteId: string };
    z.string().uuid().parse(quoteId);
    const data = await getQuoteForOwner(quoteId, owner);
    return success(data, request.requestId);
  });
};

export default deliveryRoutes;
