'use strict';

const { seedUuid } = require('./lib/seed-ids.cjs');
const { now } = require('./lib/now.cjs');

const ACCESSORIES = [
  { category: 'glass', name: 'Защитное стекло', price: 1990 },
  { category: 'glass', name: 'Стекло Premium', price: 3490 },
  { category: 'case', name: 'Силиконовый чехол', price: 2490 },
  { category: 'case', name: 'Кожаный чехол', price: 4990 },
  { category: 'charger', name: 'Блок питания 20W', price: 2990 },
  { category: 'charger', name: 'Блок питания 35W', price: 4490 },
];

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    const ts = now();
    const rows = ACCESSORIES.map((item) => ({
      id: seedUuid(`accessory:${item.category}:${item.name}`),
      name: item.name,
      category: item.category,
      price: item.price,
      image: null,
      is_active: true,
      created_at: ts,
      updated_at: ts,
    }));

    await queryInterface.bulkInsert('accessories', rows);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('accessories', null, {});
  },
};
