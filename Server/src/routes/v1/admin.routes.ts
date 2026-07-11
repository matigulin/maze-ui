import type { FastifyPluginAsync } from 'fastify';
import multipart from '@fastify/multipart';
import { z } from 'zod';
import { ValidationError } from '../../lib/errors.js';
import { success } from '../../lib/envelope.js';
import {
  createAdminCategory,
  deleteAdminCategory,
  getAdminCategory,
  listAdminCategories,
  restoreAdminCategory,
  updateAdminCategory,
} from '../../services/admin-categories.service.js';
import {
  createAdminBanner,
  createAdminCmsPage,
  createAdminInfoSlide,
  deleteAdminBanner,
  deleteAdminCmsPage,
  deleteAdminInfoSlide,
  getAdminBanner,
  getAdminCmsPage,
  getAdminInfoSlide,
  listAdminBanners,
  listAdminCmsPages,
  listAdminInfoSlides,
  updateAdminBanner,
  updateAdminCmsPage,
  updateAdminInfoSlide,
} from '../../services/admin-content.service.js';
import {
  createAdminProduct,
  createAdminProductFeature,
  createAdminProductImage,
  createAdminVariant,
  deleteAdminProduct,
  deleteAdminProductFeature,
  deleteAdminProductImage,
  deleteAdminVariant,
  getAdminProduct,
  listAdminProducts,
  listAdminSpecFields,
  listAdminVariants,
  restoreAdminProduct,
  restoreAdminVariant,
  updateAdminProduct,
  updateAdminProductFeature,
  updateAdminProductImage,
  updateAdminVariant,
  upsertAdminProductSpecs,
} from '../../services/admin-products.service.js';
import {
  setEditorChoice,
  updateProductStock,
  updateSiteSettings,
} from '../../services/admin.service.js';
import { saveAdminUpload } from '../../services/admin-upload.service.js';

const siteSettingsSchema = z.record(z.string(), z.unknown());

const editorChoiceSchema = z.object({
  productIds: z.array(z.string().uuid()).min(8).max(12),
});

const stockSchema = z.object({
  quantity: z.coerce.number().int().min(0),
});

const categoryBodySchema = z.object({
  slug: z.string().min(1).max(120),
  name: z.string().min(1).max(255),
  parentId: z.string().uuid().nullable().optional(),
  isBrand: z.boolean().optional(),
  brandLogoUrl: z.string().max(500).nullable().optional(),
  icon: z.string().max(255).nullable().optional(),
  image: z.string().max(500).nullable().optional(),
  description: z.string().nullable().optional(),
  externalLink: z.string().max(500).nullable().optional(),
  sortOrder: z.coerce.number().int().optional(),
  isActive: z.boolean().optional(),
});

const productBodySchema = z.object({
  slug: z.string().min(1).max(200),
  name: z.string().min(1).max(500),
  categoryId: z.string().uuid(),
  subcategoryId: z.string().uuid(),
  deviceType: z.string().min(1).max(30),
  description: z.string().nullable().optional(),
  basePrice: z.coerce.number().nonnegative(),
  oldPrice: z.coerce.number().nonnegative().nullable().optional(),
  badgeType: z.string().max(20).nullable().optional(),
  badgeText: z.string().max(100).nullable().optional(),
  isPublished: z.boolean().optional(),
});

const variantBodySchema = z.object({
  sku: z.string().min(1).max(100),
  colorName: z.string().min(1).max(100),
  colorHex: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
  memory: z.string().max(50).nullable().optional(),
  price: z.coerce.number().nonnegative(),
  isAvailable: z.boolean().optional(),
  quantity: z.coerce.number().int().min(0).optional(),
});

const imageBodySchema = z.object({
  url: z.string().min(1).max(500),
  sortOrder: z.coerce.number().int().optional(),
  isPrimary: z.boolean().optional(),
});

const featureBodySchema = z.object({
  title: z.string().min(1).max(255),
  description: z.string().min(1),
  iconUrl: z.string().max(500).nullable().optional(),
  sortOrder: z.coerce.number().int().optional(),
});

const specsBodySchema = z.object({
  values: z.array(
    z.object({
      fieldId: z.string().uuid(),
      value: z.string(),
    }),
  ),
});

const bannerBodySchema = z.object({
  title: z.string().min(1).max(255),
  subtitle: z.string().max(500).nullable().optional(),
  imageUrl: z.string().url().max(500),
  link: z.string().min(1).max(500),
  size: z.string().max(20).optional(),
  sortOrder: z.coerce.number().int().optional(),
  isActive: z.boolean().optional(),
});

