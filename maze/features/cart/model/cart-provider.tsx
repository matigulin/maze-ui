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
import { useUserAuth } from "@/features/auth";
import { useModal } from "@/components/modals";
import {
  readCachedCart,
  readWishlist,
  writeCachedCart,
  writeWishlist,
} from "../lib/storage";

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
  const { ready, isAuthenticated, user, ensureAccessToken } = useUserAuth();
  const { open } = useModal();
  const [items, setItems] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [miniOpen, setMiniOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [cartLoading, setCartLoading] = useState(false);

  const cartAuth = useCallback(async () => {
    const accessToken = await ensureAccessToken();
    return { accessToken };
  }, [ensureAccessToken]);

  const refreshApiCart = useCallback(async () => {
    const userId = user?.id;

    if (!useApi || !isAuthenticated || !userId) {
      setItems([]);
      return;
    }

    setCartLoading(true);
    try {
      const token = await ensureAccessToken();
      if (!token) {
        setItems([]);
        return;
      }
      const next = await fetchCart(token);
      setItems(next);
      writeCachedCart(userId, next);
    } catch {
      const cached = readCachedCart(userId);
      if (cached) setItems(cached);
    } finally {
      setCartLoading(false);
    }
  }, [useApi, isAuthenticated, user?.id, ensureAccessToken]);

  const loadLocalCart = useCallback(() => {
    const userId = user?.id;
    if (!userId) {
      setItems([]);
      return;
    }
    setItems(readCachedCart(userId) ?? []);
  }, [user?.id]);

  useEffect(() => {
    if (!ready) return;

    async function hydrate() {
      try {
        setWishlist(readWishlist());

        if (isAuthenticated && user?.id) {
          if (useApi) {
            await refreshApiCart();
          } else {
            loadLocalCart();
          }
        } else {
          setItems([]);
        }
      } catch {
        /* ignore */
      }
      setHydrated(true);
    }

    void hydrate();
  }, [useApi, ready, isAuthenticated, user?.id, refreshApiCart, loadLocalCart]);

  useEffect(() => {
    if (hydrated && isAuthenticated && user?.id) {
      writeCachedCart(user.id, items);
    }
  }, [items, hydrated, isAuthenticated, user?.id]);

  useEffect(() => {
    if (hydrated) writeWishlist(wishlist);
  }, [wishlist, hydrated]);

  const requireAuthForCart = useCallback(() => {
    if (!ready) return false;
    if (isAuthenticated) return true;
    open("auth");
    return false;
  }, [ready, isAuthenticated, open]);

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
        if (!requireAuthForCart()) return;

        if (useApi) {
          const variantId = await loadVariantId(product, opts);
          if (!variantId) return;
          const next = await addCartLine(variantId, opts.qty ?? 1, await cartAuth());
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
        if (!requireAuthForCart()) return;

        if (useApi) {
          setItems(await removeCartLine(key, await cartAuth()));
          return;
        }
        setItems((prev) => prev.filter((i) => i.key !== key));
      },
      updateQty: async (key, qty) => {
        if (!requireAuthForCart()) return;

        if (useApi) {
          const nextQty = Math.max(0, qty);
          if (nextQty === 0) {
            setItems(await removeCartLine(key, await cartAuth()));
            return;
          }
          const lines = items.map((i) => ({
            variantId: i.variantId ?? i.key,
            quantity: i.key === key ? nextQty : i.qty,
          }));
          setItems(await replaceCartLines(lines, await cartAuth()));
          return;
        }
        setItems((prev) =>
          prev
            .map((i) => (i.key === key ? { ...i, qty: Math.max(0, qty) } : i))
            .filter((i) => i.qty > 0),
        );
      },
      clearCart: async () => {
        if (!requireAuthForCart()) return;

        if (useApi) {
          setItems(await clearCartApi(await cartAuth()));
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
  }, [
    items,
    wishlist,
    miniOpen,
    cartLoading,
    useApi,
    requireAuthForCart,
    cartAuth,
  ]);

  return <CartContext.Provider value={store}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
