import { randomUUID } from 'node:crypto';
import { Op } from 'sequelize';
import { ConflictError, NotFoundError, ValidationError } from '../lib/errors.js';
import { isoTimestamp, intAttr } from '../lib/model-attrs.js';
import { Category } from '../models/catalog.js';
import { invalidateCatalogAndHomeCache } from './cache-invalidation.service.js';

function mapCategory(row: Category) {
  const deletedAt = row.get('deletedAt') ?? row.get('deleted_at');
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    parentId: row.parent_id,
    isBrand: row.is_brand,
    brandLogoUrl: row.brand_logo_url,
    icon: row.icon,
    image: row.image,
    description: row.description,
    externalLink: row.external_link,
    sortOrder: intAttr(row, 'sort_order'),
    isActive: row.is_active,
    deletedAt: deletedAt
      ? deletedAt instanceof Date
        ? deletedAt.toISOString()
        : String(deletedAt)
      : null,
    createdAt: isoTimestamp(row, 'createdAt'),
    updatedAt: isoTimestamp(row, 'updatedAt'),
  };
}

async function assertUniqueSlug(slug: string, excludeId?: string) {
  const existing = await Category.findOne({
    where: {
      slug,
      ...(excludeId ? { id: { [Op.ne]: excludeId } } : {}),
    },
    paranoid: false,
  });
  if (existing) {
    throw new ConflictError('DUPLICATE_RESOURCE', 'Category slug already exists');
  }
}

export async function listAdminCategories(includeDeleted = false) {
  const rows = await Category.findAll({
    order: [['sort_order', 'ASC'], ['name', 'ASC']],
    paranoid: !includeDeleted,
  });
  return rows.map(mapCategory);
}

export async function getAdminCategory(id: string, includeDeleted = false) {
  const row = await Category.findByPk(id, { paranoid: !includeDeleted });
  if (!row) {
    throw new NotFoundError('Category not found');
  }
  return mapCategory(row);
}

export async function createAdminCategory(input: {
  slug: string;
  name: string;
  parentId?: string | null;
  isBrand?: boolean;
  brandLogoUrl?: string | null;
  icon?: string | null;
  image?: string | null;
  description?: string | null;
  externalLink?: string | null;
  sortOrder?: number;
  isActive?: boolean;
}) {
  await assertUniqueSlug(input.slug);

  if (input.parentId) {
    const parent = await Category.findByPk(input.parentId);
    if (!parent) {
      throw new NotFoundError('Parent category not found');
    }
  }

  const row = await Category.create({
    id: randomUUID(),
    slug: input.slug,
    name: input.name,
    parent_id: input.parentId ?? null,
    is_brand: input.isBrand ?? false,
    brand_logo_url: input.brandLogoUrl ?? null,
    icon: input.icon ?? null,
    image: input.image ?? null,
    description: input.description ?? null,
    external_link: input.externalLink ?? null,
    sort_order: input.sortOrder ?? 0,
    is_active: input.isActive ?? true,
  });

  await invalidateCatalogAndHomeCache();
  return mapCategory(row);
}

export async function updateAdminCategory(
  id: string,
  input: Partial<{
    slug: string;
    name: string;
    parentId: string | null;
    isBrand: boolean;
    brandLogoUrl: string | null;
    icon: string | null;
    image: string | null;
    description: string | null;
    externalLink: string | null;
    sortOrder: number;
    isActive: boolean;
  }>,
) {
  const row = await Category.findByPk(id);
  if (!row) {
    throw new NotFoundError('Category not found');
  }

  if (input.slug && input.slug !== row.slug) {
    await assertUniqueSlug(input.slug, id);
  }

  if (input.parentId) {
    if (input.parentId === id) {
      throw new ValidationError('Category cannot be its own parent');
    }
    const parent = await Category.findByPk(input.parentId);
    if (!parent) {
      throw new NotFoundError('Parent category not found');
    }
  }

  await row.update({
    ...(input.slug !== undefined ? { slug: input.slug } : {}),
    ...(input.name !== undefined ? { name: input.name } : {}),
    ...(input.parentId !== undefined ? { parent_id: input.parentId } : {}),
    ...(input.isBrand !== undefined ? { is_brand: input.isBrand } : {}),
    ...(input.brandLogoUrl !== undefined ? { brand_logo_url: input.brandLogoUrl } : {}),
    ...(input.icon !== undefined ? { icon: input.icon } : {}),
    ...(input.image !== undefined ? { image: input.image } : {}),
    ...(input.description !== undefined ? { description: input.description } : {}),
    ...(input.externalLink !== undefined ? { external_link: input.externalLink } : {}),
    ...(input.sortOrder !== undefined ? { sort_order: input.sortOrder } : {}),
    ...(input.isActive !== undefined ? { is_active: input.isActive } : {}),
  });

  await invalidateCatalogAndHomeCache();
  return mapCategory(row);
}

export async function deleteAdminCategory(id: string) {
  const row = await Category.findByPk(id);
  if (!row) {
    throw new NotFoundError('Category not found');
  }
  await row.destroy();
  await invalidateCatalogAndHomeCache();
}

export async function restoreAdminCategory(id: string) {
  const row = await Category.findByPk(id, { paranoid: false });
  if (!row) {
    throw new NotFoundError('Category not found');
  }
  await row.restore();
  await invalidateCatalogAndHomeCache();
  return mapCategory(row);
}
