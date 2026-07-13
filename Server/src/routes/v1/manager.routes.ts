import type { FastifyPluginAsync } from 'fastify';
import { Op } from 'sequelize';
import { z } from 'zod';
import { success } from '../../lib/envelope.js';
import { StaffUser } from '../../models/user.js';
import {
  MANAGER_ORDER_STATUSES,
  addManagerOrderNote,
  assignManagerOrder,
  countOrdersByStatus,
  getManagerOrderById,
  listManagerOrders,
  updateManagerOrderStatus,
} from '../../services/manager-orders.service.js';

const statusSchema = z.object({
  status: z.enum(MANAGER_ORDER_STATUSES),
  comment: z.string().max(2000).optional(),
});

const noteSchema = z.object({
  text: z.string().min(1).max(5000),
});

const assignSchema = z.object({
  managerId: z.string().uuid(),
});

const managerRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.get('/orders', async (request) => {
    await fastify.authenticateStaff(request);
    const auth = request.auth as Extract<typeof request.auth, { type: 'staff' }>;
    const result = await listManagerOrders(
      auth.id,
      auth.role,
      request.query as Record<string, unknown>,
    );
    return success(result.items, request.requestId, result.meta);
  });

  fastify.get('/orders/pending-count', async (request) => {
    await fastify.authenticateStaff(request);
    const count = await countOrdersByStatus('pending');
    return success({ count }, request.requestId);
  });

  fastify.get('/orders/:id', async (request) => {
    await fastify.authenticateStaff(request);
    const { id } = request.params as { id: string };
    z.string().uuid().parse(id);
    const data = await getManagerOrderById(id);
    return success(data, request.requestId);
  });

  fastify.patch('/orders/:id/status', async (request) => {
    await fastify.authenticateStaff(request);
    const { id } = request.params as { id: string };
    z.string().uuid().parse(id);
    const body = statusSchema.parse(request.body);
    const data = await updateManagerOrderStatus(id, request.auth!.id, body);
    return success(data, request.requestId);
  });

  fastify.post('/orders/:id/notes', async (request) => {
    await fastify.authenticateStaff(request);
    const { id } = request.params as { id: string };
    z.string().uuid().parse(id);
    const body = noteSchema.parse(request.body);
    const data = await addManagerOrderNote(id, request.auth!.id, body.text);
    return success(data, request.requestId);
  });

  fastify.patch('/orders/:id/assign', async (request) => {
    await fastify.authenticateAdmin(request);
    const { id } = request.params as { id: string };
    z.string().uuid().parse(id);
    const body = assignSchema.parse(request.body);
    const data = await assignManagerOrder(id, body.managerId);
    return success(data, request.requestId);
  });

  fastify.get('/staff', async (request) => {
    await fastify.authenticateAdmin(request);
    const rows = await StaffUser.findAll({
      where: { is_active: true, role: { [Op.in]: ['manager', 'admin'] } },
      attributes: ['id', 'email', 'first_name', 'last_name', 'role'],
      order: [['email', 'ASC']],
    });
    const data = rows.map((row) => ({
      id: row.id,
      email: row.email,
      name:
        [row.get('first_name') as string | null, row.get('last_name') as string | null]
          .filter(Boolean)
          .join(' ') || row.email,
      role: row.get('role') as string,
    }));
    return success(data, request.requestId);
  });
};

export default managerRoutes;
