'use strict';

const { loadJson } = require('./lib/load-json.cjs');
const { seedUuid } = require('./lib/seed-ids.cjs');
const { now } = require('./lib/now.cjs');

const INFO_SLIDES = [
  { icon: '🚚', title: 'Бесплатная доставка', desc: 'от 5000₽ по Санкт-Петербургу' },
  { icon: '💰', title: 'Трейд-ин', desc: 'до 30% скидки на новый гаджет' },
  { icon: '📱', title: 'Рассрочка 0%', desc: 'на любую технику в MAZE' },
  { icon: '🔧', title: 'Гарантия 5 лет', desc: 'на все устройства' },
];

const ADVANTAGES = [
  { icon: '🚚', title: 'Быстрая доставка', desc: 'По СПб от 500₽, по РФ от 1000₽' },
  { icon: '🔄', title: 'Трейд-ин', desc: 'Обменяй старый гаджет на новый' },
  { icon: '🔒', title: 'Гарантия', desc: 'Официальная гарантия до 5 лет' },
  { icon: '⭐', title: 'Доверие', desc: '4.9 на Яндекс.Маркете' },
];

const PARTNER_BRANDS = [
  { name: 'Apple', logo: 'Apple', category_slug: 'apple' },
  { name: 'Samsung', logo: 'Samsung', category_slug: 'samsung' },
  { name: 'Sony', logo: 'Sony', category_slug: 'gaming' },
  { name: 'Marshall', logo: 'Marshall', category_slug: 'marshall' },
  { name: 'Dyson', logo: 'Dyson', category_slug: 'dyson' },
  { name: 'Harman Kardon', logo: 'Harman', category_slug: 'harman' },
];

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    const banners = loadJson('banners.json');
    const reviews = loadJson('reviews.json');
    const editorSlugs = loadJson('editor-choice.json');
    const ts = now();

    const [productRows] = await queryInterface.sequelize.query(
      'SELECT id, slug FROM products',
    );
    const productIdBySlug = Object.fromEntries(productRows.map((row) => [row.slug, row.id]));

    const bannerRows = banners.map((banner, index) => ({
      id: seedUuid(`banner:${banner.id}`),
      title: banner.title,
      subtitle: banner.subtitle ?? null,
      image_url: banner.image,
      link: banner.link,
      size: banner.size ?? 'large',
      sort_order: index,
      is_active: true,
      deleted_at: null,
      created_at: ts,
      updated_at: ts,
    }));

    const reviewRows = reviews.map((review, index) => ({
      id: seedUuid(`review:${review.id}`),
      author_name: review.name,
      text: review.text,
      source: review.source,
      rating: review.rating,
      sort_order: index,
      is_active: true,
      deleted_at: null,
      created_at: ts,
      updated_at: ts,
    }));

    const editorRows = editorSlugs.map((slug, index) => {
      const productId = productIdBySlug[slug];
      if (!productId) {
        throw new Error(`Editor choice references unknown product slug: ${slug}`);
      }
      return {
        id: seedUuid(`editor-choice:${slug}`),
        product_id: productId,
        sort_order: index,
        created_at: ts,
        updated_at: ts,
      };
    });

    const infoSlideRows = INFO_SLIDES.map((slide, index) => ({
      id: seedUuid(`info-slide:${index}`),
      icon: slide.icon,
      title: slide.title,
      description: slide.desc,
      sort_order: index,
      is_active: true,
      deleted_at: null,
      created_at: ts,
      updated_at: ts,
    }));

    const advantageRows = ADVANTAGES.map((item, index) => ({
      id: seedUuid(`advantage:${index}`),
      icon: item.icon,
      title: item.title,
      description: item.desc,
      sort_order: index,
      is_active: true,
      deleted_at: null,
      created_at: ts,
      updated_at: ts,
    }));

    const partnerRows = PARTNER_BRANDS.map((brand, index) => ({
      id: seedUuid(`partner:${brand.name}`),
      name: brand.name,
      logo_url: brand.logo,
      category_slug: brand.category_slug,
      link: null,
      sort_order: index,
      is_active: true,
      deleted_at: null,
      created_at: ts,
      updated_at: ts,
    }));

    await queryInterface.bulkInsert('banners', bannerRows);
    await queryInterface.bulkInsert('store_reviews', reviewRows);
    await queryInterface.bulkInsert('editor_choice_items', editorRows);
    await queryInterface.bulkInsert('info_slides', infoSlideRows);
    await queryInterface.bulkInsert('advantages', advantageRows);
    await queryInterface.bulkInsert('partner_brands', partnerRows);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('partner_brands', null, {});
    await queryInterface.bulkDelete('advantages', null, {});
    await queryInterface.bulkDelete('info_slides', null, {});
    await queryInterface.bulkDelete('editor_choice_items', null, {});
    await queryInterface.bulkDelete('store_reviews', null, {});
    await queryInterface.bulkDelete('banners', null, {});
  },
};
