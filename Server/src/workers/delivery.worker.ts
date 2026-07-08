import { Worker, type Job } from 'bullmq';
import { loadEnv } from '../config/env.js';
import { RETRY } from '../config/retry.js';
import { processDeliveryQuoteJob } from '../services/delivery-quote.service.js';
import { QUEUE_NAMES } from '../queues/index.js';

function getConnectionOptions() {
  const env = loadEnv();
  return {
    url: env.REDIS_URL,
    maxRetriesPerRequest: null,
  };
}

interface DeliveryJobData {
  quoteId: string;
}

async function processDeliveryJob(job: Job<DeliveryJobData>) {
  const { quoteId } = job.data;
  await processDeliveryQuoteJob(quoteId);
  job.log(`Quote ${quoteId} calculated`);
}

export function startDeliveryWorker(): Worker<DeliveryJobData> {
  const retry = RETRY.bullmq.delivery;

  return new Worker<DeliveryJobData>(
    QUEUE_NAMES.delivery,
    processDeliveryJob,
    {
      connection: getConnectionOptions(),
      concurrency: 3,
      settings: {
        backoffStrategy: (attemptsMade: number) => {
          const delay = retry.backoff.delay;
          return delay * Math.max(1, attemptsMade);
        },
      },
    },
  );
}
