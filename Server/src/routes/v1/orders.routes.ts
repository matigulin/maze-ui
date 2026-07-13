import type { FastifyPluginAsync, FastifyReply, FastifyRequest } from 'fastify';
import { z } from 'zod';
import { guestCookieOptions, COOKIE_NAMES } from '../../lib/cookies.js';
import type { CartOwner } from '../../lib/cart-owner.js';
import { ownerKey, resolveCartOwner } from '../../lib/cart-owner.js';
import { ValidationError } from '../../lib/errors.js';
import { consumeRateLimit } from '../../lib/rate-limit.js';
import { createOrderFromCheckout } from '../../services/order-checkout.service.js';

const checkoutSchema = z.object({
  customer: z.object({
    phone: z.string().min(10).max(20),
    firstName: z.string().min(1).max(100),
    lastName: z.string().min(1).max(100),
    email: z.string().email().optional(),
  }),
  delivery: z.object({
    quoteId: z.string().uuid(),
    comment: z.string().max(1000).optional(),
  }),
  payment: z.object({
    method: z.enum(['cash', 'card_qr', 'installment', 'invoice_b2b']),
  }),
  installmentBundle: z
    .object({
      accessoryVariantIds: z.array(z.string().uuid()).length(3),
    })
    .optional(),
  companyId: z.string().uuid().nullable().optional(),
  comment: z.string().max(1000).optional(),
});

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

function parseIdempotencyKey(request: FastifyRequest): string {
  const raw = request.headers['idempotency-key'];
  const value = Array.isArray(raw) ? raw[0] : raw;
  const parsed = z.string().uuid().safeParse(value);
  if (!parsed.success) {
    throw new ValidationError('Idempotency-Key header is required');
  }
  return parsed.data;
}

const ordersRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.post('/', async (request, reply) => {
    const owner = await withCartOwner(request, reply);
    await consumeRateLimit(`rate:checkout:${ownerKey(owner)}`, 15, 60 * 60);

    const idempotencyKey = parseIdempotencyKey(request);
    const body = checkoutSchema.parse(request.body);
    const data = await createOrderFromCheckout(owner, idempotencyKey, body);

    return reply.status(201).send({
      data,
      requestId: request.requestId,
    });
  });
};

export default ordersRoutes;
