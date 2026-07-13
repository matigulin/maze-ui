import { apiDelete, apiGet, apiPostJson, apiPutJson } from "@/lib/api";
import type { Product, ProductVariant } from "@/lib/data";
import type { CartItem } from "../model/types";

export type CartItemDto = {
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
  mainImageUrl: string | null;
};

export type CartDto = {
  items: CartItemDto[];
  summary: {
    itemsCount: number;
    subtotalRub: number;
    limits: { maxLines: number; maxQtyPerLine: number };
  };
};

type CartRequestOpts = { accessToken?: string | null };

function cartLineToUiItem(line: CartItemDto): CartItem {
  const parts = line.variantLabel.split(" / ");
  const memory = parts.length > 1 ? parts[0] : undefined;
  const color = parts.length > 1 ? parts[1] : parts[0];

  return {
    key: line.variantId,
    variantId: line.variantId,
    qty: line.quantity,
    maxQuantity: line.maxQuantity,
    inStock: line.inStock,
    color,
    memory,
    product: {
      id: line.productId,
      slug: line.slug,
      name: line.title,
      brand: "",
      category: "",
      price: line.unitPrice,
      badge: null,
      rating: 0,
      reviews: 0,
      tint: ["#22d3ee", "#a78bfa"],
      glyph: line.title,
      imageUrl: line.mainImageUrl,
      colors: [],
      specs: [],
      short: line.variantLabel,
      defaultVariantId: line.variantId,
    },
  };
}

export async function fetchCart(
  accessToken?: string | null,
): Promise<CartItem[]> {
  const dto = await apiGet<CartDto>("/cart", undefined, {
    credentials: "include",
    accessToken,
  });
  return dto.items.map(cartLineToUiItem);
}

export async function addCartLine(
  variantId: string,
  quantity = 1,
  opts?: CartRequestOpts,
): Promise<CartItem[]> {
  const dto = await apiPostJson<CartDto>(
    "/cart/items",
    { variantId, quantity },
    opts,
  );
  return dto.items.map(cartLineToUiItem);
}

export async function removeCartLine(
  variantId: string,
  opts?: CartRequestOpts,
): Promise<CartItem[]> {
  const dto = await apiDelete<CartDto>(`/cart/items/${variantId}`, opts);
  return dto.items.map(cartLineToUiItem);
}

export async function replaceCartLines(
  items: Array<{ variantId: string; quantity: number }>,
  opts?: CartRequestOpts,
): Promise<CartItem[]> {
  const dto = await apiPutJson<CartDto>("/cart", { items }, opts);
  return dto.items.map(cartLineToUiItem);
}

export async function clearCartApi(
  opts?: CartRequestOpts,
): Promise<CartItem[]> {
  const dto = await apiDelete<CartDto>("/cart", opts);
  return dto.items.map(cartLineToUiItem);
}

/** Вариант по цвету/памяти (без фолбэка на «любой в наличии»). */
export function findProductVariant(
  product: Product,
  opts?: { color?: string; memory?: string; variantId?: string },
): ProductVariant | undefined {
  if (opts?.variantId) {
    return product.variants?.find((v) => v.id === opts.variantId);
  }
  const variants = product.variants ?? [];
  if (variants.length === 0) return undefined;

  return variants.find((v) => {
    if (opts?.color && v.color !== opts.color) return false;
    if (opts?.memory) {
      if (v.memory !== opts.memory) return false;
    } else if (product.memory?.length && v.memory) {
      return false;
    }
    return true;
  });
}

export function isProductSelectionInStock(
  product: Product,
  opts?: { color?: string; memory?: string; variantId?: string },
): boolean {
  const variants = product.variants ?? [];
  if (variants.length > 0) {
    const selected = findProductVariant(product, opts);
    return selected?.inStock === true;
  }
  return product.inStock !== false;
}

export function resolveVariantId(
  product: Product,
  opts?: { color?: string; memory?: string; variantId?: string },
): string | undefined {
  if (opts?.variantId) return opts.variantId;

  const variants = product.variants ?? [];
  if (variants.length === 0) return product.defaultVariantId;

  const match = findProductVariant(product, opts);
  if (match) return match.id;

  return (
    product.defaultVariantId ??
    variants.find((v) => v.inStock)?.id ??
    variants[0]?.id
  );
}
