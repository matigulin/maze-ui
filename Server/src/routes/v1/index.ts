import type { FastifyPluginAsync } from 'fastify';
import publicRoutes from './public.routes.js';
import { authRoutes, staffAuthRoutes } from './auth.routes.js';
import cartRoutes from './cart.routes.js';
import deliveryRoutes from './delivery.routes.js';
import meRoutes from './me.routes.js';
import managerRoutes from './manager.routes.js';
import adminRoutes from './admin.routes.js';
import ordersRoutes from './orders.routes.js';

const apiV1Routes: FastifyPluginAsync = async (fastify) => {
  await fastify.register(publicRoutes);
  await fastify.register(authRoutes, { prefix: '/auth' });
  await fastify.register(staffAuthRoutes, { prefix: '/auth/staff' });
  await fastify.register(cartRoutes, { prefix: '/cart' });
  await fastify.register(deliveryRoutes, { prefix: '/delivery' });
  await fastify.register(ordersRoutes, { prefix: '/orders' });
  await fastify.register(meRoutes, { prefix: '/me' });
  await fastify.register(managerRoutes, { prefix: '/manager' });
  await fastify.register(adminRoutes, { prefix: '/admin' });
};

export default apiV1Routes;
