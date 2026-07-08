import { z } from 'zod';
import { ValidationError } from './errors.js';

const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(48).default(24),
});

export type PaginationParams = z.infer<typeof paginationSchema>;

export function parsePagination(query: Record<string, unknown>): PaginationParams {
  const result = paginationSchema.safeParse(query);
  if (!result.success) {
    throw new ValidationError('Invalid pagination parameters');
  }
  return result.data;
}

export function paginationOffset({ page, limit }: PaginationParams): number {
  return (page - 1) * limit;
}
