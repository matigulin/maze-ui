const STORAGE_KEY = "maze:admin:last-worked-order-id";

/** Запомнить заказ, с которым только что работали в админке. */
export function rememberLastWorkedOrder(orderId: string) {
  try {
    sessionStorage.setItem(STORAGE_KEY, orderId);
  } catch {
    /* private mode */
  }
}

export function readLastWorkedOrderId(): string | null {
  try {
    return sessionStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

/** URL списка после accept/add: подсветка последнего заказа. */
export function adminOrdersListHref(orderId: string) {
  return `/admin/orders?focus=${encodeURIComponent(orderId)}`;
}
