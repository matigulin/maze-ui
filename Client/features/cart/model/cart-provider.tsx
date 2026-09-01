"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { Product } from "@/lib/data";
import type { CartItem } from "./types";
import type { AddItemOpts, PendingAddItem } from "./pending-add";
import { shouldUseMocks } from "@/lib/mocks";
import { apiGet } from "@/lib/api";
import {
  addCartLine,
  clearCartApi,
  fetchCart,
  removeCartLine,
  replaceCartLines,
  resolveVariantId,
} from "../api/cart-api";
import {
  mapProductDetailToUiProduct,
  type ProductDetailDto,
} from "@/lib/mappers/catalog";
import {
  readCachedCart,
  readWishlist,
  writeCachedCart,
  writeWishlist,
} from "../lib/storage";

export type { CartItem } from "./types";
export type { AddItemOpts, PendingAddItem } from "./pending-add";

/** Auth dependency injected from app/widgets — feature не импортирует features/auth. */
export type CartAuthAdapter = {
  ready: boolean;
  isAuthenticated: boolean;
  userId: string | null;
  /** Контакты из профиля для префилла оформления (форма остаётся редактируемой). */
  checkoutContact: {
    userId: string;
    firstName: string | null;
    phone: string | null;
  } | null;
  ensureAccessToken: () => Promise<string | null>;
  onRequireAuth: () => void;
};

type Store = {
  items: CartItem[];
  wishlist: string[];
  miniOpen: boolean;
  count: number;
  subtotal: number;
  cartLoading: boolean;
  checkoutContact: CartAuthAdapter["checkoutContact"];
  ensureAccessToken: () => Promise<string | null>;
  addItem: (product: Product, opts?: AddItemOpts) => Promise<void>;
  /** Сброс отложенного add, если гость закрыл модалку входа. */
  dismissPendingAdd: () => void;
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

  const dto = await apiGet<ProductDetailDto>(
    `/catalog/products/${product.slug}`,
  );
  const mapped = mapProductDetailToUiProduct(dto);
  return resolveVariantId(mapped, opts);
}

