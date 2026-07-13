import type { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import { success } from '../../lib/envelope.js';
import {
  getUserOrderById,
  listUserOrders,
} from '../../services/order-query.service.js';
import {
  addFavorite,
  createAddress,
  createCompany,
  deleteAddress,
  deleteCompany,
  getMe,
  listAddresses,
  listCompanies,
  listFavorites,
  removeFavorite,
  updateAddress,
  updateCompany,
  updateConsents,
  updateMe,
} from '../../services/user-profile.service.js';

const patchMeSchema = z.object({
  firstName: z.string().min(1).max(100).optional(),
  lastName: z.string().min(1).max(100).optional(),
  middleName: z.string().max(100).nullable().optional(),
  email: z.string().email().max(255).optional(),
  gender: z.enum(['male', 'female']).nullable().optional(),
  birthDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'birthDate must be YYYY-MM-DD')
    .nullable()
    .optional(),
  subscribeEmail: z.boolean().optional(),
  subscribeSms: z.boolean().optional(),
});

const addressSchema = z.object({
  type: z.enum(['home', 'work']),
  city: z.string().min(1).max(255),
  street: z.string().min(1).max(255),
  house: z.string().min(1).max(50),
  flat: z.string().max(50).optional(),
  building: z.string().max(50).optional(),
  floor: z.string().max(20).optional(),
  isDefault: z.boolean().optional(),
});

const companySchema = z.object({
  name: z.string().min(1).max(255),
  inn: z.string().min(10).max(12),
  kpp: z.string().max(9).optional(),
  address: z.string().min(1),
});

const consentsSchema = z.object({
  subscribeEmail: z.boolean().optional(),
  subscribeSms: z.boolean().optional(),
  source: z.string().max(50).optional(),
});

const meRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.get('/', async (request) => {
    await fastify.authenticateUser(request);
    const data = await getMe(request.auth!.id);
    return success(data, request.requestId);
  });

  fastify.patch('/', async (request) => {
    await fastify.authenticateUser(request);
    const body = patchMeSchema.parse(request.body);
    const data = await updateMe(request.auth!.id, body, request.ip);
    return success(data, request.requestId);
  });

  fastify.get('/addresses', async (request) => {
    await fastify.authenticateUser(request);
    const data = await listAddresses(request.auth!.id);
    return success(data, request.requestId);
  });

  fastify.post('/addresses', async (request) => {
    await fastify.authenticateUser(request);
    const body = addressSchema.parse(request.body);
    const data = await createAddress(request.auth!.id, body);
    return success(data, request.requestId);
  });

  fastify.patch('/addresses/:id', async (request) => {
    await fastify.authenticateUser(request);
    const { id } = request.params as { id: string };
    z.string().uuid().parse(id);
    const body = addressSchema.partial().parse(request.body);
    const data = await updateAddress(request.auth!.id, id, body);
    return success(data, request.requestId);
  });

  fastify.delete('/addresses/:id', async (request) => {
    await fastify.authenticateUser(request);
    const { id } = request.params as { id: string };
    z.string().uuid().parse(id);
    await deleteAddress(request.auth!.id, id);
    return success({ ok: true }, request.requestId);
  });

  fastify.get('/companies', async (request) => {
    await fastify.authenticateUser(request);
    const data = await listCompanies(request.auth!.id);
    return success(data, request.requestId);
  });

  fastify.post('/companies', async (request) => {
    await fastify.authenticateUser(request);
    const body = companySchema.parse(request.body);
    const data = await createCompany(request.auth!.id, body);
    return success(data, request.requestId);
  });

  fastify.patch('/companies/:id', async (request) => {
    await fastify.authenticateUser(request);
    const { id } = request.params as { id: string };
    z.string().uuid().parse(id);
    const body = companySchema.partial().parse(request.body);
    const data = await updateCompany(request.auth!.id, id, body);
    return success(data, request.requestId);
  });

  fastify.delete('/companies/:id', async (request) => {
    await fastify.authenticateUser(request);
    const { id } = request.params as { id: string };
    z.string().uuid().parse(id);
    await deleteCompany(request.auth!.id, id);
    return success({ ok: true }, request.requestId);
  });

  fastify.get('/favorites', async (request) => {
    await fastify.authenticateUser(request);
    const data = await listFavorites(request.auth!.id);
    return success(data, request.requestId);
  });

  fastify.post('/favorites/:productId', async (request) => {
    await fastify.authenticateUser(request);
    const { productId } = request.params as { productId: string };
    z.string().uuid().parse(productId);
    await addFavorite(request.auth!.id, productId);
    return success({ ok: true }, request.requestId);
  });

  fastify.delete('/favorites/:productId', async (request) => {
    await fastify.authenticateUser(request);
    const { productId } = request.params as { productId: string };
    z.string().uuid().parse(productId);
    await removeFavorite(request.auth!.id, productId);
    return success({ ok: true }, request.requestId);
  });

  fastify.patch('/consents', async (request) => {
    await fastify.authenticateUser(request);
    const body = consentsSchema.parse(request.body);
    const data = await updateConsents(request.auth!.id, body, request.ip);
    return success(data, request.requestId);
  });

  fastify.get('/orders', async (request) => {
    await fastify.authenticateUser(request);
    const userId = request.auth!.id;
    const result = await listUserOrders(userId, request.query as Record<string, unknown>);
    return success(result.items, request.requestId, result.meta);
  });

  fastify.get('/orders/:id', async (request) => {
    await fastify.authenticateUser(request);
    const userId = request.auth!.id;
    const { id } = request.params as { id: string };
    z.string().uuid().parse(id);
    const data = await getUserOrderById(userId, id);
    return success(data, request.requestId);
  });
};

export default meRoutes;
