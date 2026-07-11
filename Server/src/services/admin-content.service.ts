import { randomUUID } from 'node:crypto';
import { Op } from 'sequelize';
import { ConflictError, NotFoundError } from '../lib/errors.js';
import { isoTimestamp } from '../lib/model-attrs.js';
import { Banner, CmsPage, InfoSlide } from '../models/content.js';
import { invalidateCatalogAndHomeCache } from './cache-invalidation.service.js';

function mapBanner(row: Banner) {
  return {
    id: row.id,
    title: row.title,
    subtitle: row.subtitle,
    imageUrl: row.image_url,
    link: row.link,
    size: row.size,
    sortOrder: row.sort_order,
    isActive: row.is_active,
    createdAt: isoTimestamp(row, 'createdAt'),
    updatedAt: isoTimestamp(row, 'updatedAt'),
  };
}

function mapInfoSlide(row: InfoSlide) {
  return {
    id: row.id,
    icon: row.icon,
    title: row.title,
    description: row.description,
    sortOrder: row.sort_order,
    isActive: row.is_active,
    createdAt: isoTimestamp(row, 'createdAt'),
    updatedAt: isoTimestamp(row, 'updatedAt'),
  };
}

function mapCmsPage(row: CmsPage) {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    content: row.content,
    metaDescription: row.meta_description,
    isPublished: row.is_published,
    createdAt: isoTimestamp(row, 'createdAt'),
    updatedAt: isoTimestamp(row, 'updatedAt'),
  };
}

async function assertUniqueCmsSlug(slug: string, excludeId?: string) {
  const existing = await CmsPage.findOne({
    where: {
      slug,
      ...(excludeId ? { id: { [Op.ne]: excludeId } } : {}),
    },
    paranoid: false,
  });
  if (existing) {
    throw new ConflictError('DUPLICATE_RESOURCE', 'CMS slug already exists');
  }
}

export async function listAdminBanners() {
  const rows = await Banner.findAll({ order: [['sort_order', 'ASC']] });
  return rows.map(mapBanner);
}

export async function getAdminBanner(id: string) {
  const row = await Banner.findByPk(id);
  if (!row) throw new NotFoundError('Banner not found');
  return mapBanner(row);
}

export async function createAdminBanner(input: {
  title: string;
  subtitle?: string | null;
  imageUrl: string;
  link: string;
  size?: string;
  sortOrder?: number;
  isActive?: boolean;
}) {
  const row = await Banner.create({
    id: randomUUID(),
    title: input.title,
    subtitle: input.subtitle ?? null,
    image_url: input.imageUrl,
    link: input.link,
    size: input.size ?? 'large',
    sort_order: input.sortOrder ?? 0,
    is_active: input.isActive ?? true,
  });
  await invalidateCatalogAndHomeCache();
  return mapBanner(row);
}

export async function updateAdminBanner(
  id: string,
  input: Partial<{
    title: string;
    subtitle: string | null;
    imageUrl: string;
    link: string;
    size: string;
    sortOrder: number;
    isActive: boolean;
  }>,
) {
  const row = await Banner.findByPk(id);
  if (!row) throw new NotFoundError('Banner not found');

  await row.update({
    ...(input.title !== undefined ? { title: input.title } : {}),
    ...(input.subtitle !== undefined ? { subtitle: input.subtitle } : {}),
    ...(input.imageUrl !== undefined ? { image_url: input.imageUrl } : {}),
    ...(input.link !== undefined ? { link: input.link } : {}),
    ...(input.size !== undefined ? { size: input.size } : {}),
    ...(input.sortOrder !== undefined ? { sort_order: input.sortOrder } : {}),
    ...(input.isActive !== undefined ? { is_active: input.isActive } : {}),
  });

  await invalidateCatalogAndHomeCache();
  return mapBanner(row);
}

export async function deleteAdminBanner(id: string) {
  const row = await Banner.findByPk(id);
  if (!row) throw new NotFoundError('Banner not found');
  await row.destroy();
  await invalidateCatalogAndHomeCache();
}

