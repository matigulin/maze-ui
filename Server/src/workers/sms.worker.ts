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

interface SmsJobData {
  phone: string;
  code: string;
}

async function processSmsJob(job: Job<SmsJobData>) {
  const { phone, code } = job.data;
  const env = loadEnv();

  if (env.SMS_API_KEY) {
    job.log(`Sending SMS OTP to ${phone}`);
    // Provider integration — phase 2
    return;
  }

  const line = `[dev][sms] OTP for ${phone}: ${code}`;
  job.log(line);
  console.info(line);
}

export function startSmsWorker(): Worker<SmsJobData> {
  const retry = RETRY.bullmq.sms;

  return new Worker<SmsJobData>(
    QUEUE_NAMES.sms,
    processSmsJob,
    {
      connection: getConnectionOptions(),
      concurrency: 5,
      settings: {
        backoffStrategy: (attemptsMade: number) => {
          const delays = retry.backoff.delay;
          return delays[Math.min(attemptsMade - 1, delays.length - 1)] ?? delays.at(-1)!;
        },
      },
    },
  );
}
