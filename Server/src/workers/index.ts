import type { Worker } from 'bullmq';
import { startDeliveryWorker } from './delivery.worker.js';
import { startNotificationsWorker } from './notifications.worker.js';
import { startOutboxPoller } from './outbox.worker.js';
import { scheduleStockCleanup, startStockWorker } from './stock.worker.js';
import { startSmsWorker } from './sms.worker.js';

let smsWorker: Worker | null = null;
let deliveryWorker: Worker | null = null;
let notificationsWorker: Worker | null = null;
let stockWorker: Worker | null = null;
let outboxTimer: NodeJS.Timeout | null = null;

export function startWorkers(): void {
  if (process.env.NODE_ENV === 'test') {
    return;
  }

  smsWorker = startSmsWorker();
  smsWorker.on('failed', (job, error) => {
    console.error('[sms-worker] job failed', job?.id, error.message);
  });

  deliveryWorker = startDeliveryWorker();
  deliveryWorker.on('failed', (job, error) => {
    console.error('[delivery-worker] job failed', job?.id, error.message);
  });

  notificationsWorker = startNotificationsWorker();
  notificationsWorker.on('failed', (job, error) => {
    console.error('[notifications-worker] job failed', job?.id, error.message);
  });

  stockWorker = startStockWorker();
  stockWorker.on('failed', (job, error) => {
    console.error('[stock-worker] job failed', job?.id, error.message);
  });
  void scheduleStockCleanup().catch((error) => {
    console.error('[stock-worker] failed to schedule cleanup', error);
  });

  outboxTimer = startOutboxPoller();
}

export async function stopWorkers(): Promise<void> {
  if (outboxTimer) {
    clearInterval(outboxTimer);
    outboxTimer = null;
  }

  if (notificationsWorker) {
    await notificationsWorker.close();
    notificationsWorker = null;
  }

  if (stockWorker) {
    await stockWorker.close();
    stockWorker = null;
  }

  if (deliveryWorker) {
    await deliveryWorker.close();
    deliveryWorker = null;
  }

  if (smsWorker) {
    await smsWorker.close();
    smsWorker = null;
  }
}
