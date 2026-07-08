import { paginationOffset, parsePagination } from '../lib/pagination.js';
import { StoreReview } from '../models/content.js';
import { cache } from './cache.service.js';

export interface ReviewItem {
  id: string;
  name: string;
  text: string;
  source: string;
  rating: number;
}

function mapReview(row: StoreReview): ReviewItem {
  return {
    id: row.id,
    name: row.author_name,
    text: row.text,
    source: row.source,
    rating: row.rating,
  };
}

async function fetchReviews(page: number, limit: number) {
  const offset = paginationOffset({ page, limit });

  const { rows, count } = await StoreReview.findAndCountAll({
    where: { is_active: true },
    order: [['sort_order', 'ASC'], ['created_at', 'DESC']],
    limit,
    offset,
    attributes: ['id', 'author_name', 'text', 'source', 'rating'],
  });

  return {
    items: rows.map(mapReview),
    meta: { page, limit, total: count },
  };
}

export async function listReviews(query: Record<string, unknown>) {
  const { page, limit } = parsePagination(query);
  const cacheKey = `reviews:list:${page}:${limit}`;

  return cache.getOrSet(cacheKey, 10 * 60, () => fetchReviews(page, limit));
}

export async function listAllActiveReviews(): Promise<ReviewItem[]> {
  const rows = await StoreReview.findAll({
    where: { is_active: true },
    order: [['sort_order', 'ASC']],
    attributes: ['id', 'author_name', 'text', 'source', 'rating'],
  });

  return rows.map(mapReview);
}
