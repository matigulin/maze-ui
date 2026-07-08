'use strict';

const { createEnum, dropEnum } = require('./lib/helpers.cjs');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await createEnum(queryInterface, 'device_type', [
      'smartphone',
      'watch',
      'tablet',
      'macbook',
      'accessory',
      'other',
    ]);
    await createEnum(queryInterface, 'badge_type', ['default', 'sale', 'new']);

    await queryInterface.createTable('categories', {
      id: {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
      },
      slug: { type: Sequelize.STRING(120), allowNull: false, unique: true },
      name: { type: Sequelize.STRING(255), allowNull: false },
      parent_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: { model: 'categories', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      },
      is_brand: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
      brand_logo_url: { type: Sequelize.STRING(500), allowNull: true },
      icon: { type: Sequelize.STRING(255), allowNull: true },
      image: { type: Sequelize.STRING(500), allowNull: true },
      description: { type: Sequelize.TEXT, allowNull: true },
      sort_order: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 0 },
      is_active: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: true },
      external_link: { type: Sequelize.STRING(500), allowNull: true },
      deleted_at: { type: Sequelize.DATE, allowNull: true },
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false },
    });

    await queryInterface.sequelize.query(`
      CREATE TABLE products (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        slug VARCHAR(200) NOT NULL UNIQUE,
        name VARCHAR(500) NOT NULL,
        category_id UUID NOT NULL REFERENCES categories(id) ON UPDATE CASCADE ON DELETE RESTRICT,
        subcategory_id UUID NOT NULL REFERENCES categories(id) ON UPDATE CASCADE ON DELETE RESTRICT,
        device_type device_type NOT NULL,
        description TEXT,
        base_price DECIMAL(12, 2) NOT NULL,
        old_price DECIMAL(12, 2),
        badge_type badge_type,
        badge_text VARCHAR(100),
        is_published BOOLEAN NOT NULL DEFAULT false,
        in_stock BOOLEAN NOT NULL DEFAULT true,
        rating_avg DECIMAL(3, 2) NOT NULL DEFAULT 0,
        reviews_count INTEGER NOT NULL DEFAULT 0,
        deleted_at TIMESTAMPTZ,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);

    await queryInterface.createTable('product_variants', {
      id: {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
      },
      product_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'products', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      },
      sku: { type: Sequelize.STRING(100), allowNull: false, unique: true },
      color_name: { type: Sequelize.STRING(100), allowNull: false },
      color_hex: { type: Sequelize.STRING(7), allowNull: false },
      memory: { type: Sequelize.STRING(50), allowNull: true },
      price: { type: Sequelize.DECIMAL(12, 2), allowNull: false },
      is_available: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: true },
      deleted_at: { type: Sequelize.DATE, allowNull: true },
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false },
    });

    await queryInterface.createTable('stock', {
      variant_id: {
        type: Sequelize.UUID,
        primaryKey: true,
        references: { model: 'product_variants', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      quantity: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 0 },
      reserved_quantity: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 0 },
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false },
    });

    await queryInterface.createTable('product_images', {
      id: {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
      },
      product_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'products', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      url: { type: Sequelize.STRING(500), allowNull: false },
      sort_order: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 0 },
      is_primary: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false },
    });

    await queryInterface.createTable('product_features', {
      id: {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
      },
      product_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'products', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      title: { type: Sequelize.STRING(255), allowNull: false },
      description: { type: Sequelize.TEXT, allowNull: false },
      icon_url: { type: Sequelize.STRING(500), allowNull: true },
      sort_order: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 0 },
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false },
    });

    await queryInterface.sequelize.query(`
      CREATE TABLE spec_field_definitions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        device_type device_type NOT NULL,
        group_name VARCHAR(100) NOT NULL,
        field_key VARCHAR(100) NOT NULL,
        field_label VARCHAR(255) NOT NULL,
        sort_order INTEGER NOT NULL DEFAULT 0,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        UNIQUE (device_type, field_key)
      );
    `);

    await queryInterface.createTable('product_spec_values', {
      product_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'products', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      field_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'spec_field_definitions', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      value: { type: Sequelize.TEXT, allowNull: false },
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false },
    });

    await queryInterface.addConstraint('product_spec_values', {
      fields: ['product_id', 'field_id'],
      type: 'primary key',
      name: 'pk_product_spec_values',
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('product_spec_values');
    await queryInterface.dropTable('spec_field_definitions');
    await queryInterface.dropTable('product_features');
    await queryInterface.dropTable('product_images');
    await queryInterface.dropTable('stock');
    await queryInterface.dropTable('product_variants');
    await queryInterface.dropTable('products');
    await queryInterface.dropTable('categories');
    await dropEnum(queryInterface, 'badge_type');
    await dropEnum(queryInterface, 'device_type');
  },
};
