import type { Transaction } from 'sequelize';
import { getSequelize } from '../config/database.js';
import { RETRY } from '../config/retry.js';

export async function runInTransaction<T>(
  fn: (transaction: Transaction) => Promise<T>,
): Promise<T> {
  const sequelize = getSequelize();
  const { maxAttempts, delaysMs } = RETRY.transaction.deadlock;

  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    try {
      return await sequelize.transaction(fn);
    } catch (error) {
      const code = (error as { parent?: { code?: string } }).parent?.code;
      if (code === '40P01' && attempt < maxAttempts - 1) {
        await new Promise((resolve) => setTimeout(resolve, delaysMs[attempt]));
        continue;
      }
      throw error;
    }
  }

  throw new Error('Transaction failed after retries');
}
