/** @see docs/IMPLEMENTATION_DECISIONS.md §15 — единственный источник retry-чисел */

export const RETRY = {
  bullmq: {
    sms: { attempts: 3, backoff: { type: 'fixed' as const, delay: [5000, 30000] } },
    delivery: { attempts: 3, backoff: { type: 'exponential' as const, delay: 5000 } },
    notifications: { attempts: 3, backoff: { type: 'exponential' as const, delay: 10000 } },
    outbox: { attempts: 1 },
    stock: { attempts: 1 },
  },
  transaction: {
    deadlock: { maxAttempts: 3, delaysMs: [10, 50, 150] as const },
    timeoutMs: 5000,
  },
  http: {
    sms: { attempts: 2, timeoutMs: 5000, delaysMs: [5000, 30000] as const },
    cdek: { attempts: 3, timeoutMs: 8000, delaysMs: [5000, 15000, 45000] as const },
    yandex: { attempts: 3, timeoutMs: 8000, delaysMs: [5000, 15000, 45000] as const },
    s3: { attempts: 2, timeoutMs: 30000, delaysMs: [2000, 10000] as const },
  },
} as const;
