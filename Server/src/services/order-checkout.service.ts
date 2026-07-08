import { randomInt, randomUUID } from 'node:crypto';
import { Op, type Transaction } from 'sequelize';
import type { CartOwner } from '../lib/cart-owner.js';
import { toNumber } from '../lib/decimal.js';
import { ConflictError, ValidationError } from '../lib/errors.js';
import { assertInstallmentAccessoryIds } from './accessories.service.js';
import {
  assertIdempotencyBodyMatch,
  getIdempotentResponse,
  hashCheckoutBody,
  saveIdempotentResponse,
} from '../lib/idempotency.js';
import { normalizePhone } from '../lib/phone.js';
import { PRICING_VERSION } from '../lib/pricing.js';
import { runInTransaction } from '../lib/transaction.js';
import { getSequelize } from '../config/database.js';
import { Product, ProductImage, ProductVariant, Stock } from '../models/catalog.js';
import {
  Order,
  OrderDelivery,
  OrderItem,
  OrderPayment,
} from '../models/order.js';
import { PaymentMethod } from '../models/reference.js';
import { publishOutboxEvent } from './outbox.service.js';
import {
  clearCartForOwner,
  loadCartLinesForOwner,
  type CartLine,
} from './cart.service.js';
import { validateQuoteForCheckout } from './delivery-quote.service.js';

export interface CheckoutInput {
  customer: {
    phone: string;
    firstName: string;
    lastName: string;
    email?: string;
  };
  delivery: {
    quoteId: string;
    comment?: string;
  };
  payment: {
    method: 'cash' | 'card_qr' | 'installment' | 'invoice_b2b';
  };
  installmentBundle?: {
    accessoryVariantIds: string[];
  };
  comment?: string;
  companyId?: string | null;
}

export interface CreateOrderResponse {
  orderId: string;
  orderNumber: string;
  status: string;
  totals: {
    subtotalRub: number;
    deliveryRub: number;
    paymentFeeRub: number;
    installmentFeeRub: number;
    totalRub: number;
  };
  pricingVersion: string;
}

function buildOrderNumber(): string {
  return `MZ-${randomInt(10000, 99999)}`;
}

async function loadVariantsForCheckout(
  cartLines: CartLine[],
  transaction: Transaction,
) {
  const variantIds = cartLines.map((line) => line.variantId);
  const variants = await ProductVariant.findAll({
    where: { id: { [Op.in]: variantIds }, is_available: true },
    include: [
      {
        model: Product,
        as: 'product',
        attributes: ['id', 'name', 'slug', 'is_published'],
        include: [
          {
            model: ProductImage,
            as: 'images',
            attributes: ['url', 'is_primary'],
            separate: true,
            limit: 1,
            order: [['is_primary', 'DESC'], ['sort_order', 'ASC']],
          },
        ],
      },
      {
        model: Stock,
        as: 'stock',
        required: true,
      },
    ],
    transaction,
  });

  if (variants.length !== cartLines.length) {
    throw new ConflictError('ORDER_OUT_OF_STOCK', 'One or more items are unavailable');
  }

  return variants;
}

async function reserveStock(
  cartLines: CartLine[],
  transaction: Transaction,
): Promise<void> {
  const variantIds = [...cartLines.map((line) => line.variantId)].sort();
  const quantityByVariant = new Map(cartLines.map((line) => [line.variantId, line.quantity]));

  const stocks = await Stock.findAll({
    where: { variant_id: { [Op.in]: variantIds } },
    order: [['variant_id', 'ASC']],
    lock: transaction.LOCK.UPDATE,
    transaction,
  });

  if (stocks.length !== variantIds.length) {
    throw new ConflictError('ORDER_OUT_OF_STOCK', 'Insufficient stock');
  }

  for (const stock of stocks) {
    const needed = quantityByVariant.get(stock.variant_id) ?? 0;
    const available = stock.quantity - stock.reserved_quantity;
    if (available < needed) {
      throw new ConflictError('ORDER_OUT_OF_STOCK', 'Insufficient stock for one or more items');
    }
  }

  for (const stock of stocks) {
    const needed = quantityByVariant.get(stock.variant_id) ?? 0;
    await stock.update(
      { reserved_quantity: stock.reserved_quantity + needed },
      { transaction },
    );
  }
}

