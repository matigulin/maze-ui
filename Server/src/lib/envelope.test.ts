import { describe, expect, it } from 'vitest';
import { success } from '../lib/envelope.js';

describe('envelope', () => {
  it('wraps data with requestId', () => {
    const result = success({ ok: true }, 'req-1');
    expect(result).toEqual({ data: { ok: true }, requestId: 'req-1' });
  });
});
