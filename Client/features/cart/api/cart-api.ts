import { apiDelete, apiGet, apiPostJson, apiPutJson } from "@/lib/api";
import type { Product } from "@/lib/data";
import { resolveMediaUrl } from "@/lib/media-url";
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
  quantityAvailable: number;
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
    quantityAvailable: line.quantityAvailable,
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
      imageUrl: resolveMediaUrl(line.mainImageUrl),
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

export function resolveVariantId(
  product: Product,
  opts?: { color?: string; memory?: string; variantId?: string },
): string | undefined {
  if (opts?.variantId) return opts.variantId;
  if (product.defaultVariantId) return product.defaultVariantId;

  const variants = product.variants ?? [];
  if (variants.length === 0) return undefined;

  const match = variants.find((v) => {
    if (opts?.memory && v.memory !== opts.memory) return false;
    if (opts?.color && v.color !== opts.color) return false;
    return (v.quantityAvailable ?? 0) > 0 || v.inStock;
  });

  return (
    match?.id ??
    variants.find((v) => (v.quantityAvailable ?? 0) > 0 || v.inStock)?.id ??
    variants[0]?.id
  );
}
