import type { FastifyPluginAsync, FastifyReply, FastifyRequest } from 'fastify';
import { z } from 'zod';
import { guestCookieOptions, COOKIE_NAMES } from '../../lib/cookies.js';
import type { CartOwner } from '../../lib/cart-owner.js';
import { resolveCartOwner } from '../../lib/cart-owner.js';
import { success } from '../../lib/envelope.js';
import {
  addCartItem,
  clearCart,
  getCart,
  removeCartItem,
  replaceCart,
} from '../../services/cart.service.js';

const cartItemSchema = z.object({
  variantId: z.string().uuid(),
  quantity: z.coerce.number().int().min(1).max(10),
});

const replaceCartSchema = z.object({
  items: z.array(cartItemSchema).max(30),
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

const cartRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.get('/', async (request, reply) => {
    const owner = await withCartOwner(request, reply);
    const data = await getCart(owner);
    return success(data, request.requestId);
  });

  fastify.put('/', async (request, reply) => {
    const owner = await withCartOwner(request, reply);
    const body = replaceCartSchema.parse(request.body);
    const data = await replaceCart(owner, body.items);
    return success(data, request.requestId);
  });

  fastify.post('/items', async (request, reply) => {
    const owner = await withCartOwner(request, reply);
    const body = cartItemSchema.parse(request.body);
    const data = await addCartItem(owner, body.variantId, body.quantity);
    return success(data, request.requestId);
  });

  fastify.delete('/items/:variantId', async (request, reply) => {
    const owner = await withCartOwner(request, reply);
    const { variantId } = request.params as { variantId: string };
    z.string().uuid().parse(variantId);
    const data = await removeCartItem(owner, variantId);
    return success(data, request.requestId);
  });

  fastify.delete('/', async (request, reply) => {
    const owner = await withCartOwner(request, reply);
    const data = await clearCart(owner);
    return success(data, request.requestId);
  });
};

export default cartRoutes;
