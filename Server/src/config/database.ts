import { Sequelize } from 'sequelize';
import { loadEnv } from './env.js';

let sequelize: Sequelize | null = null;

export function getSequelize(): Sequelize {
  if (!sequelize) {
    const env = loadEnv();
    sequelize = new Sequelize(env.DATABASE_URL, {
      dialect: 'postgres',
      logging: false,
      pool: { max: 20, min: 2, acquire: 30000 },
      define: {
        underscored: true,
        timestamps: true,
      },
    });
  }
  return sequelize;
}

export async function checkDatabaseConnection(): Promise<boolean> {
  try {
    await getSequelize().authenticate();
    return true;
  } catch {
    return false;
  }
}

export async function closeDatabase(): Promise<void> {
  if (sequelize) {
    await sequelize.close();
    sequelize = null;
  }
}
