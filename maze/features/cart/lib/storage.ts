import type { CartItem } from "../model/types";

const LS_WISH = "maze:wishlist";

export function cartStorageKey(userId: string) {
  return `maze:cart:${userId}`;
}

export function readCachedCart(userId: string): CartItem[] | null {
  try {
    const raw = localStorage.getItem(cartStorageKey(userId));
    if (!raw) return null;
    return JSON.parse(raw) as CartItem[];
  } catch {
    return null;
  }
}

export function writeCachedCart(userId: string, items: CartItem[]) {
  try {
    localStorage.setItem(cartStorageKey(userId), JSON.stringify(items));
  } catch {
    /* ignore quota / private mode */
  }
}

export function readWishlist(): string[] {
  try {
    const raw = localStorage.getItem(LS_WISH);
    if (!raw) return [];
    return JSON.parse(raw) as string[];
  } catch {
    return [];
  }
}

export function writeWishlist(ids: string[]) {
  try {
    localStorage.setItem(LS_WISH, JSON.stringify(ids));
  } catch {
    /* ignore */
  }
}
