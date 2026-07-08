'use strict';

const { seedUuid } = require('./seed-ids.cjs');
const { now } = require('./now.cjs');

const PAYMENT_METHODS = [
  { code: 'cash', name: 'Наличные', fee_percent: 0, fee_fixed: 0 },
  { code: 'card_qr', name: 'Карта / QR', fee_percent: 7, fee_fixed: 0 },
  { code: 'installment', name: 'Рассрочка', fee_percent: 0, fee_fixed: 5000 },
  { code: 'invoice_b2b', name: 'Счёт (юр. лицо)', fee_percent: 0, fee_fixed: 0 },
];

const DELIVERY_PROVIDERS = [
  { code: 'maze_courier', name: 'Курьер MAZE' },
  { code: 'yandex', name: 'Яндекс Доставка' },
  { code: 'cdek', name: 'СДЭК' },
];

/** @returns {{ paymentMethods: object[], deliveryProviders: object[], deliveryRates: object[] }} */
function buildReferenceRows() {
  const ts = now();

  const paymentMethods = PAYMENT_METHODS.map((row) => ({
    id: seedUuid(`payment:${row.code}`),
    code: row.code,
    name: row.name,
    fee_percent: row.fee_percent,
    fee_fixed: row.fee_fixed,
    is_active: true,
    created_at: ts,
    updated_at: ts,
  }));

  const deliveryProviders = DELIVERY_PROVIDERS.map((row) => ({
    id: seedUuid(`delivery-provider:${row.code}`),
    code: row.code,
    name: row.name,
    is_active: true,
    created_at: ts,
    updated_at: ts,
  }));

  const providerByCode = Object.fromEntries(deliveryProviders.map((p) => [p.code, p.id]));

  const deliveryRates = [
    {
      id: seedUuid('rate:pickup-spb'),
      provider_id: providerByCode.maze_courier,
      delivery_type: 'pickup',
      city_scope: 'spb',
      base_price: 0,
      requires_prepay: false,
      fee_percent: 0,
    },
    {
      id: seedUuid('rate:spb-courier'),
      provider_id: providerByCode.maze_courier,
      delivery_type: 'spb_courier',
      city_scope: 'spb',
      base_price: 500,
      requires_prepay: false,
      fee_percent: 0,
    },
    {
      id: seedUuid('rate:spb-yandex'),
      provider_id: providerByCode.yandex,
      delivery_type: 'spb_yandex',
      city_scope: 'spb',
      base_price: 500,
      requires_prepay: true,
      fee_percent: 0,
    },
    {
      id: seedUuid('rate:rf-cdek'),
      provider_id: providerByCode.cdek,
      delivery_type: 'rf_cdek',
      city_scope: 'rf',
      base_price: 1000,
      requires_prepay: true,
      fee_percent: 4,
    },
    {
      id: seedUuid('rate:rf-yandex'),
      provider_id: providerByCode.yandex,
      delivery_type: 'rf_yandex',
      city_scope: 'rf',
      base_price: 1000,
      requires_prepay: true,
      fee_percent: 4,
    },
  ].map((row) => ({ ...row, created_at: ts, updated_at: ts }));

  return { paymentMethods, deliveryProviders, deliveryRates };
}

module.exports = { buildReferenceRows, PAYMENT_METHODS, DELIVERY_PROVIDERS };
