import { describe, expect, it } from 'vitest';
import { MANAGER_ORDER_STATUSES } from '../services/manager-orders.service.js';

describe('MANAGER_ORDER_STATUSES', () => {
  it('includes paid and cancelled', () => {
    expect(MANAGER_ORDER_STATUSES).toContain('paid');
    expect(MANAGER_ORDER_STATUSES).toContain('cancelled');
  });
});
