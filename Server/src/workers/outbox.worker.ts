import { getQueue, QUEUE_NAMES } from '../queues/index.js';
import {
  claimPendingOutboxEvents,
  markOutboxEventDone,
  markOutboxEventFailed,
} from '../services/outbox.service.js';

const POLL_INTERVAL_MS = 2000;

async function dispatchOutboxEvent(event: {
  id: string;
  event_type: string;
  payload: Record<string, unknown>;
}) {
  switch (event.event_type) {
    case 'order.created':
      await getQueue(QUEUE_NAMES.notifications).add(event.event_type, event.payload, {
        jobId: `outbox:${event.id}`,
      });
      break;
    case 'order.cancelled':
      await getQueue(QUEUE_NAMES.notifications).add(event.event_type, event.payload, {
        jobId: `outbox:${event.id}`,
      });
      break;
    case 'user.sms_verified':
      break;
    case 'staff.login_failed':
      break;
    default:
      break;
  }
}

async function pollOutbox() {
  const events = await claimPendingOutboxEvents(10);

  for (const event of events) {
    try {
      await dispatchOutboxEvent({
        id: event.id,
        event_type: event.event_type,
        payload: event.payload as Record<string, unknown>,
      });
      await markOutboxEventDone(event.id);
    } catch {
      await markOutboxEventFailed(event.id);
    }
  }
}

export function startOutboxPoller(): NodeJS.Timeout {
  const timer = setInterval(() => {
    void pollOutbox().catch(() => {
      // logged by caller / ignored between ticks
    });
  }, POLL_INTERVAL_MS);

  void pollOutbox();

  return timer;
}
