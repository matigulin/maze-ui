'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    await queryInterface.sequelize.query(`
      CREATE INDEX idx_sms_verifications_phone_expires
        ON sms_verifications (phone, expires_at);

      CREATE INDEX idx_products_catalog_published
        ON products (category_id, subcategory_id)
        WHERE is_published = true;

      CREATE INDEX idx_product_variants_filters
        ON product_variants (memory, color_name, price);

      CREATE INDEX idx_products_base_price
        ON products (base_price);

      CREATE INDEX idx_products_name_trgm
        ON products USING gin (name gin_trgm_ops);

      CREATE INDEX idx_orders_status_created
        ON orders (status, created_at DESC);

      CREATE INDEX idx_orders_manager_status
        ON orders (assigned_manager_id, status);

      CREATE INDEX idx_orders_user_created
        ON orders (user_id, created_at DESC)
        WHERE user_id IS NOT NULL;

      CREATE UNIQUE INDEX uq_orders_idempotency_key
        ON orders (idempotency_key)
        WHERE idempotency_key IS NOT NULL;

      CREATE INDEX idx_outbox_pending
        ON outbox_events (status, created_at)
        WHERE status = 'pending';

      CREATE INDEX idx_staff_login_attempts_email
        ON staff_login_attempts (email, created_at DESC);

      CREATE INDEX idx_delivery_quotes_expires
        ON delivery_quotes (expires_at);
    `);
  },

  async down(queryInterface) {
    await queryInterface.sequelize.query(`
      DROP INDEX IF EXISTS idx_delivery_quotes_expires;
      DROP INDEX IF EXISTS idx_staff_login_attempts_email;
      DROP INDEX IF EXISTS idx_outbox_pending;
      DROP INDEX IF EXISTS uq_orders_idempotency_key;
      DROP INDEX IF EXISTS idx_orders_user_created;
      DROP INDEX IF EXISTS idx_orders_manager_status;
      DROP INDEX IF EXISTS idx_orders_status_created;
      DROP INDEX IF EXISTS idx_products_name_trgm;
      DROP INDEX IF EXISTS idx_products_base_price;
      DROP INDEX IF EXISTS idx_product_variants_filters;
      DROP INDEX IF EXISTS idx_products_catalog_published;
      DROP INDEX IF EXISTS idx_sms_verifications_phone_expires;
    `);
  },
};
