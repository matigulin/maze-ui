'use strict';

const { loadJson } = require('./lib/load-json.cjs');
const { now } = require('./lib/now.cjs');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    const config = loadJson('site-config.json');
    const ts = now();

    await queryInterface.sequelize.query(
      `INSERT INTO site_settings (key, value, created_at, updated_at)
       VALUES (:key, :value::jsonb, :createdAt, :updatedAt)`,
      {
        replacements: {
          key: 'public',
          value: JSON.stringify(config),
          createdAt: ts,
          updatedAt: ts,
        },
      },
    );
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('site_settings', { key: 'public' }, {});
  },
};
