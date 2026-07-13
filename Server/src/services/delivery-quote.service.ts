import { randomUUID } from 'node:crypto';
import { Op } from 'sequelize';
import { getRedis } from '../config/redis.js';
import {
  DELIVERY_QUOTE_TTL_SEC,
  type DeliveryProviderType,
} from '../lib/constants.js';
import { toNumber } from '../lib/decimal.js';
import {
  buildQuoteRequestHash,
  calculateDeliveryPriceRub,
  estimateEtaDays,
  resolveCityScope,
  type QuoteRequestInput,
} from '../lib/delivery-calc.js';
import type { CartOwner } from '../lib/cart-owner.js';
import { assertOwnerAccess, ownerKey } from '../lib/cart-owner.js';
import { ConflictError, NotFoundError } from '../lib/errors.js';
import type { CartLine } from './cart.service.js';
import { cartMatchesQuoteItems } from '../lib/cart-quote.js';
import { ProductVariant } from '../models/catalog.js';
import { DeliveryQuote } from '../models/order.js';
import { DeliveryRate, SiteSetting } from '../models/reference.js';
import { getQueue, QUEUE_NAMES } from '../queues/index.js';

export interface QuotePayload extends QuoteRequestInput {
  requestHash: string;
  ownerKey: string;
}

export interface QuoteResponseDto {
  quoteId: string;
  status: 'ready' | 'pending' | 'failed';
  priceRub?: number;
  etaDays?: number;
  expiresAt?: string;
}

interface QuoteStatusCache {
  status: 'ready' | 'pending' | 'failed';
  priceRub?: number;
  etaDays?: number;
  expiresAt?: string;
}

function cacheKeyForHash(hash: string) {
  return `delivery:quote:cache:${hash}`;
}

function statusKeyForQuote(quoteId: string) {
  return `delivery:quote:status:${quoteId}`;
}

async function readQuoteStatus(quoteId: string): Promise<QuoteStatusCache | null> {
  const raw = await getRedis().get(statusKeyForQuote(quoteId));
  if (!raw) return null;
  return JSON.parse(raw) as QuoteStatusCache;
}

async function writeQuoteStatus(quoteId: string, status: QuoteStatusCache): Promise<void> {
  await getRedis().set(
    statusKeyForQuote(quoteId),
    JSON.stringify(status),
    'EX',
    DELIVERY_QUOTE_TTL_SEC,
  );
}

function mapQuoteResponse(
  quoteId: string,
  row: DeliveryQuote,
  status: QuoteStatusCache | null,
): QuoteResponseDto {
  if (status?.status === 'failed') {
    return { quoteId, status: 'failed' };
  }

  const priceRub = toNumber(row.price);
  const isReady =
    status?.status === 'ready' ||
    (status?.status !== 'pending' &&
      status?.status !== 'failed' &&
      row.expires_at > new Date() &&
      (priceRub > 0 || row.provider === 'pickup'));

  if (isReady) {
    return {
      quoteId,
      status: 'ready',
      priceRub,
      etaDays: status?.etaDays ?? estimateEtaDays(row.provider as DeliveryProviderType),
      expiresAt: row.expires_at.toISOString(),
    };
  }

  return { quoteId, status: 'pending' };
}

export async function getQuoteForOwner(
  quoteId: string,
  owner: CartOwner,
): Promise<QuoteResponseDto> {
  const row = await DeliveryQuote.findByPk(quoteId);
  if (!row) {
    throw new NotFoundError('Quote not found');
  }

  const payload = row.payload as unknown as QuotePayload;
  assertOwnerAccess(payload.ownerKey, owner);

  const status = await readQuoteStatus(quoteId);
  return mapQuoteResponse(quoteId, row, status);
}

export async function requestDeliveryQuote(
  owner: CartOwner,
  input: QuoteRequestInput,
): Promise<QuoteResponseDto> {
  const ownerKeyValue = ownerKey(owner);
  const requestHash = buildQuoteRequestHash(input, ownerKeyValue);
  const redis = getRedis();

  const cachedQuoteId = await redis.get(cacheKeyForHash(requestHash));
  if (cachedQuoteId) {
    try {
      return await getQuoteForOwner(cachedQuoteId, owner);
    } catch {
      await redis.del(cacheKeyForHash(requestHash));
    }
  }

  const quoteId = randomUUID();
  const payload: QuotePayload = {
    ...input,
    requestHash,
    ownerKey: ownerKeyValue,
  };

  await DeliveryQuote.create({
    id: quoteId,
    provider: input.provider,
    payload,
    price: 0,
    expires_at: new Date(Date.now() + DELIVERY_QUOTE_TTL_SEC * 1000),
  });

  await writeQuoteStatus(quoteId, { status: 'pending' });
  await redis.set(cacheKeyForHash(requestHash), quoteId, 'EX', DELIVERY_QUOTE_TTL_SEC);

  // Process fixed rates inline (no dependency on queue latency / jobId quirks)
  try {
    await processDeliveryQuoteJob(quoteId);
  } catch (error) {
    console.error('[delivery-quote] inline process failed', quoteId, error);
  }

  // Best-effort background retry for external providers; BullMQ forbids `:` in custom ids
  try {
    await getQueue(QUEUE_NAMES.delivery).add(
      'quote',
      { quoteId },
      { jobId: `delivery-quote-${quoteId}` },
    );
  } catch (error) {
    console.error('[delivery-quote] enqueue failed', quoteId, error);
  }

  return getQuoteForOwner(quoteId, owner);
}

