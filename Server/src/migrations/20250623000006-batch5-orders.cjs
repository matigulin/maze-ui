'use strict';

const { createEnum, dropEnum } = require('./lib/helpers.cjs');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await createEnum(queryInterface, 'order_status', [
      'pending',
      'confirmed',
      'awaiting_payment',
      'paid',
      'shipping',
      'delivered',
      'cancelled',
    ]);
    await createEnum(queryInterface, 'outbox_event_status', [
      'pending',
      'processing',
      'done',
      'failed',
    ]);

    await queryInterface.sequelize.query(`
      CREATE TABLE orders (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        order_number VARCHAR(50) NOT NULL UNIQUE,
        user_id UUID REFERENCES users(id) ON UPDATE CASCADE ON DELETE SET NULL,
        assigned_manager_id UUID REFERENCES staff_users(id) ON UPDATE CASCADE ON DELETE SET NULL,
        customer_first_name VARCHAR(100) NOT NULL,
        customer_last_name VARCHAR(100) NOT NULL,
        customer_phone VARCHAR(20) NOT NULL,
        customer_email VARCHAR(255),
        status order_status NOT NULL DEFAULT 'pending',
        subtotal DECIMAL(12, 2) NOT NULL,
        delivery_price DECIMAL(12, 2) NOT NULL DEFAULT 0,
        payment_fee DECIMAL(12, 2) NOT NULL DEFAULT 0,
        installment_fee DECIMAL(12, 2) NOT NULL DEFAULT 0,
        total DECIMAL(12, 2) NOT NULL,
        comment TEXT,
        idempotency_key VARCHAR(64) UNIQUE,
        pricing_version VARCHAR(50) NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);

    await queryInterface.createTable('order_items', {
      id: {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
      },
      order_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'orders', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      },
      product_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'products', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      },
      variant_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: { model: 'product_variants', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      name: { type: Sequelize.STRING(500), allowNull: false },
      image: { type: Sequelize.STRING(500), allowNull: false },
      color: { type: Sequelize.STRING(100), allowNull: true },
      memory: { type: Sequelize.STRING(50), allowNull: true },
      unit_price: { type: Sequelize.DECIMAL(12, 2), allowNull: false },
      quantity: { type: Sequelize.INTEGER, allowNull: false },
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false },
    });

    await queryInterface.sequelize.query(`
      CREATE TABLE order_deliveries (
        order_id UUID PRIMARY KEY REFERENCES orders(id) ON UPDATE CASCADE ON DELETE RESTRICT,
        type delivery_type NOT NULL,
        city VARCHAR(255) NOT NULL,
        district VARCHAR(255),
        street VARCHAR(255) NOT NULL,
        house VARCHAR(50) NOT NULL,
        entrance VARCHAR(50),
        apartment VARCHAR(50),
        requires_prepay BOOLEAN NOT NULL DEFAULT false,
        tracking_number VARCHAR(100),
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);

    await queryInterface.createTable('order_payments', {
      order_id: {
        type: Sequelize.UUID,
        primaryKey: true,
        references: { model: 'orders', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      },
      payment_method_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'payment_methods', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      },
      fee_percent: { type: Sequelize.DECIMAL(5, 2), allowNull: false, defaultValue: 0 },
      fee_amount: { type: Sequelize.DECIMAL(12, 2), allowNull: false, defaultValue: 0 },
      is_paid: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
      paid_at: { type: Sequelize.DATE, allowNull: true },
      paid_amount: { type: Sequelize.DECIMAL(12, 2), allowNull: true },
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false },
    });

    await queryInterface.createTable('order_installment_bundles', {
      order_id: {
        type: Sequelize.UUID,
        primaryKey: true,
        references: { model: 'orders', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      },
      fee_amount: { type: Sequelize.DECIMAL(12, 2), allowNull: false, defaultValue: 5000 },
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false },
    });

    await queryInterface.createTable('installment_bundle_items', {
      id: {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
      },
      order_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'orders', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      accessory_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'accessories', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      },
      sort_order: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 0 },
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false },
    });

    await queryInterface.sequelize.query(`
      CREATE TABLE order_status_histories (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        order_id UUID NOT NULL REFERENCES orders(id) ON UPDATE CASCADE ON DELETE RESTRICT,
        from_status order_status,
        to_status order_status NOT NULL,
        staff_user_id UUID REFERENCES staff_users(id) ON UPDATE CASCADE ON DELETE SET NULL,
        note TEXT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);

    await queryInterface.createTable('delivery_quotes', {
      id: {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
      },
      provider: { type: Sequelize.STRING(50), allowNull: false },
      payload: { type: Sequelize.JSONB, allowNull: false },
      price: { type: Sequelize.DECIMAL(12, 2), allowNull: false },
      expires_at: { type: Sequelize.DATE, allowNull: false },
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false },
    });

    await queryInterface.sequelize.query(`
      CREATE TABLE outbox_events (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        event_type VARCHAR(100) NOT NULL,
        aggregate_type VARCHAR(50) NOT NULL,
        aggregate_id UUID NOT NULL,
        payload JSONB NOT NULL,
        status outbox_event_status NOT NULL DEFAULT 'pending',
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        processed_at TIMESTAMPTZ,
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);

    await queryInterface.createTable('manager_notes', {
      id: {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
      },
      order_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'orders', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      },
      staff_user_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'staff_users', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      },
      text: { type: Sequelize.TEXT, allowNull: false },
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('manager_notes');
    await queryInterface.dropTable('outbox_events');
    await queryInterface.dropTable('delivery_quotes');
    await queryInterface.dropTable('order_status_histories');
    await queryInterface.dropTable('installment_bundle_items');
    await queryInterface.dropTable('order_installment_bundles');
    await queryInterface.dropTable('order_payments');
    await queryInterface.dropTable('order_deliveries');
    await queryInterface.dropTable('order_items');
    await queryInterface.dropTable('orders');
    await dropEnum(queryInterface, 'outbox_event_status');
    await dropEnum(queryInterface, 'order_status');
  },
};
