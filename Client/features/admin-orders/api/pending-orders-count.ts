import { apiGet } from "@/lib/api";

/** Число заказов со статусом pending («Новый»). */
export async function fetchPendingOrdersCount(
  accessToken: string,
): Promise<number> {
  const data = await apiGet<{ count: number }>(
    "/manager/orders/pending-count",
    undefined,
    { accessToken },
  );
  return data.count ?? 0;
}
