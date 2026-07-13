export const ACCESS_TOKEN_TTL_SEC = 15 * 60;
export const REFRESH_TOKEN_TTL_SEC = 7 * 24 * 60 * 60;
export const OTP_TTL_SEC = 5 * 60;
export const OTP_LENGTH = 4;
export const OTP_MAX_ATTEMPTS = 5;
export const CART_TTL_SEC = 365 * 24 * 60 * 60;
export const CART_MAX_ITEMS = 30;
export const CART_MAX_QTY_PER_ITEM = 10;
export const DELIVERY_QUOTE_TTL_SEC = 15 * 60;
export const ORDER_PENDING_RESERVE_TTL_MS = 24 * 60 * 60 * 1000;
export const STOCK_CLEANUP_INTERVAL_MS = 15 * 60 * 1000;

export const DELIVERY_PROVIDERS = [
  'pickup',
  'spb_courier',
  'spb_yandex',
  'rf_cdek',
  'rf_yandex',
] as const;

export type DeliveryProviderType = (typeof DELIVERY_PROVIDERS)[number];

export const COOKIE_NAMES = {
  USER_REFRESH: 'maze_refresh',
  STAFF_REFRESH: 'maze_staff_refresh',
  GUEST: 'maze_guest',
} as const;