export function CartProvider({
  children,
  auth,
}: {
  children: ReactNode;
  auth: CartAuthAdapter;
}) {
  const useApi = !shouldUseMocks();
  const { ready, isAuthenticated, userId, checkoutContact, ensureAccessToken, onRequireAuth } =
    auth;
  const [items, setItems] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [miniOpen, setMiniOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [cartLoading, setCartLoading] = useState(false);
  const pendingAddRef = useRef<PendingAddItem | null>(null);

  const cartAuth = useCallback(async () => {
    const accessToken = await ensureAccessToken();
    return { accessToken };
  }, [ensureAccessToken]);

  const refreshApiCart = useCallback(async () => {
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
  }, [useApi, isAuthenticated, userId, ensureAccessToken]);

  const loadLocalCart = useCallback(() => {
    if (!userId) {
      setItems([]);
      return;
    }
    setItems(readCachedCart(userId) ?? []);
  }, [userId]);

  /** Реальное добавление — только для уже авторизованного. */
  const commitAdd = useCallback(
    async (product: Product, opts: AddItemOpts = {}) => {
      if (useApi) {
        try {
          const variantId = await loadVariantId(product, opts);
          if (!variantId) return;
          const next = await addCartLine(
            variantId,
            opts.qty ?? 1,
            await cartAuth(),
          );
          setItems(next);
          if (!opts.silent && next.length > 0) setMiniOpen(true);
        } catch {
          /* сеть / API — мини-корзину не трогаем */
        }
        return;
      }

      const key = [product.slug, opts.color, opts.memory]
        .filter(Boolean)
        .join("|");
      setItems((prev) => {
        const found = prev.find((i) => i.key === key);
        const variantQty =
          product.variants?.find(
            (v) =>
              (opts.color == null || v.color === opts.color) &&
              (opts.memory == null ||
                v.memory == null ||
                v.memory === opts.memory),
          )?.quantityAvailable ??
          product.quantityAvailable ??
          0;
        const stockCap = Math.max(0, variantQty);
        if (found) {
          return prev.map((i) =>
            i.key === key
              ? {
                  ...i,
                  quantityAvailable: stockCap,
                  maxQuantity: Math.min(i.maxQuantity ?? 10, stockCap || 10),
                  qty: Math.min(
                    i.qty + (opts.qty ?? 1),
                    Math.min(i.maxQuantity ?? 10, stockCap || 10),
                  ),
                }
              : i,
          );
        }
        const maxQuantity = Math.min(10, stockCap || 10);
        return [
          ...prev,
          {
            key,
            product,
            qty: Math.min(opts.qty ?? 1, maxQuantity),
            maxQuantity,
            quantityAvailable: stockCap,
            color: opts.color,
            memory: opts.memory,
            variantId: opts.variantId,
          },
        ];
      });
      if (!opts.silent) setMiniOpen(true);
    },
    [useApi, cartAuth],
  );

  const commitAddRef = useRef(commitAdd);

  useEffect(() => {
    commitAddRef.current = commitAdd;
  }, [commitAdd]);

  useEffect(() => {
    if (!ready) return;

    let cancelled = false;

    async function hydrate() {
      try {
        setWishlist(readWishlist());

        if (isAuthenticated && userId) {
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

      if (cancelled) return;
      setHydrated(true);

      // После входа: корзина уже подтянута — затем отложенный add с карточки.
      const pending = pendingAddRef.current;
      if (pending && isAuthenticated) {
        pendingAddRef.current = null;
        await commitAddRef.current(pending.product, pending.opts);
      }
    }

    void hydrate();
    return () => {
      cancelled = true;
    };
  }, [
    useApi,
    ready,
    isAuthenticated,
    userId,
    refreshApiCart,
    loadLocalCart,
  ]);

  useEffect(() => {
    if (hydrated && isAuthenticated && userId) {
      writeCachedCart(userId, items);
    }
  }, [items, hydrated, isAuthenticated, userId]);

  useEffect(() => {
    if (hydrated) writeWishlist(wishlist);
  }, [wishlist, hydrated]);

  const requireAuthForCart = useCallback(() => {
    if (!ready) return false;
    if (isAuthenticated) return true;
    onRequireAuth();
    return false;
  }, [ready, isAuthenticated, onRequireAuth]);

  const addItem = useCallback(
    async (product: Product, opts: AddItemOpts = {}) => {
      if (!ready) return;
      if (!isAuthenticated) {
        pendingAddRef.current = { product, opts };
        onRequireAuth();
        return;
      }
      await commitAdd(product, opts);
    },
    [ready, isAuthenticated, onRequireAuth, commitAdd],
  );

  const dismissPendingAdd = useCallback(() => {
    pendingAddRef.current = null;
  }, []);

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
      checkoutContact,
      ensureAccessToken,
      setMiniOpen,
      addItem,
      dismissPendingAdd,
      removeItem: async (key) => {
        if (!requireAuthForCart()) return;

        if (useApi) {
          try {
            setItems(await removeCartLine(key, await cartAuth()));
          } catch {
            /* ignore */
          }
          return;
        }
        setItems((prev) => prev.filter((i) => i.key !== key));
      },
      updateQty: async (key, qty) => {
        if (!requireAuthForCart()) return;

        const line = items.find((i) => i.key === key);
        const maxQty = line?.maxQuantity ?? 10;
        const nextQty = Math.min(Math.max(0, qty), maxQty);

        if (useApi) {
          try {
            if (nextQty === 0) {
              setItems(await removeCartLine(key, await cartAuth()));
              return;
            }
            if (line && nextQty === line.qty) return;
            const lines = items.map((i) => ({
              variantId: i.variantId ?? i.key,
              quantity: i.key === key ? nextQty : i.qty,
            }));
            setItems(await replaceCartLines(lines, await cartAuth()));
          } catch {
            /* ignore */
          }
          return;
        }
        setItems((prev) =>
          prev
            .map((i) => {
              if (i.key !== key) return i;
              const cap = i.maxQuantity ?? 10;
              return { ...i, qty: Math.min(Math.max(0, qty), cap) };
            })
            .filter((i) => i.qty > 0),
        );
      },
      clearCart: async () => {
        if (!requireAuthForCart()) return;

        if (useApi) {
          try {
            setItems(await clearCartApi(await cartAuth()));
          } catch {
            /* ignore */
          }
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
    checkoutContact,
    useApi,
    requireAuthForCart,
    cartAuth,
    ensureAccessToken,
    addItem,
    dismissPendingAdd,
  ]);

  return <CartContext.Provider value={store}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
