'use strict';

const { createEnum, dropEnum } = require('./lib/helpers.cjs');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await createEnum(queryInterface, 'user_gender', ['male', 'female']);
    await createEnum(queryInterface, 'address_type', ['home', 'work']);
    await createEnum(queryInterface, 'consent_channel', ['email', 'sms']);
    await createEnum(queryInterface, 'staff_role', ['manager', 'admin']);

    await queryInterface.createTable('users', {
      id: {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
      },
      phone: { type: Sequelize.STRING(20), allowNull: false, unique: true },
      first_name: { type: Sequelize.STRING(100), allowNull: true },
      last_name: { type: Sequelize.STRING(100), allowNull: true },
      middle_name: { type: Sequelize.STRING(100), allowNull: true },
      email: { type: Sequelize.STRING(255), allowNull: true },
      birth_date: { type: Sequelize.DATEONLY, allowNull: true },
      subscribe_email: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
      subscribe_sms: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
      deleted_at: { type: Sequelize.DATE, allowNull: true },
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false },
    });

    await queryInterface.sequelize.query(`
      ALTER TABLE users ADD COLUMN gender user_gender;
    `);

    await queryInterface.createTable('sms_verifications', {
      id: {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
      },
      phone: { type: Sequelize.STRING(20), allowNull: false },
      code_hash: { type: Sequelize.STRING(255), allowNull: false },
      expires_at: { type: Sequelize.DATE, allowNull: false },
      attempts: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 0 },
      verified_at: { type: Sequelize.DATE, allowNull: true },
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false },
    });

    await queryInterface.sequelize.query(`
      CREATE TABLE user_addresses (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON UPDATE CASCADE ON DELETE RESTRICT,
        type address_type NOT NULL,
        city VARCHAR(255) NOT NULL,
        street VARCHAR(255) NOT NULL,
        house VARCHAR(50) NOT NULL,
        building VARCHAR(50),
        apartment VARCHAR(50),
        floor VARCHAR(20),
        is_default BOOLEAN NOT NULL DEFAULT false,
        deleted_at TIMESTAMPTZ,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);

    await queryInterface.sequelize.query(`
      CREATE TABLE user_consents (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON UPDATE CASCADE ON DELETE RESTRICT,
        channel consent_channel NOT NULL,
        granted BOOLEAN NOT NULL,
        ip_address VARCHAR(45),
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);

    await queryInterface.createTable('user_companies', {
      id: {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
      },
      user_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'users', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      },
      name: { type: Sequelize.STRING(255), allowNull: false },
      inn: { type: Sequelize.STRING(12), allowNull: false },
      kpp: { type: Sequelize.STRING(9), allowNull: true },
      legal_address: { type: Sequelize.TEXT, allowNull: false },
      deleted_at: { type: Sequelize.DATE, allowNull: true },
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false },
    });

    await queryInterface.sequelize.query(`
      CREATE TABLE staff_users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email VARCHAR(255) NOT NULL UNIQUE,
        password_hash VARCHAR(255) NOT NULL,
        role staff_role NOT NULL,
        first_name VARCHAR(100),
        last_name VARCHAR(100),
        is_active BOOLEAN NOT NULL DEFAULT true,
        deleted_at TIMESTAMPTZ,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);

    await queryInterface.createTable('staff_login_attempts', {
      id: {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
      },
      staff_user_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: { model: 'staff_users', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      email: { type: Sequelize.STRING(255), allowNull: false },
      ip: { type: Sequelize.STRING(45), allowNull: false },
      user_agent: { type: Sequelize.TEXT, allowNull: true },
      success: { type: Sequelize.BOOLEAN, allowNull: false },
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('staff_login_attempts');
    await queryInterface.dropTable('staff_users');
    await queryInterface.dropTable('user_companies');
    await queryInterface.dropTable('user_consents');
    await queryInterface.dropTable('user_addresses');
    await queryInterface.dropTable('sms_verifications');
    await queryInterface.dropTable('users');
    await dropEnum(queryInterface, 'staff_role');
    await dropEnum(queryInterface, 'consent_channel');
    await dropEnum(queryInterface, 'address_type');
    await dropEnum(queryInterface, 'user_gender');
  },
};
