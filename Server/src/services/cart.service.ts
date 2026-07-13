import { Op } from 'sequelize';
import { getRedis } from '../config/redis.js';
import {
  CART_MAX_ITEMS,
  CART_MAX_QTY_PER_ITEM,
  CART_TTL_SEC,
} from '../lib/constants.js';
import { toNumber } from '../lib/decimal.js';
import { ConflictError, NotFoundError, ValidationError } from '../lib/errors.js';
import type { CartOwner } from '../lib/cart-owner.js';
import { Product, ProductImage, ProductVariant, Stock } from '../models/catalog.js';

export interface CartLine {
  variantId: string;
  quantity: number;
  addedAt: string;
}

export interface CartItemDto {
  variantId: string;
  productId: string;
  slug: string;
  title: string;
  variantLabel: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
  maxQuantity: number;
  inStock: boolean;
  /** Primary product image — same source as catalog cards. */
  mainImageUrl: string | null;
}

export interface CartDto {
  items: CartItemDto[];
  summary: {
    itemsCount: number;
    subtotalRub: number;
    limits: { maxLines: number; maxQtyPerLine: number };
  };
}

function guestCartKey(sessionId: string) {
  return `cart:guest:${sessionId}`;
}

function userCartKey(userId: string) {
  return `cart:user:${userId}`;
}

function cartKey(owner: CartOwner): string {
  return owner.type === 'user' ? userCartKey(owner.id) : guestCartKey(owner.id);
}

