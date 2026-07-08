'use strict';

const crypto = require('crypto');

const { loadJson } = require('./lib/load-json.cjs');
const { seedUuid } = require('./lib/seed-ids.cjs');
const { now } = require('./lib/now.cjs');

function fieldKey(groupName, label) {
  const hash = crypto.createHash('md5').update(`${groupName}|${label}`).digest('hex').slice(0, 24);
  return `f_${hash}`;
}

function makeSku(slug, variant) {
  const color = (variant.colorName || variant.color || 'default')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
  const memory = (variant.memory || 'std').toLowerCase();
  return `${slug}-${memory}-${color}`.slice(0, 100);
}

function colorHex(product, colorName) {
  const match = (product.colors || []).find((c) => c.name === colorName);
  return match?.hex ?? '#000000';
}

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    const products = loadJson('products.json');
    const ts = now();

    const [categoryRows] = await queryInterface.sequelize.query(
      'SELECT id, slug FROM categories',
    );
    const categoryIdBySlug = Object.fromEntries(categoryRows.map((row) => [row.slug, row.id]));

    const productRows = [];
    const variantRows = [];
    const stockRows = [];
    const imageRows = [];
    const featureRows = [];
    const specFieldRows = [];
    const specValueRows = [];
    const specFieldIdByKey = new Map();

    for (const product of products) {
      const productId = seedUuid(`product:${product.slug}`);
      const categoryId = categoryIdBySlug[product.category];
      const subcategoryId = categoryIdBySlug[product.subcategory];

      if (!categoryId || !subcategoryId) {
        throw new Error(
          `Missing category mapping for product ${product.slug}: ${product.category}/${product.subcategory}`,
        );
      }

      productRows.push({
        id: productId,
        slug: product.slug,
        name: product.name,
        category_id: categoryId,
        subcategory_id: subcategoryId,
        device_type: product.deviceType,
        description: product.description ?? null,
        base_price: product.price,
        old_price: product.oldPrice ?? null,
        badge_type: product.badge?.type ?? null,
        badge_text: product.badge?.text ?? null,
        is_published: true,
        in_stock: product.inStock !== false,
        rating_avg: product.rating ?? 0,
        reviews_count: product.reviews ?? 0,
        deleted_at: null,
        created_at: ts,
        updated_at: ts,
      });

      for (const [imageIndex, url] of (product.images || []).entries()) {
        imageRows.push({
          id: seedUuid(`product-image:${product.slug}:${imageIndex}`),
          product_id: productId,
          url,
          sort_order: imageIndex,
          is_primary: imageIndex === 0,
          created_at: ts,
          updated_at: ts,
        });
      }

      for (const [featureIndex, feature] of (product.features || []).entries()) {
        featureRows.push({
          id: seedUuid(`product-feature:${product.slug}:${featureIndex}`),
          product_id: productId,
          title: feature.title,
          description: feature.description,
          icon_url: feature.icon ?? null,
          sort_order: featureIndex,
          created_at: ts,
          updated_at: ts,
        });
      }

      let specSortOrder = 0;
      for (const [groupName, fields] of Object.entries(product.specifications || {})) {
        for (const [label, value] of Object.entries(fields)) {
          const key = `${product.deviceType}:${fieldKey(groupName, label)}`;
          let fieldId = specFieldIdByKey.get(key);

          if (!fieldId) {
            fieldId = seedUuid(`spec-field:${key}`);
            specFieldIdByKey.set(key, fieldId);
            specFieldRows.push({
              id: fieldId,
              device_type: product.deviceType,
              group_name: groupName,
              field_key: fieldKey(groupName, label),
              field_label: label,
              sort_order: specSortOrder++,
              created_at: ts,
              updated_at: ts,
            });
          }

          specValueRows.push({
            product_id: productId,
            field_id: fieldId,
            value: String(value),
            created_at: ts,
            updated_at: ts,
          });
        }
      }

      for (const variant of product.variants || []) {
        const variantId = seedUuid(
          `variant:${product.slug}:${variant.memory || 'na'}:${variant.colorName || variant.color}`,
        );
        const colorName = variant.colorName || variant.color;

        variantRows.push({
          id: variantId,
          product_id: productId,
          sku: makeSku(product.slug, variant),
          color_name: colorName,
          color_hex: colorHex(product, colorName),
          memory: variant.memory ?? null,
          price: variant.price ?? product.price,
          is_available: (variant.stock ?? 0) > 0,
          deleted_at: null,
          created_at: ts,
          updated_at: ts,
        });

        stockRows.push({
          variant_id: variantId,
          quantity: variant.stock ?? 0,
          reserved_quantity: 0,
          created_at: ts,
          updated_at: ts,
        });
      }
    }

    await queryInterface.bulkInsert('products', productRows);
    await queryInterface.bulkInsert('product_variants', variantRows);
    await queryInterface.bulkInsert('stock', stockRows);
    await queryInterface.bulkInsert('product_images', imageRows);
    await queryInterface.bulkInsert('product_features', featureRows);
    if (specFieldRows.length > 0) {
      await queryInterface.bulkInsert('spec_field_definitions', specFieldRows);
    }
    if (specValueRows.length > 0) {
      await queryInterface.bulkInsert('product_spec_values', specValueRows);
    }
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('product_spec_values', null, {});
    await queryInterface.bulkDelete('spec_field_definitions', null, {});
    await queryInterface.bulkDelete('product_features', null, {});
    await queryInterface.bulkDelete('product_images', null, {});
    await queryInterface.bulkDelete('stock', null, {});
    await queryInterface.bulkDelete('product_variants', null, {});
    await queryInterface.bulkDelete('products', null, {});
  },
};
