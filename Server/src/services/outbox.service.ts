import type { Transaction } from 'sequelize';
import { getSequelize } from '../config/database.js';
import { OutboxEvent } from '../models/order.js';

export async function publishOutboxEvent(
  event: {
    event_type: string;
    aggregate_type: string;
    aggregate_id: string;
    payload: Record<string, unknown>;
  },
  transaction?: Transaction,
): Promise<void> {
  await OutboxEvent.create(
    {
      event_type: event.event_type,
      aggregate_type: event.aggregate_type,
      aggregate_id: event.aggregate_id,
      payload: event.payload,
      status: 'pending',
    },
    { transaction },
  );
}

export async function claimPendingOutboxEvents(limit = 10) {
  const sequelize = getSequelize();

  return sequelize.transaction(async (transaction) => {
    const events = await OutboxEvent.findAll({
      where: { status: 'pending' },
      order: [['created_at', 'ASC']],
      limit,
      lock: transaction.LOCK.UPDATE,
      skipLocked: true,
      transaction,
    });

    if (events.length === 0) {
      return [];
    }

    await OutboxEvent.update(
      { status: 'processing' },
      {
        where: { id: events.map((event) => event.id) },
        transaction,
      },
    );

    return events;
  });
}

export async function markOutboxEventDone(eventId: string): Promise<void> {
  await OutboxEvent.update(
    { status: 'done', processed_at: new Date() },
    { where: { id: eventId } },
  );
}

export async function markOutboxEventFailed(eventId: string): Promise<void> {
  await OutboxEvent.update(
    { status: 'failed', processed_at: new Date() },
    { where: { id: eventId } },
  );
}
