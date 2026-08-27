import { apiGet } from "@/lib/api";

/** Сервер (`pagination.ts`): limit max 48. */
export const USER_ORDERS_PAGE_LIMIT = 48;

export type UserOrderListItem = {
  id: string;
  orderNumber: string;
  status: string;
  totalRub: number;
  itemsCount: number;
  createdAt: string;
};

export type UserOrderDetail = {
  id: string;
  orderNumber: string;
  status: string;
  customer: {
    firstName: string;
    lastName: string;
    phone: string;
    email: string | null;
  };
  totals: {
    subtotalRub: number;
    deliveryRub: number;
    paymentFeeRub: number;
    installmentFeeRub: number;
    totalRub: number;
  };
  delivery: {
    type: string;
    city: string;
    street: string;
    house: string;
    apartment: string | null;
    requiresPrepay: boolean;
  } | null;
  payment: {
    methodCode: string;
    methodName: string;
    isPaid: boolean;
  } | null;
  items: Array<{
    id: string;
    name: string;
    image: string;
    color: string | null;
    memory: string | null;
    unitPrice: number;
    quantity: number;
    lineTotal: number;
  }>;
  comment: string | null;
  pricingVersion: string;
  createdAt: string;
};

export async function fetchUserOrders(
  accessToken: string,
  query?: { page?: number; limit?: number },
): Promise<UserOrderListItem[]> {
  return apiGet<UserOrderListItem[]>("/me/orders", {
    page: query?.page ?? 1,
    limit: query?.limit ?? USER_ORDERS_PAGE_LIMIT,
  }, { accessToken });
}

export async function fetchUserOrder(
  accessToken: string,
  orderId: string,
): Promise<UserOrderDetail> {
  return apiGet<UserOrderDetail>(`/me/orders/${orderId}`, undefined, {
    accessToken,
  });
}
