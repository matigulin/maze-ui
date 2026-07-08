import { Worker, type Job } from 'bullmq';
import { loadEnv } from '../config/env.js';
import { STOCK_CLEANUP_INTERVAL_MS } from '../lib/constants.js';
import { getQueue, QUEUE_NAMES } from '../queues/index.js';
import { releaseExpiredPendingOrderReservations } from '../services/stock-cleanup.service.js';

function getConnectionOptions() {
  const env = loadEnv();
  return {
    url: env.REDIS_URL,
    maxRetriesPerRequest: null,
  };
}

async function processStockJob(job: Job) {
  const result = await releaseExpiredPendingOrderReservations();
  job.log(`Released ${result.processed} expired pending orders`);
  return result;
}

export function startStockWorker(): Worker {
  return new Worker(QUEUE_NAMES.stock, processStockJob, {
    connection: getConnectionOptions(),
    concurrency: 1,
  });
}

export async function scheduleStockCleanup(): Promise<void> {
  const queue = getQueue(QUEUE_NAMES.stock);
  await queue.add(
    'release-expired-reservations',
    {},
    {
      repeat: { every: STOCK_CLEANUP_INTERVAL_MS },
      jobId: 'stock:release-expired-reservations',
    },
  );
}