export async function listAdminInfoSlides() {
  const rows = await InfoSlide.findAll({ order: [['sort_order', 'ASC']] });
  return rows.map(mapInfoSlide);
}

export async function getAdminInfoSlide(id: string) {
  const row = await InfoSlide.findByPk(id);
  if (!row) throw new NotFoundError('Info slide not found');
  return mapInfoSlide(row);
}

export async function createAdminInfoSlide(input: {
  icon: string;
  title: string;
  description: string;
  sortOrder?: number;
  isActive?: boolean;
}) {
  const row = await InfoSlide.create({
    id: randomUUID(),
    icon: input.icon,
    title: input.title,
    description: input.description,
    sort_order: input.sortOrder ?? 0,
    is_active: input.isActive ?? true,
  });
  await invalidateCatalogAndHomeCache();
  return mapInfoSlide(row);
}

export async function updateAdminInfoSlide(
  id: string,
  input: Partial<{
    icon: string;
    title: string;
    description: string;
    sortOrder: number;
    isActive: boolean;
  }>,
) {
  const row = await InfoSlide.findByPk(id);
  if (!row) throw new NotFoundError('Info slide not found');

  await row.update({
    ...(input.icon !== undefined ? { icon: input.icon } : {}),
    ...(input.title !== undefined ? { title: input.title } : {}),
    ...(input.description !== undefined ? { description: input.description } : {}),
    ...(input.sortOrder !== undefined ? { sort_order: input.sortOrder } : {}),
    ...(input.isActive !== undefined ? { is_active: input.isActive } : {}),
  });

  await invalidateCatalogAndHomeCache();
  return mapInfoSlide(row);
}

export async function deleteAdminInfoSlide(id: string) {
  const row = await InfoSlide.findByPk(id);
  if (!row) throw new NotFoundError('Info slide not found');
  await row.destroy();
  await invalidateCatalogAndHomeCache();
}

export async function listAdminCmsPages() {
  const rows = await CmsPage.findAll({ order: [['slug', 'ASC']] });
  return rows.map(mapCmsPage);
}

export async function getAdminCmsPage(id: string) {
  const row = await CmsPage.findByPk(id);
  if (!row) throw new NotFoundError('CMS page not found');
  return mapCmsPage(row);
}

export async function createAdminCmsPage(input: {
  slug: string;
  title: string;
  content: string;
  metaDescription?: string | null;
  isPublished?: boolean;
}) {
  await assertUniqueCmsSlug(input.slug);

  const row = await CmsPage.create({
    id: randomUUID(),
    slug: input.slug,
    title: input.title,
    content: input.content,
    meta_description: input.metaDescription ?? null,
    is_published: input.isPublished ?? true,
  });

  await invalidateCatalogAndHomeCache();
  return mapCmsPage(row);
}

export async function updateAdminCmsPage(
  id: string,
  input: Partial<{
    slug: string;
    title: string;
    content: string;
    metaDescription: string | null;
    isPublished: boolean;
  }>,
) {
  const row = await CmsPage.findByPk(id);
  if (!row) throw new NotFoundError('CMS page not found');

  if (input.slug && input.slug !== row.slug) {
    await assertUniqueCmsSlug(input.slug, id);
  }

  await row.update({
    ...(input.slug !== undefined ? { slug: input.slug } : {}),
    ...(input.title !== undefined ? { title: input.title } : {}),
    ...(input.content !== undefined ? { content: input.content } : {}),
    ...(input.metaDescription !== undefined ? { meta_description: input.metaDescription } : {}),
    ...(input.isPublished !== undefined ? { is_published: input.isPublished } : {}),
  });

  await invalidateCatalogAndHomeCache();
  return mapCmsPage(row);
}

export async function deleteAdminCmsPage(id: string) {
  const row = await CmsPage.findByPk(id);
  if (!row) throw new NotFoundError('CMS page not found');
  await row.destroy();
  await invalidateCatalogAndHomeCache();
}
