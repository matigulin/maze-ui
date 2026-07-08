import type { FastifyPluginAsync } from 'fastify';
import { success } from '../../lib/envelope.js';
import { getCmsPage } from '../../services/cms.service.js';
import { listActiveAccessories } from '../../services/accessories.service.js';
import { getCategoryTree, getProductBySlug, listProducts } from '../../services/catalog.service.js';
import { getHome } from '../../services/home.service.js';
import { listReviews } from '../../services/reviews.service.js';
import { getPublicSettings } from '../../services/settings.service.js';

const publicRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.get('/settings/public', async (request) => {
    const data = await getPublicSettings();
    return success(data, request.requestId);
  });

  fastify.get('/home', async (request) => {
    const data = await getHome();
    return success(data, request.requestId);
  });

  fastify.get('/reviews', async (request) => {
    const result = await listReviews(request.query as Record<string, unknown>);
    return success(result.items, request.requestId, result.meta);
  });

  fastify.get('/accessories', async (request) => {
    const data = await listActiveAccessories();
    return success(data, request.requestId);
  });

  fastify.get('/cms/:slug', async (request) => {
    const { slug } = request.params as { slug: string };
    const data = await getCmsPage(slug);
    return success(data, request.requestId);
  });

  fastify.get('/catalog/categories', async (request) => {
    const data = await getCategoryTree();
    return success(data, request.requestId);
  });

  fastify.get('/catalog/products', async (request) => {
    const result = await listProducts(request.query as Record<string, unknown>);
    return success(result.items, request.requestId, result.meta);
  });

  fastify.get('/catalog/products/:slug', async (request) => {
    const { slug } = request.params as { slug: string };
    const data = await getProductBySlug(slug);
    return success(data, request.requestId);
  });
};

export default publicRoutes;
