"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { Product } from "@/lib/data";
import type { CartItem } from "@/lib/cart-types";
import { shouldUseMocks } from "@/lib/mocks";
import { apiGet } from "@/lib/api";
import {
  addCartLine,
  clearCartApi,
  fetchCart,
  removeCartLine,
  replaceCartLines,
  resolveVariantId,
} from "@/lib/cart-client";
import {
  mapProductDetailToUiProduct,
  type ProductDetailDto,
} from "@/lib/mappers/catalog";

export type { CartItem } from "@/lib/cart-types";

type Store = {
  items: CartItem[];
  wishlist: string[];
  miniOpen: boolean;
  count: number;
  subtotal: number;
  cartLoading: boolean;
  addItem: (
    product: Product,
    opts?: {
      color?: string;
      memory?: string;
      qty?: number;
      silent?: boolean;
      variantId?: string;
    },
  ) => Promise<void>;
  removeItem: (key: string) => Promise<void>;
  updateQty: (key: string, qty: number) => Promise<void>;
  clearCart: () => Promise<void>;
  toggleWishlist: (id: string) => void;
  isWished: (id: string) => boolean;
  setMiniOpen: (v: boolean) => void;
};

const CartContext = createContext<Store | null>(null);

const LS_CART = "maze:cart";
const LS_WISH = "maze:wishlist";

async function loadVariantId(
  product: Product,
  opts?: { color?: string; memory?: string; variantId?: string },
): Promise<string | undefined> {
  const direct = resolveVariantId(product, opts);
  if (direct) return direct;

  const dto = await apiGet<ProductDetailDto>(`/catalog/products/${product.slug}`);
  const mapped = mapProductDetailToUiProduct(dto);
  return resolveVariantId(mapped, opts);
}

export function CartProvider({ children }: { children: ReactNode }) {
  const useApi = !shouldUseMocks();
  const [items, setItems] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [miniOpen, setMiniOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [cartLoading, setCartLoading] = useState(false);

  const refreshApiCart = useCallback(async () => {
    if (!useApi) return;
    setCartLoading(true);
    try {
      setItems(await fetchCart());
    } catch {
      /* API недоступен — оставляем локальное состояние */
    } finally {
      setCartLoading(false);
    }
  }, [useApi]);

  useEffect(() => {
    async function hydrate() {
      try {
        const w = localStorage.getItem(LS_WISH);
        if (w) setWishlist(JSON.parse(w));

        if (useApi) {
          await refreshApiCart();
        } else {
          const c = localStorage.getItem(LS_CART);
          if (c) setItems(JSON.parse(c));
        }
      } catch {
        /* ignore */
      }
      setHydrated(true);
    }
    void hydrate();
  }, [useApi, refreshApiCart]);

  useEffect(() => {
    if (hydrated && !useApi) {
      localStorage.setItem(LS_CART, JSON.stringify(items));
    }
  }, [items, hydrated, useApi]);

  useEffect(() => {
    if (hydrated) localStorage.setItem(LS_WISH, JSON.stringify(wishlist));
  }, [wishlist, hydrated]);

  const store = useMemo<Store>(() => {
    const count = items.reduce((s, i) => s + i.qty, 0);
    const subtotal = items.reduce((s, i) => s + i.product.price * i.qty, 0);

    return {
      items,
      wishlist,
      miniOpen,
      count,
      subtotal,
      cartLoading,
      setMiniOpen,
      addItem: async (product, opts = {}) => {
        if (useApi) {
          const variantId = await loadVariantId(product, opts);
          if (!variantId) return;
          const next = await addCartLine(variantId, opts.qty ?? 1);
          setItems(next);
        } else {
          const key = [product.slug, opts.color, opts.memory]
            .filter(Boolean)
            .join("|");
          setItems((prev) => {
            const found = prev.find((i) => i.key === key);
            if (found) {
              return prev.map((i) =>
                i.key === key ? { ...i, qty: i.qty + (opts.qty ?? 1) } : i,
              );
            }
            return [
              ...prev,
              {
                key,
                product,
                qty: opts.qty ?? 1,
                color: opts.color,
                memory: opts.memory,
                variantId: opts.variantId,
              },
            ];
          });
        }
        if (!opts.silent) setMiniOpen(true);
      },
      removeItem: async (key) => {
        if (useApi) {
          const next = await removeCartLine(key);
          setItems(next);
          return;
        }
        setItems((prev) => prev.filter((i) => i.key !== key));
      },
      updateQty: async (key, qty) => {
        if (useApi) {
          const nextQty = Math.max(0, qty);
          if (nextQty === 0) {
            const next = await removeCartLine(key);
            setItems(next);
            return;
          }
          const lines = items.map((i) => ({
            variantId: i.variantId ?? i.key,
            quantity: i.key === key ? nextQty : i.qty,
          }));
          const next = await replaceCartLines(lines);
          setItems(next);
          return;
        }
        setItems((prev) =>
          prev
            .map((i) => (i.key === key ? { ...i, qty: Math.max(0, qty) } : i))
            .filter((i) => i.qty > 0),
        );
      },
      clearCart: async () => {
        if (useApi) {
          const next = await clearCartApi();
          setItems(next);
          return;
        }
        setItems([]);
      },
      toggleWishlist: (id) =>
        setWishlist((prev) =>
          prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
        ),
      isWished: (id) => wishlist.includes(id),
    };
  }, [items, wishlist, miniOpen, cartLoading, useApi]);

  return <CartContext.Provider value={store}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
