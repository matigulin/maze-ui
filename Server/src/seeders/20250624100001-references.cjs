'use strict';

const { buildReferenceRows } = require('./lib/references-data.cjs');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    const { paymentMethods, deliveryProviders, deliveryRates } = buildReferenceRows();

    await queryInterface.bulkInsert('payment_methods', paymentMethods);
    await queryInterface.bulkInsert('delivery_providers', deliveryProviders);
    await queryInterface.bulkInsert('delivery_rates', deliveryRates);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('delivery_rates', null, {});
    await queryInterface.bulkDelete('delivery_providers', null, {});
    await queryInterface.bulkDelete('payment_methods', null, {});
  },
};
