import { apiPostJson } from "@/lib/api";
import type { ManagerOrderDetail } from "@/lib/admin/types";

/** Принять pending → awaiting_payment + демо-менеджер; note опционален. */
export async function acceptManagerOrder(
  orderId: string,
  accessToken: string,
  note?: string,
): Promise<ManagerOrderDetail> {
  const trimmed = note?.trim();
  return apiPostJson<ManagerOrderDetail>(
    `/manager/orders/${orderId}/accept`,
    trimmed ? { note: trimmed } : {},
    { accessToken },
  );
}

export async function addManagerOrderNote(
  orderId: string,
  accessToken: string,
  text: string,
): Promise<{ id: string; staffUserId: string; text: string; createdAt: string }> {
  return apiPostJson(
    `/manager/orders/${orderId}/notes`,
    { text },
    { accessToken },
  );
}
