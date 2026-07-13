/** Диспатч после смены статуса заказа — обновить бейдж в сайдбаре/обзоре. */
export const PENDING_ORDERS_COUNT_REFRESH_EVENT =
  "maze:pending-orders-count-refresh";

export function requestPendingOrdersCountRefresh() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(PENDING_ORDERS_COUNT_REFRESH_EVENT));
}
