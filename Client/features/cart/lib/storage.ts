import type { CartItem } from "../model/types";

const LS_WISH = "maze:wishlist";

/** Клиентский кэш корзины и избранного — ~1 год, обновляется при каждой записи. */
export const CLIENT_PERSIST_TTL_MS = 365 * 24 * 60 * 60 * 1000;

type PersistEnvelope<T> = {
  savedAt: number;
  data: T;
};

export function cartStorageKey(userId: string) {
  return `maze:cart:${userId}`;
}

function isExpired(savedAt: number): boolean {
  return Date.now() - savedAt > CLIENT_PERSIST_TTL_MS;
}

function readEnvelope<T>(raw: string): T | null {
  try {
    const parsed = JSON.parse(raw) as PersistEnvelope<T> | T;
    if (
      parsed &&
      typeof parsed === "object" &&
      "savedAt" in parsed &&
      "data" in parsed
    ) {
      const env = parsed as PersistEnvelope<T>;
      if (typeof env.savedAt !== "number" || isExpired(env.savedAt)) {
        return null;
      }
      return env.data;
    }
    // Legacy: сырой массив без envelope — принимаем и при следующем write обновим формат.
    return parsed as T;
  } catch {
    return null;
  }
}

function writeEnvelope<T>(key: string, data: T) {
  try {
    const envelope: PersistEnvelope<T> = { savedAt: Date.now(), data };
    localStorage.setItem(key, JSON.stringify(envelope));
  } catch {
    /* ignore quota / private mode */
  }
}

export function readCachedCart(userId: string): CartItem[] | null {
  try {
    const raw = localStorage.getItem(cartStorageKey(userId));
    if (!raw) return null;
    const data = readEnvelope<CartItem[]>(raw);
    return Array.isArray(data) ? data : null;
  } catch {
    return null;
  }
}

export function writeCachedCart(userId: string, items: CartItem[]) {
  writeEnvelope(cartStorageKey(userId), items);
}

export function readWishlist(): string[] {
  try {
    const raw = localStorage.getItem(LS_WISH);
    if (!raw) return [];
    const data = readEnvelope<string[]>(raw);
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

export function writeWishlist(ids: string[]) {
  writeEnvelope(LS_WISH, ids);
}
