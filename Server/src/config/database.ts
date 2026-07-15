import { Sequelize } from 'sequelize';
import { loadEnv } from './env.js';

let sequelize: Sequelize | null = null;

function postgresDialectOptions(nodeEnv: string) {
  // Railway / managed Postgres: TLS required; local docker/dev usually plain.
  if (nodeEnv !== 'production') return undefined;
  return {
    ssl: {
      require: true,
      rejectUnauthorized: false,
    },
  };
}

export function getSequelize(): Sequelize {
  if (!sequelize) {
    const env = loadEnv();
    sequelize = new Sequelize(env.DATABASE_URL, {
      dialect: 'postgres',
      logging: false,
      pool: { max: 20, min: 2, acquire: 30000 },
      dialectOptions: postgresDialectOptions(env.NODE_ENV),
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
