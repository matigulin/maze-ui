'use strict';

const { loadJson } = require('./lib/load-json.cjs');
const { seedUuid } = require('./lib/seed-ids.cjs');
const { now } = require('./lib/now.cjs');

const BRAND_SLUGS = new Set(['apple', 'samsung', 'dyson', 'marshall', 'harman']);

const BRAND_LOGO = {
  apple: 'Apple',
  samsung: 'Samsung',
  dyson: 'Dyson',
  marshall: 'Marshall',
  harman: 'Harman',
};

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    const tree = loadJson('categories.json');
    const ts = now();
    const rows = [];
    let sortOrder = 0;

    for (const root of tree) {
      const rootId = seedUuid(`category:${root.slug}`);
      rows.push({
        id: rootId,
        slug: root.slug,
        name: root.name,
        parent_id: null,
        is_brand: BRAND_SLUGS.has(root.slug),
        brand_logo_url: BRAND_LOGO[root.slug] ?? null,
        icon: root.icon ?? null,
        image: root.image ?? null,
        description: root.description ?? null,
        sort_order: sortOrder++,
        is_active: true,
        external_link: root.externalLink ?? null,
        deleted_at: null,
        created_at: ts,
        updated_at: ts,
      });

      for (const child of root.children ?? []) {
        rows.push({
          id: seedUuid(`category:${child.slug}`),
          slug: child.slug,
          name: child.name,
          parent_id: rootId,
          is_brand: false,
          brand_logo_url: null,
          icon: child.icon ?? null,
          image: child.image ?? null,
          description: null,
          sort_order: sortOrder++,
          is_active: true,
          external_link: null,
          deleted_at: null,
          created_at: ts,
          updated_at: ts,
        });
      }
    }

    await queryInterface.bulkInsert('categories', rows);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('categories', null, {});
  },
};
