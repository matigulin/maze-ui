import { isActiveOrderStatus } from "@/entities/order";
import type { UserOrderListItem } from "../api/user-orders-api";

export function groupUserOrders(orders: UserOrderListItem[]) {
  const active: UserOrderListItem[] = [];
  const completed: UserOrderListItem[] = [];

  for (const order of orders) {
    if (isActiveOrderStatus(order.status)) active.push(order);
    else completed.push(order);
  }

  return { active, completed };
}