const infoSlideBodySchema = z.object({
  icon: z.string().min(1).max(100),
  title: z.string().min(1).max(255),
  description: z.string().min(1),
  sortOrder: z.coerce.number().int().optional(),
  isActive: z.boolean().optional(),
});

const cmsPageBodySchema = z.object({
  slug: z.string().min(1).max(120),
  title: z.string().min(1).max(255),
  content: z.string().min(1),
  metaDescription: z.string().max(500).nullable().optional(),
  isPublished: z.boolean().optional(),
});

const adminRoutes: FastifyPluginAsync = async (fastify) => {
  await fastify.register(multipart, {
    limits: { fileSize: 5 * 1024 * 1024, files: 1 },
  });

  fastify.patch('/site-settings', async (request) => {
    await fastify.authenticateStaff(request);
    const body = siteSettingsSchema.parse(request.body);
    const data = await updateSiteSettings(body);
    return success(data, request.requestId);
  });

  fastify.put('/editor-choice', async (request) => {
    await fastify.authenticateStaff(request);
    const body = editorChoiceSchema.parse(request.body);
    const data = await setEditorChoice(body.productIds);
    return success(data, request.requestId);
  });

  fastify.get('/categories', async (request) => {
    await fastify.authenticateStaff(request);
    const includeDeleted = (request.query as { includeDeleted?: string }).includeDeleted === 'true';
    const data = await listAdminCategories(includeDeleted);
    return success(data, request.requestId);
  });

  fastify.get('/categories/:id', async (request) => {
    await fastify.authenticateStaff(request);
    const { id } = request.params as { id: string };
    z.string().uuid().parse(id);
    const includeDeleted = (request.query as { includeDeleted?: string }).includeDeleted === 'true';
    const data = await getAdminCategory(id, includeDeleted);
    return success(data, request.requestId);
  });

  fastify.post('/categories', async (request) => {
    await fastify.authenticateStaff(request);
    const body = categoryBodySchema.parse(request.body);
    const data = await createAdminCategory(body);
    return success(data, request.requestId);
  });

  fastify.patch('/categories/:id', async (request) => {
    await fastify.authenticateStaff(request);
    const { id } = request.params as { id: string };
    z.string().uuid().parse(id);
    const body = categoryBodySchema.partial().parse(request.body);
    const data = await updateAdminCategory(id, body);
    return success(data, request.requestId);
  });

  fastify.delete('/categories/:id', async (request) => {
    await fastify.authenticateStaff(request);
    const { id } = request.params as { id: string };
    z.string().uuid().parse(id);
    await deleteAdminCategory(id);
    return success({ ok: true }, request.requestId);
  });

  fastify.post('/categories/:id/restore', async (request) => {
    await fastify.authenticateStaff(request);
    const { id } = request.params as { id: string };
    z.string().uuid().parse(id);
    const data = await restoreAdminCategory(id);
    return success(data, request.requestId);
  });

  fastify.get('/products', async (request) => {
    await fastify.authenticateStaff(request);
    const result = await listAdminProducts(request.query as Record<string, unknown>);
    return success(result.items, request.requestId, result.meta);
  });

  fastify.get('/products/:id', async (request) => {
    await fastify.authenticateStaff(request);
    const { id } = request.params as { id: string };
    z.string().uuid().parse(id);
    const includeDeleted = (request.query as { includeDeleted?: string }).includeDeleted === 'true';
    const data = await getAdminProduct(id, includeDeleted);
    return success(data, request.requestId);
  });

  fastify.post('/products', async (request) => {
    await fastify.authenticateStaff(request);
    const body = productBodySchema.parse(request.body);
    const data = await createAdminProduct(body);
    return success(data, request.requestId);
  });

  fastify.patch('/products/:id', async (request) => {
    await fastify.authenticateStaff(request);
    const { id } = request.params as { id: string };
    z.string().uuid().parse(id);
    const body = productBodySchema.partial().parse(request.body);
    const data = await updateAdminProduct(id, body);
    return success(data, request.requestId);
  });

  fastify.delete('/products/:id', async (request) => {
    await fastify.authenticateStaff(request);
    const { id } = request.params as { id: string };
    z.string().uuid().parse(id);
    await deleteAdminProduct(id);
    return success({ ok: true }, request.requestId);
  });

  fastify.post('/products/:id/restore', async (request) => {
    await fastify.authenticateStaff(request);
    const { id } = request.params as { id: string };
    z.string().uuid().parse(id);
    const data = await restoreAdminProduct(id);
    return success(data, request.requestId);
  });

  fastify.patch('/products/:id/stock', async (request) => {
    await fastify.authenticateStaff(request);
    const { id } = request.params as { id: string };
    z.string().uuid().parse(id);
    const body = stockSchema.parse(request.body);
    const data = await updateProductStock(id, body.quantity);
    return success(data, request.requestId);
  });

  fastify.get('/products/:productId/variants', async (request) => {
    await fastify.authenticateStaff(request);
    const { productId } = request.params as { productId: string };
    z.string().uuid().parse(productId);
    const data = await listAdminVariants(productId);
    return success(data, request.requestId);
  });

  fastify.post('/products/:productId/variants', async (request) => {
    await fastify.authenticateStaff(request);
    const { productId } = request.params as { productId: string };
    z.string().uuid().parse(productId);
    const body = variantBodySchema.parse(request.body);
    const data = await createAdminVariant(productId, body);
    return success(data, request.requestId);
  });

  fastify.patch('/products/:productId/variants/:variantId', async (request) => {
    await fastify.authenticateStaff(request);
    const { productId, variantId } = request.params as { productId: string; variantId: string };
    z.string().uuid().parse(productId);
    z.string().uuid().parse(variantId);
    const body = variantBodySchema.partial().parse(request.body);
    const data = await updateAdminVariant(productId, variantId, body);
    return success(data, request.requestId);
  });

  fastify.delete('/products/:productId/variants/:variantId', async (request) => {
    await fastify.authenticateStaff(request);
    const { productId, variantId } = request.params as { productId: string; variantId: string };
    z.string().uuid().parse(productId);
    z.string().uuid().parse(variantId);
    await deleteAdminVariant(productId, variantId);
    return success({ ok: true }, request.requestId);
  });

  fastify.post('/products/:productId/variants/:variantId/restore', async (request) => {
    await fastify.authenticateStaff(request);
    const { productId, variantId } = request.params as { productId: string; variantId: string };
    z.string().uuid().parse(productId);
    z.string().uuid().parse(variantId);
    const data = await restoreAdminVariant(productId, variantId);
    return success(data, request.requestId);
  });

  fastify.get('/spec-fields', async (request) => {
    await fastify.authenticateStaff(request);
    const deviceType = (request.query as { deviceType?: string }).deviceType;
    if (!deviceType) throw new ValidationError('deviceType is required');
    const data = await listAdminSpecFields(deviceType);
    return success(data, request.requestId);
  });

  fastify.post('/products/:productId/images', async (request) => {
    await fastify.authenticateStaff(request);
    const { productId } = request.params as { productId: string };
    z.string().uuid().parse(productId);
    const body = imageBodySchema.parse(request.body);
    const data = await createAdminProductImage(productId, body);
    return success(data, request.requestId);
  });

  fastify.patch('/products/:productId/images/:imageId', async (request) => {
    await fastify.authenticateStaff(request);
    const { productId, imageId } = request.params as { productId: string; imageId: string };
    z.string().uuid().parse(productId);
    z.string().uuid().parse(imageId);
    const body = imageBodySchema.partial().parse(request.body);
    const data = await updateAdminProductImage(productId, imageId, body);
    return success(data, request.requestId);
  });

  fastify.delete('/products/:productId/images/:imageId', async (request) => {
    await fastify.authenticateStaff(request);
    const { productId, imageId } = request.params as { productId: string; imageId: string };
    z.string().uuid().parse(productId);
    z.string().uuid().parse(imageId);
    await deleteAdminProductImage(productId, imageId);
    return success({ ok: true }, request.requestId);
  });

  fastify.post('/products/:productId/features', async (request) => {
    await fastify.authenticateStaff(request);
    const { productId } = request.params as { productId: string };
    z.string().uuid().parse(productId);
    const body = featureBodySchema.parse(request.body);
    const data = await createAdminProductFeature(productId, body);
    return success(data, request.requestId);
  });

  fastify.patch('/products/:productId/features/:featureId', async (request) => {
    await fastify.authenticateStaff(request);
    const { productId, featureId } = request.params as { productId: string; featureId: string };
    z.string().uuid().parse(productId);
    z.string().uuid().parse(featureId);
    const body = featureBodySchema.partial().parse(request.body);
    const data = await updateAdminProductFeature(productId, featureId, body);
    return success(data, request.requestId);
  });

  fastify.delete('/products/:productId/features/:featureId', async (request) => {
    await fastify.authenticateStaff(request);
    const { productId, featureId } = request.params as { productId: string; featureId: string };
    z.string().uuid().parse(productId);
    z.string().uuid().parse(featureId);
    await deleteAdminProductFeature(productId, featureId);
    return success({ ok: true }, request.requestId);
  });

  fastify.put('/products/:productId/specifications', async (request) => {
    await fastify.authenticateStaff(request);
    const { productId } = request.params as { productId: string };
    z.string().uuid().parse(productId);
    const body = specsBodySchema.parse(request.body);
    const data = await upsertAdminProductSpecs(productId, body.values);
    return success(data, request.requestId);
  });

  fastify.get('/banners', async (request) => {
    await fastify.authenticateStaff(request);
    const data = await listAdminBanners();
    return success(data, request.requestId);
  });

  fastify.get('/banners/:id', async (request) => {
    await fastify.authenticateStaff(request);
    const { id } = request.params as { id: string };
    z.string().uuid().parse(id);
    const data = await getAdminBanner(id);
    return success(data, request.requestId);
  });

  fastify.post('/banners', async (request) => {
    await fastify.authenticateStaff(request);
    const body = bannerBodySchema.parse(request.body);
    const data = await createAdminBanner(body);
    return success(data, request.requestId);
  });

  fastify.patch('/banners/:id', async (request) => {
    await fastify.authenticateStaff(request);
    const { id } = request.params as { id: string };
    z.string().uuid().parse(id);
    const body = bannerBodySchema.partial().parse(request.body);
    const data = await updateAdminBanner(id, body);
    return success(data, request.requestId);
  });

  fastify.delete('/banners/:id', async (request) => {
    await fastify.authenticateStaff(request);
    const { id } = request.params as { id: string };
    z.string().uuid().parse(id);
    await deleteAdminBanner(id);
    return success({ ok: true }, request.requestId);
  });

  fastify.get('/info-slides', async (request) => {
    await fastify.authenticateStaff(request);
    const data = await listAdminInfoSlides();
    return success(data, request.requestId);
  });

  fastify.get('/info-slides/:id', async (request) => {
    await fastify.authenticateStaff(request);
    const { id } = request.params as { id: string };
    z.string().uuid().parse(id);
    const data = await getAdminInfoSlide(id);
    return success(data, request.requestId);
  });

  fastify.post('/info-slides', async (request) => {
    await fastify.authenticateStaff(request);
    const body = infoSlideBodySchema.parse(request.body);
    const data = await createAdminInfoSlide(body);
    return success(data, request.requestId);
  });

  fastify.patch('/info-slides/:id', async (request) => {
    await fastify.authenticateStaff(request);
    const { id } = request.params as { id: string };
    z.string().uuid().parse(id);
    const body = infoSlideBodySchema.partial().parse(request.body);
    const data = await updateAdminInfoSlide(id, body);
    return success(data, request.requestId);
  });

  fastify.delete('/info-slides/:id', async (request) => {
    await fastify.authenticateStaff(request);
    const { id } = request.params as { id: string };
    z.string().uuid().parse(id);
    await deleteAdminInfoSlide(id);
    return success({ ok: true }, request.requestId);
  });

  fastify.get('/cms-pages', async (request) => {
    await fastify.authenticateStaff(request);
    const data = await listAdminCmsPages();
    return success(data, request.requestId);
  });

  fastify.get('/cms-pages/:id', async (request) => {
    await fastify.authenticateStaff(request);
    const { id } = request.params as { id: string };
    z.string().uuid().parse(id);
    const data = await getAdminCmsPage(id);
    return success(data, request.requestId);
  });

  fastify.post('/cms-pages', async (request) => {
    await fastify.authenticateStaff(request);
    const body = cmsPageBodySchema.parse(request.body);
    const data = await createAdminCmsPage(body);
    return success(data, request.requestId);
  });

  fastify.patch('/cms-pages/:id', async (request) => {
    await fastify.authenticateStaff(request);
    const { id } = request.params as { id: string };
    z.string().uuid().parse(id);
    const body = cmsPageBodySchema.partial().parse(request.body);
    const data = await updateAdminCmsPage(id, body);
    return success(data, request.requestId);
  });

  fastify.delete('/cms-pages/:id', async (request) => {
    await fastify.authenticateStaff(request);
    const { id } = request.params as { id: string };
    z.string().uuid().parse(id);
    await deleteAdminCmsPage(id);
    return success({ ok: true }, request.requestId);
  });

  fastify.post('/uploads', async (request) => {
    await fastify.authenticateStaff(request);
    const file = await request.file();
    if (!file) {
      throw new ValidationError('File is required');
    }

    const buffer = await file.toBuffer();
    const data = await saveAdminUpload({
      buffer,
      mimetype: file.mimetype,
      size: buffer.length,
    });

    return success(data, request.requestId);
  });
};

export default adminRoutes;
