'use strict';

require('dotenv').config();
const bcrypt = require('bcryptjs');
const { Sequelize } = require('sequelize');
const { seedUuid } = require('../src/seeders/lib/seed-ids.cjs');

const STAFF = [
  {
    id: seedUuid('staff:manager-demo'),
    email: 'manager@maze.ru',
    role: 'manager',
    first_name: 'Демо',
    last_name: 'Менеджер',
  },
  {
    id: seedUuid('staff:admin-demo'),
    email: 'admin@maze.ru',
    role: 'admin',
    first_name: 'Демо',
    last_name: 'Админ',
  },
];

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.log('[bootstrap-staff] DATABASE_URL missing, skip');
    return;
  }

  const isProd = process.env.NODE_ENV === 'production';
  const sequelize = new Sequelize(url, {
    logging: false,
    dialect: 'postgres',
    dialectOptions: isProd
      ? { ssl: { require: true, rejectUnauthorized: false } }
      : undefined,
  });

  const passwordHash = bcrypt.hashSync('manager123', 12);

  try {
    for (const staff of STAFF) {
      // UPSERT: не удаляем staff — иначе ломается FK (manager_notes и др.)
      await sequelize.query(
        `INSERT INTO staff_users (
          id, email, password_hash, role, first_name, last_name,
          is_active, deleted_at, created_at, updated_at
        ) VALUES (
          :id, :email, :passwordHash, :role, :first_name, :last_name,
          true, NULL, NOW(), NOW()
        )
        ON CONFLICT (email) DO UPDATE SET
          password_hash = EXCLUDED.password_hash,
          role = EXCLUDED.role,
          first_name = EXCLUDED.first_name,
          last_name = EXCLUDED.last_name,
          is_active = true,
          deleted_at = NULL,
          updated_at = NOW()`,
        {
          replacements: { ...staff, passwordHash },
        },
      );
      console.log(`[bootstrap-staff] upserted ${staff.email}`);
    }
  } finally {
    await sequelize.close();
  }
}

main().catch((err) => {
  console.error('[bootstrap-staff] failed', err);
  process.exit(1);
});
