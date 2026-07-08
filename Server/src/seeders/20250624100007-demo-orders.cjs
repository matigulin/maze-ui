'use strict';

const { loadJson } = require('./lib/load-json.cjs');
const { seedUuid } = require('./lib/seed-ids.cjs');
const { now } = require('./lib/now.cjs');

const DELIVERY_TYPE_MAP = {
  pickup: 'pickup',
  'courier-spb': 'spb_courier',
  sdek: 'rf_cdek',
};

const PAYMENT_CODE_MAP = {
  cash: 'cash',
  card: 'card_qr',
  qr: 'card_qr',
};

function parseAddress(delivery) {
  if (!delivery?.address) {
    return { street: 'Чайковского', house: '56', apartment: null, district: null };
  }

  const parts = delivery.address.split(',').map((part) => part.trim());
  const street = parts[0] ?? delivery.address;
  const houseMatch = parts[1]?.match(/(\d+)/);
  const aptMatch = parts[1]?.match(/кв\.?\s*(\d+)/i) || parts[2]?.match(/кв\.?\s*(\d+)/i);

  return {
    street,
    house: houseMatch?.[1] ?? '1',
    apartment: aptMatch?.[1] ?? null,
    district: null,
  };
}

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    const orders = loadJson('orders.json');
    const ts = now();

    const [paymentRows] = await queryInterface.sequelize.query(
      'SELECT id, code FROM payment_methods',
    );
    const paymentIdByCode = Object.fromEntries(paymentRows.map((row) => [row.code, row.id]));

    const [productRows] = await queryInterface.sequelize.query(
      'SELECT p.id, p.slug, p.name FROM products p',
    );
    const productByJsonId = {};
    for (const product of loadJson('products.json')) {
      const dbProduct = productRows.find((row) => row.slug === product.slug);
      if (dbProduct) {
        productByJsonId[product.id] = dbProduct;
      }
    }

    const [variantRows] = await queryInterface.sequelize.query(
      `SELECT v.id, v.product_id, v.color_name, v.memory, p.slug AS product_slug
       FROM product_variants v
       JOIN products p ON p.id = v.product_id`,
    );
    const variantsByProductId = variantRows.reduce((acc, row) => {
      if (!acc[row.product_id]) acc[row.product_id] = [];
      acc[row.product_id].push(row);
      return acc;
    }, {});

    const orderRows = [];
    const itemRows = [];
    const deliveryRows = [];
    const paymentRowsToInsert = [];

    for (const [index, order] of orders.entries()) {
      const orderId = seedUuid(`order:${order.id}`);
      const itemsSubtotal = order.items.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0,
      );
      const deliveryPrice = order.delivery?.price ?? 0;
      const paymentCode = PAYMENT_CODE_MAP[order.payment] ?? 'cash';
      const paymentMethodId = paymentIdByCode[paymentCode];

      if (!paymentMethodId) {
        throw new Error(`Unknown payment code for demo order ${order.id}: ${order.payment}`);
      }

      orderRows.push({
        id: orderId,
        order_number: `MAZE-DEMO-${String(index + 1).padStart(4, '0')}`,
        user_id: null,
        assigned_manager_id: null,
        customer_first_name: order.customer.firstName,
        customer_last_name: order.customer.lastName,
        customer_phone: order.customer.phone,
        customer_email: order.customer.email ?? null,
        status: order.status,
        subtotal: itemsSubtotal,
        delivery_price: deliveryPrice,
        payment_fee: 0,
        installment_fee: 0,
        total: order.total,
        comment: null,
        idempotency_key: null,
        pricing_version: 'seed-v1',
        created_at: new Date(`${order.date}T12:00:00.000Z`),
        updated_at: ts,
      });

      for (const item of order.items) {
        const product = productByJsonId[item.productId];
        if (!product) {
          throw new Error(`Demo order ${order.id} references unknown product ${item.productId}`);
        }

        const variant = variantsByProductId[product.id]?.[0] ?? null;

        itemRows.push({
          id: seedUuid(`order-item:${order.id}:${item.productId}`),
          order_id: orderId,
          product_id: product.id,
          variant_id: variant?.id ?? null,
          name: item.name,
          image: item.image,
          color: variant?.color_name ?? null,
          memory: variant?.memory ?? null,
          unit_price: item.price,
          quantity: item.quantity,
          created_at: ts,
          updated_at: ts,
        });
      }

      const deliveryType = DELIVERY_TYPE_MAP[order.delivery?.method] ?? 'pickup';
      const address = parseAddress(order.delivery);

      deliveryRows.push({
        order_id: orderId,
        type: deliveryType,
        city: order.delivery?.city ?? 'Санкт-Петербург',
        district: address.district,
        street: address.street,
        house: address.house,
        entrance: null,
        apartment: address.apartment,
        requires_prepay: deliveryType === 'rf_cdek',
        tracking_number: null,
        created_at: ts,
        updated_at: ts,
      });

      paymentRowsToInsert.push({
        order_id: orderId,
        payment_method_id: paymentMethodId,
        fee_percent: 0,
        fee_amount: 0,
        is_paid: ['confirmed', 'shipping', 'paid', 'delivered'].includes(order.status),
        paid_at: ['confirmed', 'shipping', 'paid', 'delivered'].includes(order.status) ? ts : null,
        paid_amount: ['confirmed', 'shipping', 'paid', 'delivered'].includes(order.status)
          ? order.total
          : null,
        created_at: ts,
        updated_at: ts,
      });
    }

    await queryInterface.bulkInsert('orders', orderRows);
    await queryInterface.bulkInsert('order_items', itemRows);
    await queryInterface.bulkInsert('order_deliveries', deliveryRows);
    await queryInterface.bulkInsert('order_payments', paymentRowsToInsert);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('order_payments', null, {});
    await queryInterface.bulkDelete('order_deliveries', null, {});
    await queryInterface.bulkDelete('order_items', null, {});
    await queryInterface.bulkDelete('orders', null, {});
  },
};
