import { Queue } from 'bullmq';
import { loadEnv } from '../config/env.js';
import { RETRY } from '../config/retry.js';

export const QUEUE_NAMES = {
  outbox: 'outbox',
  sms: 'sms',
  delivery: 'delivery',
  notifications: 'notifications',
  stock: 'stock',
} as const;

export type QueueName = (typeof QUEUE_NAMES)[keyof typeof QUEUE_NAMES];

const queues = new Map<QueueName, Queue>();

function getConnectionOptions() {
  const env = loadEnv();
  return {
    url: env.REDIS_URL,
    maxRetriesPerRequest: null,
  };
}

export function getQueue(name: QueueName): Queue {
  let queue = queues.get(name);
  if (!queue) {
    const retry = RETRY.bullmq[name as keyof typeof RETRY.bullmq];
    const backoff =
      retry && 'backoff' in retry && retry.backoff?.type === 'exponential'
        ? { type: 'exponential' as const, delay: retry.backoff.delay }
        : undefined;

    queue = new Queue(name, {
      connection: getConnectionOptions(),
      defaultJobOptions: {
        attempts: retry?.attempts ?? 3,
        removeOnComplete: 100,
        removeOnFail: 500,
        ...(backoff ? { backoff } : {}),
      },
    });
    queues.set(name, queue);
  }
  return queue;
}

export async function closeQueues(): Promise<void> {
  await Promise.all([...queues.values()].map((q) => q.close()));
  queues.clear();
}
