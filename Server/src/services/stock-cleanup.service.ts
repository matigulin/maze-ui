import { randomUUID } from 'node:crypto';
import { Op } from 'sequelize';
import { ORDER_PENDING_RESERVE_TTL_MS } from '../lib/constants.js';
import { releaseOrderStockReservations } from '../lib/order-stock.js';
import { runInTransaction } from '../lib/transaction.js';
import { Order, OrderItem, OrderStatusHistory } from '../models/order.js';
import { publishOutboxEvent } from './outbox.service.js';
import { invalidateCatalogAndHomeCache } from './cache-invalidation.service.js';

const BATCH_SIZE = 50;

export async function releaseExpiredPendingOrderReservations() {
  const cutoff = new Date(Date.now() - ORDER_PENDING_RESERVE_TTL_MS);

  const orders = await Order.findAll({
    where: {
      status: 'pending',
      created_at: { [Op.lt]: cutoff },
    },
    include: [{ model: OrderItem, as: 'items' }],
    order: [['created_at', 'ASC']],
    limit: BATCH_SIZE,
  });

  let processed = 0;

  for (const order of orders) {
    await runInTransaction(async (transaction) => {
      const locked = await Order.findByPk(order.id, {
        lock: transaction.LOCK.UPDATE,
        transaction,
      });

      if (!locked || locked.status !== 'pending') {
        return;
      }

      const items = await OrderItem.findAll({
        where: { order_id: locked.id },
        transaction,
      });

      await releaseOrderStockReservations(items, transaction);
      await locked.update({ status: 'cancelled' }, { transaction });

      await OrderStatusHistory.create(
        {
          id: randomUUID(),
          order_id: locked.id,
          from_status: 'pending',
          to_status: 'cancelled',
          staff_user_id: null,
          note: 'Auto-cancelled: pending reservation expired',
        },
        { transaction },
      );

      await publishOutboxEvent(
        {
          event_type: 'order.cancelled',
          aggregate_type: 'order',
          aggregate_id: locked.id,
          payload: {
            orderId: locked.id,
            orderNumber: locked.order_number,
            reason: 'pending_reservation_expired',
          },
        },
        transaction,
      );
    });

    processed += 1;
  }

  if (processed > 0) {
    await invalidateCatalogAndHomeCache();
  }

  return { processed, cutoff: cutoff.toISOString() };
}
