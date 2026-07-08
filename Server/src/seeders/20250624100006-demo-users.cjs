'use strict';

const { loadJson } = require('./lib/load-json.cjs');
const { seedUuid } = require('./lib/seed-ids.cjs');
const { now } = require('./lib/now.cjs');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    const users = loadJson('users.json');
    const ts = now();
    const userRows = [];
    const addressRows = [];
    const consentRows = [];

    for (const user of users) {
      const userId = seedUuid(`user:${user.id}`);

      userRows.push({
        id: userId,
        phone: user.phone,
        first_name: user.firstName ?? null,
        last_name: user.lastName ?? null,
        middle_name: user.middleName ?? null,
        email: user.email ?? null,
        birth_date: user.birthDate ?? null,
        gender: user.gender ?? null,
        subscribe_email: user.subscribeEmail ?? false,
        subscribe_sms: user.subscribeSMS ?? false,
        deleted_at: null,
        created_at: ts,
        updated_at: ts,
      });

      if (user.subscribeEmail) {
        consentRows.push({
          id: seedUuid(`consent:${user.id}:email`),
          user_id: userId,
          channel: 'email',
          granted: true,
          ip_address: null,
          created_at: ts,
          updated_at: ts,
        });
      }

      if (user.subscribeSMS) {
        consentRows.push({
          id: seedUuid(`consent:${user.id}:sms`),
          user_id: userId,
          channel: 'sms',
          granted: true,
          ip_address: null,
          created_at: ts,
          updated_at: ts,
        });
      }

      for (const [index, address] of (user.addresses || []).entries()) {
        addressRows.push({
          id: seedUuid(`address:${address.id}`),
          user_id: userId,
          type: address.type,
          city: address.city,
          street: address.street,
          house: address.house,
          building: address.building ?? null,
          apartment: address.apartment ?? null,
          floor: address.floor ?? null,
          is_default: index === 0,
          deleted_at: null,
          created_at: ts,
          updated_at: ts,
        });
      }
    }

    await queryInterface.bulkInsert('users', userRows);
    if (addressRows.length > 0) {
      await queryInterface.bulkInsert('user_addresses', addressRows);
    }
    if (consentRows.length > 0) {
      await queryInterface.bulkInsert('user_consents', consentRows);
    }
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('user_consents', null, {});
    await queryInterface.bulkDelete('user_addresses', null, {});
    await queryInterface.bulkDelete('users', null, {});
  },
};
