"use client";

import { useState } from "react";
import {
  AdminButton,
  AdminTextarea,
  errorMessage,
} from "@/lib/admin/ui";
import { isNewOrderStatus } from "@/entities/order";
import {
  acceptManagerOrder,
  addManagerOrderNote,
} from "../api/order-actions";
import { rememberLastWorkedOrder } from "../lib/last-worked-order";
import { requestPendingOrdersCountRefresh } from "../lib/refresh-event";

export type OrderNoteRow = {
  id: string;
  text: string;
  createdAt: string;
};

type Props = {
  orderId: string;
  status: string;
  notes: OrderNoteRow[];
  ensureAccessToken: () => Promise<string | null>;
  formatDate: (iso: string) => string;
  /** После accept / add — уйти к списку и подсветить заказ. */
  onDone: (orderId: string) => void;
};

/**
 * Заметки по заказу.
 * Для статуса «Новый» (pending) — принятие в работу: статус «Ждёт оплату» + демо-менеджер.
 */
export function OrderNotesSection({
  orderId,
  status,
  notes,
  ensureAccessToken,
  formatDate,
  onDone,
}: Props) {
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isNew = isNewOrderStatus(status);

  async function withToken<T>(fn: (token: string) => Promise<T>): Promise<T> {
    const token = await ensureAccessToken();
    if (!token) throw new Error("Сессия истекла. Войдите снова.");
    return fn(token);
  }

  async function finish() {
    rememberLastWorkedOrder(orderId);
    requestPendingOrdersCountRefresh();
    onDone(orderId);
  }

  async function onAccept() {
    setSaving(true);
    setError(null);
    try {
      await withToken((t) => acceptManagerOrder(orderId, t, note));
      setNote("");
      await finish();
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setSaving(false);
    }
  }

  async function onAddNote() {
    setSaving(true);
    setError(null);
    try {
      await withToken((t) => addManagerOrderNote(orderId, t, note.trim()));
      setNote("");
      await finish();
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="rounded-2xl border border-line bg-panel/50 p-5">
      <h3 className="mb-3 font-display text-sm tracking-wide text-cyan">
        {isNew ? "Принятие заказа" : "Заметки"}
      </h3>

      {error && (
        <p className="mb-3 text-sm text-magenta" role="alert">
          {error}
        </p>
      )}

      <div className="mb-4 space-y-2">
        {notes.length === 0 && (
          <p className="text-sm text-muted">Заметок пока нет</p>
        )}
        {notes.map((n) => (
          <div
            key={n.id}
            className="rounded-xl border border-line bg-bg-2/50 px-3 py-2 text-sm"
          >
            <p className={n.text.trim() ? "text-ink" : "text-muted"}>
              {n.text.trim() || "Без текста"}
            </p>
            <p className="mt-1 text-xs text-faint">{formatDate(n.createdAt)}</p>
          </div>
        ))}
      </div>

      {isNew ? (
        <>
          <p className="mb-3 text-sm text-muted">
            Заказ будет переведён в «Ждёт оплату» и назначен демо-менеджеру.
          </p>
          <AdminTextarea
            label="Комментарий (необязательно)"
            value={note}
            onChange={setNote}
            rows={3}
          />
          <AdminButton
            className="mt-3"
            disabled={saving}
            onClick={() => void onAccept()}
          >
            Принять
          </AdminButton>
        </>
      ) : (
        <>
          <AdminTextarea
            label="Новая заметка (необязательно)"
            value={note}
            onChange={setNote}
            rows={3}
          />
          <AdminButton
            className="mt-3"
            disabled={saving}
            onClick={() => void onAddNote()}
          >
            Добавить
          </AdminButton>
        </>
      )}
    </section>
  );
}
