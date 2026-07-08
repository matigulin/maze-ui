'use strict';

const bcrypt = require('bcrypt');
const { seedUuid } = require('./lib/seed-ids.cjs');
const { now } = require('./lib/now.cjs');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    const ts = now();
    const passwordHash = bcrypt.hashSync('manager123', 12);

    await queryInterface.bulkInsert('staff_users', [
      {
        id: seedUuid('staff:manager-demo'),
        email: 'manager@maze.ru',
        password_hash: passwordHash,
        role: 'manager',
        first_name: 'Демо',
        last_name: 'Менеджер',
        is_active: true,
        deleted_at: null,
        created_at: ts,
        updated_at: ts,
      },
      {
        id: seedUuid('staff:admin-demo'),
        email: 'admin@maze.ru',
        password_hash: passwordHash,
        role: 'admin',
        first_name: 'Демо',
        last_name: 'Админ',
        is_active: true,
        deleted_at: null,
        created_at: ts,
        updated_at: ts,
      },
    ]);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('staff_users', { email: 'manager@maze.ru' }, {});
    await queryInterface.bulkDelete('staff_users', { email: 'admin@maze.ru' }, {});
  },
};
