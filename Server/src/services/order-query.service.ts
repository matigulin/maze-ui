import { toNumber } from '../lib/decimal.js';
import { NotFoundError } from '../lib/errors.js';
import { paginationOffset, parsePagination } from '../lib/pagination.js';
import { Order, OrderDelivery, OrderItem, OrderPayment } from '../models/order.js';
import { PaymentMethod } from '../models/reference.js';

export interface UserOrderListItem {
  id: string;
  orderNumber: string;
  status: string;
  totalRub: number;
  itemsCount: number;
  createdAt: string;
}

export interface UserOrderDetail {
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
}

export async function listUserOrders(userId: string, query: Record<string, unknown>) {
  const { page, limit } = parsePagination(query);
  const offset = paginationOffset({ page, limit });

  const { rows, count } = await Order.findAndCountAll({
    where: { user_id: userId },
    order: [['created_at', 'DESC']],
    limit,
    offset,
    attributes: [
      'id',
      'order_number',
      'status',
      'total',
      'created_at',
    ],
    include: [
      {
        model: OrderItem,
        as: 'items',
        attributes: ['quantity'],
      },
    ],
  });

  return {
    items: rows.map((order) => ({
      id: order.id,
      orderNumber: order.order_number,
      status: order.status,
      totalRub: toNumber(order.total),
      itemsCount: (order.items ?? []).reduce((sum, item) => sum + item.quantity, 0),
      createdAt: (order.get('created_at') as Date).toISOString(),
    })),
    meta: { page, limit, total: count },
  };
}

export async function getUserOrderById(
  userId: string,
  orderId: string,
): Promise<UserOrderDetail> {
  const order = await Order.findOne({
    where: { id: orderId, user_id: userId },
    include: [
      { model: OrderItem, as: 'items' },
      { model: OrderDelivery, as: 'delivery' },
      {
        model: OrderPayment,
        as: 'payment',
        include: [{ model: PaymentMethod, as: 'method', attributes: ['code', 'name'] }],
      },
    ],
  });

  if (!order) {
    throw new NotFoundError('Order not found');
  }

  const delivery = order.delivery;
  const payment = order.payment;

  return {
    id: order.id,
    orderNumber: order.order_number,
    status: order.status,
    customer: {
      firstName: order.get('customer_first_name') as string,
      lastName: order.get('customer_last_name') as string,
      phone: order.get('customer_phone') as string,
      email: (order.get('customer_email') as string | null) ?? null,
    },
    totals: {
      subtotalRub: toNumber(order.subtotal),
      deliveryRub: toNumber(order.delivery_price),
      paymentFeeRub: toNumber(order.payment_fee),
      installmentFeeRub: toNumber(order.installment_fee),
      totalRub: toNumber(order.total),
    },
    delivery: delivery
      ? {
          type: delivery.type,
          city: delivery.city,
          street: delivery.street,
          house: delivery.house,
          apartment: delivery.apartment,
          requiresPrepay: delivery.requires_prepay,
        }
      : null,
    payment: payment?.method
      ? {
          methodCode: payment.method.code,
          methodName: payment.method.name,
          isPaid: payment.is_paid,
        }
      : null,
    items: (order.items ?? []).map((item) => ({
      id: item.id,
      name: item.get('name') as string,
      image: item.get('image') as string,
      color: (item.get('color') as string | null) ?? null,
      memory: (item.get('memory') as string | null) ?? null,
      unitPrice: toNumber(item.get('unit_price') as string),
      quantity: item.quantity,
      lineTotal: toNumber(item.get('unit_price') as string) * item.quantity,
    })),
    comment: (order.get('comment') as string | null) ?? null,
    pricingVersion: order.pricing_version,
    createdAt: (order.get('created_at') as Date).toISOString(),
  };
}
