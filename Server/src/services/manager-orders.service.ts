import { randomUUID } from 'node:crypto';
import { Op } from 'sequelize';
import { toNumber } from '../lib/decimal.js';
import { NotFoundError, ValidationError } from '../lib/errors.js';
import { isoTimestamp } from '../lib/model-attrs.js';
import { fulfillOrderStock, releaseOrderStockReservations } from '../lib/order-stock.js';
import { paginationOffset, parsePagination } from '../lib/pagination.js';
import { runInTransaction } from '../lib/transaction.js';
import {
  ManagerNote,
  Order,
  OrderDelivery,
  OrderItem,
  OrderPayment,
  OrderStatusHistory,
} from '../models/order.js';
import { PaymentMethod } from '../models/reference.js';
import { StaffUser } from '../models/user.js';
import { publishOutboxEvent } from './outbox.service.js';
import { invalidateCatalogAndHomeCache } from './cache-invalidation.service.js';

export const MANAGER_ORDER_STATUSES = [
  'confirmed',
  'awaiting_payment',
  'paid',
  'shipping',
  'delivered',
  'cancelled',
] as const;

export type ManagerOrderStatus = (typeof MANAGER_ORDER_STATUSES)[number];

function mapManagerListItem(order: Order) {
  return {
    id: order.id,
    orderNumber: order.order_number,
    status: order.status,
    totalRub: toNumber(order.total),
    itemsCount: (order.items ?? []).reduce((sum, item) => sum + item.quantity, 0),
    customer: {
      firstName: order.get('customer_first_name') as string,
      lastName: order.get('customer_last_name') as string,
      phone: order.get('customer_phone') as string,
    },
    assignedManagerId: (order.get('assigned_manager_id') as string | null) ?? null,
    createdAt: isoTimestamp(order, 'createdAt'),
  };
}

/** Точный count без include (для бейджа новых заказов в админке). */
export async function countOrdersByStatus(status: string): Promise<number> {
  return Order.count({ where: { status } });
}

export async function listManagerOrders(
  staffId: string,
  staffRole: string,
  query: Record<string, unknown>,
) {
  const { page, limit } = parsePagination(query);
  const offset = paginationOffset({ page, limit });

  const where: Record<string, unknown> = {};
  if (typeof query.status === 'string' && query.status.length > 0) {
    where.status = query.status;
  }

  const assignedTo = typeof query.assignedTo === 'string' ? query.assignedTo : 'me';
  if (assignedTo === 'me') {
    where.assigned_manager_id = staffId;
  } else if (assignedTo !== 'all') {
    throw new ValidationError('assignedTo must be me or all');
  } else if (staffRole !== 'admin' && staffRole !== 'manager') {
    throw new ValidationError('Invalid staff role');
  }

  const { rows, count } = await Order.findAndCountAll({
    where,
    order: [['created_at', 'DESC']],
    limit,
    offset,
    attributes: [
      'id',
      'order_number',
      'status',
      'total',
      'customer_first_name',
      'customer_last_name',
      'customer_phone',
      'assigned_manager_id',
      'createdAt',
    ],
    include: [{ model: OrderItem, as: 'items', attributes: ['quantity'] }],
  });

  return {
    items: rows.map(mapManagerListItem),
    meta: { page, limit, total: count },
  };
}

