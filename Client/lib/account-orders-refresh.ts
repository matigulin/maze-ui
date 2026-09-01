export const ACCOUNT_ORDERS_REFRESH_EVENT = "maze:account-orders-refresh";

export function requestAccountOrdersRefresh() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(ACCOUNT_ORDERS_REFRESH_EVENT));
}
