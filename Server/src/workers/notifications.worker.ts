import { Worker, type Job } from 'bullmq';
import { loadEnv } from '../config/env.js';
import { RETRY } from '../config/retry.js';
import { QUEUE_NAMES } from '../queues/index.js';

function getConnectionOptions() {
  const env = loadEnv();
  return {
    url: env.REDIS_URL,
    maxRetriesPerRequest: null,
  };
}

interface NotificationJobData {
  orderId?: string;
  orderNumber?: string;
  customerPhone?: string;
  totalRub?: number;
}

async function processNotificationJob(job: Job<NotificationJobData>) {
  job.log(`Notify manager about order ${job.data.orderNumber ?? job.data.orderId ?? 'unknown'}`);
}

export function startNotificationsWorker(): Worker<NotificationJobData> {
  const retry = RETRY.bullmq.notifications;

  return new Worker<NotificationJobData>(
    QUEUE_NAMES.notifications,
    processNotificationJob,
    {
      connection: getConnectionOptions(),
      concurrency: 3,
      settings: {
        backoffStrategy: (attemptsMade: number) => retry.backoff.delay * Math.max(1, attemptsMade),
      },
    },
  );
}
