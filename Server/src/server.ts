import 'dotenv/config';
import { buildApp } from './app.js';
import { closeDatabase } from './config/database.js';
import { loadEnv } from './config/env.js';
import { closeRedis } from './config/redis.js';
import { closeQueues } from './queues/index.js';
import { startWorkers, stopWorkers } from './workers/index.js';

async function main() {
  const env = loadEnv();
  const app = await buildApp();

  try {
    startWorkers();
    await app.listen({ port: env.PORT, host: env.HOST });
    app.log.info(`MAZE API listening on http://${env.HOST}:${env.PORT}`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }

  const shutdown = async (signal: string) => {
    app.log.info(`Received ${signal}, shutting down`);
    await app.close();
    await stopWorkers();
    await closeQueues();
    await closeRedis();
    await closeDatabase();
    process.exit(0);
  };

  process.on('SIGINT', () => void shutdown('SIGINT'));
  process.on('SIGTERM', () => void shutdown('SIGTERM'));
}

main();