export async function getManagerOrderById(orderId: string) {
  const order = await Order.findByPk(orderId, {
    include: [
      { model: OrderItem, as: 'items' },
      { model: OrderDelivery, as: 'delivery' },
      {
        model: OrderPayment,
        as: 'payment',
        include: [{ model: PaymentMethod, as: 'method', attributes: ['code', 'name'] }],
      },
      {
        model: ManagerNote,
        as: 'notes',
        order: [['created_at', 'ASC']],
      },
      {
        model: OrderStatusHistory,
        as: 'statusHistory',
        order: [['created_at', 'ASC']],
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
    userId: (order.get('user_id') as string | null) ?? null,
    assignedManagerId: (order.get('assigned_manager_id') as string | null) ?? null,
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
    notes: (order.notes ?? []).map((note) => ({
      id: note.id,
      staffUserId: note.staff_user_id,
      text: note.text,
      createdAt: isoTimestamp(note, 'createdAt'),
    })),
    statusHistory: (order.statusHistory ?? []).map((entry) => ({
      id: entry.id,
      fromStatus: entry.from_status,
      toStatus: entry.to_status,
      staffUserId: entry.staff_user_id,
      note: entry.note,
      createdAt: isoTimestamp(entry, 'createdAt'),
    })),
    createdAt: isoTimestamp(order, 'createdAt'),
  };
}

export async function updateManagerOrderStatus(
  orderId: string,
  staffId: string,
  input: { status: ManagerOrderStatus; comment?: string },
) {
  if (!MANAGER_ORDER_STATUSES.includes(input.status)) {
    throw new ValidationError('Invalid order status');
  }

  const result = await runInTransaction(async (transaction) => {
    const order = await Order.findByPk(orderId, {
      lock: transaction.LOCK.UPDATE,
      transaction,
    });

    if (!order) {
      throw new NotFoundError('Order not found');
    }

    const previousStatus = order.status;
    if (previousStatus === input.status) {
      return { stockChanged: false };
    }

    const [items, payment] = await Promise.all([
      OrderItem.findAll({ where: { order_id: orderId }, transaction }),
      OrderPayment.findOne({ where: { order_id: orderId }, transaction }),
    ]);

    let stockChanged = false;

    if (input.status === 'cancelled' && previousStatus !== 'paid' && previousStatus !== 'cancelled') {
      await releaseOrderStockReservations(items, transaction);
      stockChanged = true;
    }

    if (input.status === 'paid' && previousStatus !== 'paid') {
      await fulfillOrderStock(items, transaction);
      stockChanged = true;
      if (payment) {
        await payment.update(
          {
            is_paid: true,
            paid_at: new Date(),
            paid_amount: order.total,
          },
          { transaction },
        );
      }

      await publishOutboxEvent(
        {
          event_type: 'order.paid',
          aggregate_type: 'order',
          aggregate_id: order.id,
          payload: {
            orderId: order.id,
            orderNumber: order.order_number,
            totalRub: toNumber(order.total),
          },
        },
        transaction,
      );
    }

    await order.update({ status: input.status }, { transaction });

    await OrderStatusHistory.create(
      {
        id: randomUUID(),
        order_id: order.id,
        from_status: previousStatus,
        to_status: input.status,
        staff_user_id: staffId,
        note: input.comment ?? null,
      },
      { transaction },
    );

    return { stockChanged };
  });

  if (result.stockChanged) {
    await invalidateCatalogAndHomeCache();
  }

  return getManagerOrderById(orderId);
}

export async function addManagerOrderNote(
  orderId: string,
  staffId: string,
  text: string,
) {
  const order = await Order.findByPk(orderId, { attributes: ['id'] });
  if (!order) {
    throw new NotFoundError('Order not found');
  }

  const note = await ManagerNote.create({
    id: randomUUID(),
    order_id: orderId,
    staff_user_id: staffId,
    text,
  });

  return {
    id: note.id,
    staffUserId: note.staff_user_id,
    text: note.text,
    createdAt: isoTimestamp(note, 'createdAt'),
  };
}

export async function assignManagerOrder(orderId: string, managerId: string) {
  const order = await Order.findByPk(orderId);
  if (!order) {
    throw new NotFoundError('Order not found');
  }

  const manager = await StaffUser.findOne({
    where: {
      id: managerId,
      is_active: true,
      role: { [Op.in]: ['manager', 'admin'] },
    },
  });

  if (!manager) {
    throw new NotFoundError('Manager not found');
  }

  await order.update({ assigned_manager_id: managerId });

  return {
    orderId: order.id,
    assignedManagerId: managerId,
  };
}
