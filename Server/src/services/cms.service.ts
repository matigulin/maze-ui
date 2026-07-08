import { NotFoundError } from '../lib/errors.js';
import { CmsPage } from '../models/content.js';
import { cache } from './cache.service.js';

export interface CmsPageDto {
  slug: string;
  title: string;
  content: string;
  metaDescription: string | null;
}

function mapCmsPage(row: CmsPage): CmsPageDto {
  return {
    slug: row.slug,
    title: row.title,
    content: row.content,
    metaDescription: row.meta_description,
  };
}

async function loadCmsPage(slug: string): Promise<CmsPageDto> {
  const row = await CmsPage.findOne({
    where: { slug, is_published: true },
    attributes: ['slug', 'title', 'content', 'meta_description'],
  });

  if (!row) {
    throw new NotFoundError('CMS page not found');
  }

  return mapCmsPage(row);
}

export async function getCmsPage(slug: string): Promise<CmsPageDto> {
  return cache.getOrSet(`cms:page:${slug}`, 30 * 60, () => loadCmsPage(slug));
}
