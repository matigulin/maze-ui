'use strict';

const { createEnum, dropEnum } = require('./lib/helpers.cjs');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await createEnum(queryInterface, 'accessory_category', ['glass', 'case', 'charger', 'other']);
    await createEnum(queryInterface, 'delivery_type', [
      'pickup',
      'spb_courier',
      'spb_yandex',
      'rf_cdek',
      'rf_yandex',
    ]);

    await queryInterface.createTable('payment_methods', {
      id: {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
      },
      code: { type: Sequelize.STRING(50), allowNull: false, unique: true },
      name: { type: Sequelize.STRING(255), allowNull: false },
      fee_percent: {
        type: Sequelize.DECIMAL(5, 2),
        allowNull: false,
        defaultValue: 0,
      },
      fee_fixed: {
        type: Sequelize.DECIMAL(12, 2),
        allowNull: false,
        defaultValue: 0,
      },
      is_active: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: true },
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false },
    });

    await queryInterface.createTable('delivery_providers', {
      id: {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
      },
      code: { type: Sequelize.STRING(50), allowNull: false, unique: true },
      name: { type: Sequelize.STRING(255), allowNull: false },
      is_active: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: true },
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false },
    });

    await queryInterface.sequelize.query(`
      CREATE TABLE delivery_rates (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        provider_id UUID NOT NULL REFERENCES delivery_providers(id) ON UPDATE CASCADE ON DELETE RESTRICT,
        delivery_type delivery_type NOT NULL,
        city_scope VARCHAR(100) NOT NULL,
        base_price DECIMAL(12, 2) NOT NULL DEFAULT 0,
        requires_prepay BOOLEAN NOT NULL DEFAULT false,
        fee_percent DECIMAL(5, 2) NOT NULL DEFAULT 0,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);

    await queryInterface.createTable('site_settings', {
      key: { type: Sequelize.STRING(100), primaryKey: true },
      value: { type: Sequelize.JSONB, allowNull: false },
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false },
    });

    await queryInterface.sequelize.query(`
      CREATE TABLE accessories (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255) NOT NULL,
        category accessory_category NOT NULL,
        price DECIMAL(12, 2) NOT NULL,
        image VARCHAR(500),
        is_active BOOLEAN NOT NULL DEFAULT true,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);
  },

  async down(queryInterface) {
    await queryInterface.dropTable('accessories');
    await queryInterface.dropTable('site_settings');
    await queryInterface.dropTable('delivery_rates');
    await queryInterface.dropTable('delivery_providers');
    await queryInterface.dropTable('payment_methods');
    await dropEnum(queryInterface, 'delivery_type');
    await dropEnum(queryInterface, 'accessory_category');
  },
};