function calculateFees(subtotalRub: number, paymentMethod: PaymentMethod) {
  const feePercent = toNumber(paymentMethod.get('fee_percent') as string);
  const feeFixed = toNumber(paymentMethod.get('fee_fixed') as string);
  const code = paymentMethod.code;

  let paymentFeeRub = 0;
  let installmentFeeRub = 0;

  if (code === 'card_qr' && feePercent > 0) {
    paymentFeeRub = Math.round((subtotalRub * feePercent) / 100);
  }

  if (code === 'installment') {
    installmentFeeRub = feeFixed;
  }

  return { paymentFeeRub, installmentFeeRub };
}

export async function createOrderFromCheckout(
  owner: CartOwner,
  idempotencyKey: string,
  input: CheckoutInput,
): Promise<CreateOrderResponse> {
  if (input.companyId && owner.type !== 'user') {
    throw new ValidationError('Company checkout requires authentication');
  }

  const bodyHash = hashCheckoutBody(input);
  const cached = await getIdempotentResponse<CreateOrderResponse>(idempotencyKey);
  if (cached) {
    assertIdempotencyBodyMatch(cached.bodyHash, bodyHash);
    return cached.response;
  }

  const existing = await Order.findOne({ where: { idempotency_key: idempotencyKey } });
  if (existing) {
    const response: CreateOrderResponse = {
      orderId: existing.id,
      orderNumber: existing.order_number,
      status: existing.status,
      totals: {
        subtotalRub: toNumber(existing.subtotal),
        deliveryRub: toNumber(existing.delivery_price),
        paymentFeeRub: toNumber(existing.payment_fee),
        installmentFeeRub: toNumber(existing.installment_fee),
        totalRub: toNumber(existing.total),
      },
      pricingVersion: existing.pricing_version,
    };
    await saveIdempotentResponse(idempotencyKey, bodyHash, response);
    return response;
  }

  const cartLines = await loadCartLinesForOwner(owner);
  if (cartLines.length === 0) {
    throw new ValidationError('Cart is empty');
  }

  const quote = await validateQuoteForCheckout(input.delivery.quoteId, owner, cartLines);
  const phone = normalizePhone(input.customer.phone);

  const paymentMethod = await PaymentMethod.findOne({
    where: { code: input.payment.method, is_active: true },
  });
  if (!paymentMethod) {
    throw new ValidationError('Invalid payment method');
  }

  if (input.payment.method === 'installment') {
    const ids = input.installmentBundle?.accessoryVariantIds;
    if (!ids || ids.length !== 3) {
      throw new ValidationError(
        'Для рассрочки выберите комплект из 3 аксессуаров: стекло, чехол и зарядку',
      );
    }
    try {
      await assertInstallmentAccessoryIds(ids);
    } catch {
      throw new ValidationError('Некорректный комплект аксессуаров для рассрочки');
    }
  }

  const response = await runInTransaction(async (transaction) => {
    const variants = await loadVariantsForCheckout(cartLines, transaction);
    await reserveStock(cartLines, transaction);

    const variantById = new Map(variants.map((variant) => [variant.id, variant]));
    let subtotalRub = 0;
    const orderId = randomUUID();
    const orderNumber = buildOrderNumber();
    const itemRows: Array<{
      id: string;
      order_id: string;
      product_id: string;
      variant_id: string;
      name: string;
      image: string;
      color: string | null;
      memory: string | null;
      unit_price: number;
      quantity: number;
    }> = [];

    for (const line of cartLines) {
      const variant = variantById.get(line.variantId);
      if (!variant?.product?.is_published) {
        throw new ConflictError('ORDER_OUT_OF_STOCK', 'Product is unavailable');
      }

      const unitPrice = toNumber(variant.price);
      subtotalRub += unitPrice * line.quantity;
      const image =
        variant.product.images?.[0]?.url ??
        'https://placehold.co/200x200?text=MAZE';

      itemRows.push({
        id: randomUUID(),
        order_id: orderId,
        product_id: variant.product.id,
        variant_id: variant.id,
        name: variant.product.name,
        image,
        color: variant.color_name,
        memory: variant.memory,
        unit_price: unitPrice,
        quantity: line.quantity,
      });
    }

    const { paymentFeeRub, installmentFeeRub } = calculateFees(subtotalRub, paymentMethod);
    const deliveryRub = quote.deliveryPriceRub;
    const totalRub = subtotalRub + deliveryRub + paymentFeeRub + installmentFeeRub;

    const comment = [input.comment, input.delivery.comment].filter(Boolean).join('\n') || null;

    await Order.create(
      {
        id: orderId,
        order_number: orderNumber,
        user_id: owner.type === 'user' ? owner.id : null,
        customer_first_name: input.customer.firstName,
        customer_last_name: input.customer.lastName,
        customer_phone: phone,
        customer_email: input.customer.email ?? null,
        status: 'pending',
        subtotal: subtotalRub,
        delivery_price: deliveryRub,
        payment_fee: paymentFeeRub,
        installment_fee: installmentFeeRub,
        total: totalRub,
        comment,
        idempotency_key: idempotencyKey,
        pricing_version: PRICING_VERSION,
      },
      { transaction },
    );

    await OrderItem.bulkCreate(itemRows, { transaction });

    const address = quote.payload.address ?? {};
    await OrderDelivery.create(
      {
        order_id: orderId,
        type: quote.provider,
        city: quote.payload.city,
        district: null,
        street: address.street ?? '—',
        house: address.house ?? '—',
        entrance: null,
        apartment: address.flat ?? null,
        requires_prepay: quote.requiresPrepay,
        tracking_number: null,
      },
      { transaction },
    );

    await OrderPayment.create(
      {
        order_id: orderId,
        payment_method_id: paymentMethod.id,
        fee_percent: toNumber(paymentMethod.get('fee_percent') as string),
        fee_amount: paymentFeeRub,
        is_paid: false,
        paid_at: null,
        paid_amount: null,
      },
      { transaction },
    );

    if (input.payment.method === 'installment' && input.installmentBundle?.accessoryVariantIds) {
      const accessoryIds = input.installmentBundle.accessoryVariantIds;
      await getSequelize().query(
        `INSERT INTO order_installment_bundles (order_id, fee_amount, created_at, updated_at)
         VALUES (:orderId, :feeAmount, NOW(), NOW())`,
        {
          replacements: { orderId, feeAmount: installmentFeeRub },
          transaction,
        },
      );

      for (let i = 0; i < accessoryIds.length; i++) {
        await getSequelize().query(
          `INSERT INTO installment_bundle_items (id, order_id, accessory_id, sort_order, created_at, updated_at)
           VALUES (gen_random_uuid(), :orderId, :accessoryId, :sortOrder, NOW(), NOW())`,
          {
            replacements: { orderId, accessoryId: accessoryIds[i], sortOrder: i },
            transaction,
          },
        );
      }
    }

    await publishOutboxEvent(
      {
        event_type: 'order.created',
        aggregate_type: 'order',
        aggregate_id: orderId,
        payload: {
          orderId,
          orderNumber,
          customerPhone: phone,
          totalRub,
        },
      },
      transaction,
    );

    return {
      orderId,
      orderNumber,
      status: 'pending',
      totals: {
        subtotalRub,
        deliveryRub,
        paymentFeeRub,
        installmentFeeRub,
        totalRub,
      },
      pricingVersion: PRICING_VERSION,
    } satisfies CreateOrderResponse;
  });

  await clearCartForOwner(owner);
  await saveIdempotentResponse(idempotencyKey, bodyHash, response);
  return response;
}