export async function computeItemsSubtotal(
  items: Array<{ variantId: string; quantity: number }>,
): Promise<number> {
  if (items.length === 0) return 0;

  const variants = await ProductVariant.findAll({
    where: { id: { [Op.in]: items.map((item) => item.variantId) } },
    attributes: ['id', 'price'],
  });

  const priceById = new Map(variants.map((variant) => [variant.id, toNumber(variant.price)]));
  return items.reduce((sum, item) => {
    const unitPrice = priceById.get(item.variantId) ?? 0;
    return sum + unitPrice * item.quantity;
  }, 0);
}

export async function processDeliveryQuoteJob(quoteId: string): Promise<void> {
  const row = await DeliveryQuote.findByPk(quoteId);
  if (!row) return;

  const payload = row.payload as unknown as QuotePayload;
  const scope = resolveCityScope(payload.city);

  const rateRow = await DeliveryRate.findOne({
    where: {
      delivery_type: payload.provider,
      city_scope: scope,
    },
  });

  if (!rateRow) {
    await writeQuoteStatus(quoteId, { status: 'failed' });
    throw new Error(`No delivery rate for ${payload.provider} / ${scope}`);
  }

  const settingsRow = await SiteSetting.findByPk('public');
  const siteValue = settingsRow?.value as {
    delivery?: { spbFrom?: number; spbFreeFrom?: number; russiaFrom?: number };
  } | undefined;

  const itemsSubtotalRub = await computeItemsSubtotal(payload.items);
  const priceRub = calculateDeliveryPriceRub({
    provider: payload.provider,
    city: payload.city,
    itemsSubtotalRub,
    rate: {
      delivery_type: rateRow.delivery_type,
      city_scope: rateRow.city_scope,
      base_price: toNumber(rateRow.base_price),
      fee_percent: toNumber(rateRow.fee_percent),
    },
    siteDelivery: siteValue?.delivery,
  });

  const etaDays = estimateEtaDays(payload.provider);
  const expiresAt = new Date(Date.now() + DELIVERY_QUOTE_TTL_SEC * 1000);

  await row.update({ price: priceRub, expires_at: expiresAt });
  await writeQuoteStatus(quoteId, {
    status: 'ready',
    priceRub,
    etaDays,
    expiresAt: expiresAt.toISOString(),
  });
}

export async function validateQuoteForCheckout(
  quoteId: string,
  owner: CartOwner,
  cartLines: CartLine[],
): Promise<{
  provider: DeliveryProviderType;
  deliveryPriceRub: number;
  payload: QuotePayload;
  requiresPrepay: boolean;
}> {
  const row = await DeliveryQuote.findByPk(quoteId);
  if (!row) {
    throw new NotFoundError('Quote not found');
  }

  const payload = row.payload as unknown as QuotePayload;
  assertOwnerAccess(payload.ownerKey, owner);

  const status = await readQuoteStatus(quoteId);
  if (status?.status === 'failed') {
    throw new ConflictError('QUOTE_INVALID', 'Delivery quote is invalid');
  }

  if (row.expires_at <= new Date()) {
    throw new ConflictError('QUOTE_EXPIRED', 'Delivery quote expired');
  }

  // Free pickup/threshold can be 0; only reject quotes that are not ready yet
  if (status?.status !== 'ready') {
    throw new ConflictError('QUOTE_EXPIRED', 'Delivery quote is not ready');
  }

  if (!cartMatchesQuoteItems(cartLines, payload.items)) {
    throw new ConflictError('QUOTE_INVALID', 'Delivery quote does not match cart');
  }

  const scope = resolveCityScope(payload.city);
  const rate = await DeliveryRate.findOne({
    where: {
      delivery_type: payload.provider,
      city_scope: scope,
    },
  });

  return {
    provider: payload.provider,
    deliveryPriceRub: toNumber(row.price),
    payload,
    requiresPrepay: rate?.requires_prepay ?? false,
  };
}
