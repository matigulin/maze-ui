import { describe, expect, it } from 'vitest';
import {
  ORDER_PENDING_RESERVE_TTL_MS,
  STOCK_CLEANUP_INTERVAL_MS,
} from '../lib/constants.js';

describe('stock cleanup constants', () => {
  it('uses 24h pending reserve TTL', () => {
    expect(ORDER_PENDING_RESERVE_TTL_MS).toBe(24 * 60 * 60 * 1000);
  });

  it('runs cleanup every 15 minutes', () => {
    expect(STOCK_CLEANUP_INTERVAL_MS).toBe(15 * 60 * 1000);
  });
});
