"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { Product } from "@/lib/data";

export type CartItem = {
  key: string;
  product: Product;
  qty: number;
  color?: string;
  memory?: string;
};

type Store = {
  items: CartItem[];
  wishlist: string[];
  miniOpen: boolean;
  count: number;
  subtotal: number;
  addItem: (
    product: Product,
    opts?: { color?: string; memory?: string; qty?: number; silent?: boolean },
  ) => void;
  removeItem: (key: string) => void;
  updateQty: (key: string, qty: number) => void;
  clearCart: () => void;
  toggleWishlist: (id: string) => void;
  isWished: (id: string) => boolean;
  setMiniOpen: (v: boolean) => void;
};

const CartContext = createContext<Store | null>(null);

const LS_CART = "maze:cart";
const LS_WISH = "maze:wishlist";

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [miniOpen, setMiniOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  // загрузка
  useEffect(() => {
    try {
      const c = localStorage.getItem(LS_CART);
      const w = localStorage.getItem(LS_WISH);
      if (c) setItems(JSON.parse(c));
      if (w) setWishlist(JSON.parse(w));
    } catch {
      /* ignore */
    }
    setHydrated(true);
  }, []);

  // сохранение
  useEffect(() => {
    if (hydrated) localStorage.setItem(LS_CART, JSON.stringify(items));
  }, [items, hydrated]);
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
      setMiniOpen,
      addItem: (product, opts = {}) => {
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
            },
          ];
        });
        if (!opts.silent) setMiniOpen(true);
      },
      removeItem: (key) => setItems((prev) => prev.filter((i) => i.key !== key)),
      updateQty: (key, qty) =>
        setItems((prev) =>
          prev
            .map((i) => (i.key === key ? { ...i, qty: Math.max(0, qty) } : i))
            .filter((i) => i.qty > 0),
        ),
      clearCart: () => setItems([]),
      toggleWishlist: (id) =>
        setWishlist((prev) =>
          prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
        ),
      isWished: (id) => wishlist.includes(id),
    };
  }, [items, wishlist, miniOpen, hydrated]);

  return <CartContext.Provider value={store}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