function parseCart(raw: string | null): CartLine[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as CartLine[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function clampQuantity(quantity: number): number {
  if (!Number.isInteger(quantity) || quantity < 1) {
    throw new ValidationError('Количество должно быть не меньше 1');
  }
  if (quantity > CART_MAX_QTY_PER_ITEM) {
    throw new ConflictError(
      'CART_LIMIT_EXCEEDED',
      `Максимум ${CART_MAX_QTY_PER_ITEM} шт. на позицию`,
    );
  }
  return quantity;
}

export function assertMaxLines(lineCount: number): void {
  if (lineCount > CART_MAX_ITEMS) {
    throw new ConflictError(
      'CART_LIMIT_EXCEEDED',
      `Максимум ${CART_MAX_ITEMS} позиций в корзине`,
    );
  }
}

export function mergeLines(guest: CartLine[], user: CartLine[]): CartLine[] {
  const merged = new Map<string, CartLine>();

  for (const line of user) {
    merged.set(line.variantId, { ...line });
  }

  for (const line of guest) {
    const existing = merged.get(line.variantId);
    if (existing) {
      existing.quantity = Math.min(CART_MAX_QTY_PER_ITEM, existing.quantity + line.quantity);
    } else {
      merged.set(line.variantId, {
        ...line,
        quantity: Math.min(CART_MAX_QTY_PER_ITEM, line.quantity),
      });
    }
  }

  return [...merged.values()].slice(0, CART_MAX_ITEMS);
}

function buildVariantLabel(memory: string | null, color: string): string {
  if (memory) return `${memory} / ${color}`;
  return color;
}

async function loadCartLines(owner: CartOwner): Promise<CartLine[]> {
  const redis = getRedis();
  return parseCart(await redis.get(cartKey(owner)));
}

async function saveCartLines(owner: CartOwner, lines: CartLine[]): Promise<void> {
  const redis = getRedis();
  const key = cartKey(owner);

  if (lines.length === 0) {
    await redis.del(key);
    return;
  }

  await redis.set(key, JSON.stringify(lines), 'EX', CART_TTL_SEC);
}

export async function loadCartLinesForOwner(owner: CartOwner): Promise<CartLine[]> {
  return loadCartLines(owner);
}

export async function clearCartForOwner(owner: CartOwner): Promise<void> {
  await saveCartLines(owner, []);
}

async function assertVariantExists(variantId: string): Promise<void> {
  const variant = await ProductVariant.findOne({
    where: { id: variantId, is_available: true },
    attributes: ['id'],
  });

  if (!variant) {
    throw new NotFoundError('Вариант товара не найден');
  }
}

async function enrichCart(lines: CartLine[]): Promise<{ cart: CartDto; validLines: CartLine[] }> {
  if (lines.length === 0) {
    return {
      cart: {
        items: [],
        summary: {
          itemsCount: 0,
          subtotalRub: 0,
          limits: { maxLines: CART_MAX_ITEMS, maxQtyPerLine: CART_MAX_QTY_PER_ITEM },
        },
      },
      validLines: [],
    };
  }

  const variantIds = lines.map((line) => line.variantId);
  const variants = await ProductVariant.findAll({
    where: { id: { [Op.in]: variantIds } },
    include: [
      {
        model: Product,
        as: 'product',
        attributes: ['id', 'slug', 'name', 'is_published'],
        required: true,
        include: [
          {
            model: ProductImage,
            as: 'images',
            attributes: ['url', 'is_primary', 'sort_order'],
            separate: true,
            order: [['sort_order', 'ASC']],
          },
        ],
      },
      {
        model: Stock,
        as: 'stock',
        attributes: ['quantity', 'reserved_quantity'],
        required: false,
      },
    ],
  });

  const variantById = new Map(variants.map((variant) => [variant.id, variant]));
  const validLines: CartLine[] = [];
  const items: CartItemDto[] = [];

  for (const line of lines) {
    const variant = variantById.get(line.variantId);
    if (!variant || !variant.product?.is_published) {
      continue;
    }

    const available =
      (variant.stock?.quantity ?? 0) - (variant.stock?.reserved_quantity ?? 0);
    const maxQuantity = Math.min(CART_MAX_QTY_PER_ITEM, Math.max(available, 0));
    const quantity = Math.min(line.quantity, Math.max(maxQuantity, 0));
    const unitPrice = toNumber(variant.price);
    const inStock = variant.is_available && available > 0;

    // Не отдаём и не храним qty выше склада — иначе checkout падает с Insufficient stock
    if (quantity < 1) {
      continue;
    }

    const images = variant.product.images ?? [];
    const mainImageUrl =
      images.find((img) => img.is_primary)?.url ?? images[0]?.url ?? null;

    validLines.push({ ...line, quantity });
    items.push({
      variantId: variant.id,
      productId: variant.product.id,
      slug: variant.product.slug,
      title: variant.product.name,
      variantLabel: buildVariantLabel(variant.memory, variant.color_name),
      quantity,
      unitPrice,
      lineTotal: unitPrice * quantity,
      maxQuantity,
      inStock,
      mainImageUrl,
    });
  }

  const itemsCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotalRub = items.reduce((sum, item) => sum + item.lineTotal, 0);

  return {
    cart: {
      items,
      summary: {
        itemsCount,
        subtotalRub,
        limits: { maxLines: CART_MAX_ITEMS, maxQtyPerLine: CART_MAX_QTY_PER_ITEM },
      },
    },
    validLines,
  };
}

export async function getCart(owner: CartOwner): Promise<CartDto> {
  const lines = await loadCartLines(owner);
  const { cart, validLines } = await enrichCart(lines);

  const needsSave =
    validLines.length !== lines.length ||
    validLines.some((line) => {
      const prev = lines.find((l) => l.variantId === line.variantId);
      return !prev || prev.quantity !== line.quantity;
    });

  if (needsSave) {
    await saveCartLines(owner, validLines);
  } else if (validLines.length > 0) {
    // Продлеваем TTL при каждом чтении, чтобы корзина жила долго при активности.
    await getRedis().expire(cartKey(owner), CART_TTL_SEC);
  }

  return cart;
}

function normalizeReplaceItems(
  items: Array<{ variantId: string; quantity: number }>,
): CartLine[] {
  const now = new Date().toISOString();
  const map = new Map<string, CartLine>();

  for (const item of items) {
    const quantity = clampQuantity(item.quantity);
    map.set(item.variantId, {
      variantId: item.variantId,
      quantity,
      addedAt: map.get(item.variantId)?.addedAt ?? now,
    });
  }

  const lines = [...map.values()];
  assertMaxLines(lines.length);
  return lines;
}

export async function replaceCart(
  owner: CartOwner,
  items: Array<{ variantId: string; quantity: number }>,
): Promise<CartDto> {
  if (items.length === 0) {
    await saveCartLines(owner, []);
    return getCart(owner);
  }

  const uniqueVariantIds = [...new Set(items.map((item) => item.variantId))];
  const found = await ProductVariant.count({
    where: { id: { [Op.in]: uniqueVariantIds }, is_available: true },
  });

  if (found !== uniqueVariantIds.length) {
    throw new NotFoundError('Один или несколько вариантов не найдены');
  }

  const lines = normalizeReplaceItems(items);
  await saveCartLines(owner, lines);
  return getCart(owner);
}

export async function addCartItem(
  owner: CartOwner,
  variantId: string,
  quantityInput: number,
): Promise<CartDto> {
  const quantity = clampQuantity(quantityInput);
  await assertVariantExists(variantId);

  const lines = await loadCartLines(owner);
  const existing = lines.find((line) => line.variantId === variantId);

  if (existing) {
    existing.quantity = clampQuantity(existing.quantity + quantity);
  } else {
    assertMaxLines(lines.length + 1);
    lines.push({
      variantId,
      quantity,
      addedAt: new Date().toISOString(),
    });
  }

  await saveCartLines(owner, lines);
  return getCart(owner);
}

export async function removeCartItem(owner: CartOwner, variantId: string): Promise<CartDto> {
  const lines = await loadCartLines(owner);
  const next = lines.filter((line) => line.variantId !== variantId);
  await saveCartLines(owner, next);
  return getCart(owner);
}

export async function clearCart(owner: CartOwner): Promise<CartDto> {
  await saveCartLines(owner, []);
  return getCart(owner);
}

export async function mergeGuestCartToUser(
  sessionId: string | undefined,
  userId: string,
): Promise<void> {
  if (!sessionId) return;

  const redis = getRedis();
  const guestKey = guestCartKey(sessionId);

  const guestCart = parseCart(await redis.get(guestKey));
  if (guestCart.length === 0) {
    await redis.del(guestKey);
    return;
  }

  const userCart = parseCart(await redis.get(userCartKey(userId)));
  const merged = mergeLines(guestCart, userCart);

  await redis.set(userCartKey(userId), JSON.stringify(merged), 'EX', CART_TTL_SEC);
  await redis.del(guestKey);
}
