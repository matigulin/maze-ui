"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useAdminApi } from "@/lib/admin/client";
import {
  AdminAlert,
  AdminButton,
  AdminPageHeader,
  AdminSelect,
  AdminTable,
  AdminTd,
  AdminTh,
  AdminTextarea,
  errorMessage,
  formatPrice,
} from "@/lib/admin/ui";
import type {
  ManagerOrderDetail,
  ManagerOrderListItem,
  ManagerOrderStatus,
  ManagerStaffRow,
} from "@/lib/admin/types";
import { useStaffAuth } from "@/components/staff/StaffAuthProvider";

const STATUS_LABEL: Record<string, string> = {
  pending: "Новый",
  confirmed: "Подтверждён",
  awaiting_payment: "Ждёт оплату",
  paid: "Оплачен",
  shipping: "В доставке",
  delivered: "Доставлен",
  cancelled: "Отменён",
};

const DELIVERY_LABEL: Record<string, string> = {
  pickup: "Самовывоз",
  spb_courier: "Курьер по СПб",
  spb_yandex: "Яндекс Доставка (СПб)",
  rf_cdek: "СДЭК по РФ",
  rf_yandex: "Яндекс Доставка (РФ)",
};

const STATUS_ACTIONS: ManagerOrderStatus[] = [
  "confirmed",
  "awaiting_payment",
  "paid",
  "shipping",
  "delivered",
  "cancelled",
];

function statusLabel(status: string) {
  return STATUS_LABEL[status] ?? status;
}

function deliveryLabel(type: string) {
  return DELIVERY_LABEL[type] ?? type;
}

function formatDate(iso: string) {
  try {
    return new Intl.DateTimeFormat("ru-RU", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

export function OrdersListPage() {
  const api = useAdminApi();
  const [items, setItems] = useState<ManagerOrderListItem[]>([]);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError("");
      try {
        const res = await api.listOrders({
          page,
          limit: 24,
          assignedTo: "all",
          status: status || undefined,
        });
        if (cancelled) return;
        setItems(res.items);
        const total = res.meta?.total ?? res.items.length;
        const limit = res.meta?.limit ?? 24;
        setPages(Math.max(1, Math.ceil(total / limit)));
      } catch (e) {
        if (!cancelled) setError(errorMessage(e));
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
    // api is memoized; avoid putting the whole object if token refresh recreates it mid-flight
  }, [api, page, status]);

  return (
    <div>
      <AdminPageHeader
        title="Заказы"
        description="Клиенты, состав заказа, статусы и доставка"
        actions={
          <AdminSelect
            label="Статус"
            className="w-[200px]"
            value={status}
            onChange={(v) => {
              setPage(1);
              setStatus(v);
            }}
            options={[
              { value: "", label: "Все" },
              ...Object.entries(STATUS_LABEL).map(([value, label]) => ({
                value,
                label,
              })),
            ]}
          />
        }
      />

      {error && <AdminAlert>{error}</AdminAlert>}

      {loading ? (
        <p className="text-sm text-muted">Загрузка…</p>
      ) : items.length === 0 ? (
        <p className="rounded-2xl border border-line bg-panel/50 p-8 text-sm text-muted">
          Заказов пока нет.
        </p>
      ) : (
        <AdminTable>
          <thead>
            <tr>
              <AdminTh>Номер</AdminTh>
              <AdminTh>Клиент</AdminTh>
              <AdminTh>Статус</AdminTh>
              <AdminTh>Позиции</AdminTh>
              <AdminTh>Сумма</AdminTh>
              <AdminTh>Дата</AdminTh>
              <AdminTh />
            </tr>
          </thead>
          <tbody>
            {items.map((order) => (
              <tr key={order.id}>
                <AdminTd>
                  <p className="font-medium text-cyan">{order.orderNumber}</p>
                </AdminTd>
                <AdminTd>
                  <p>
                    {order.customer.firstName} {order.customer.lastName}
                  </p>
                  <p className="text-xs text-muted">{order.customer.phone}</p>
                </AdminTd>
                <AdminTd>{statusLabel(order.status)}</AdminTd>
                <AdminTd>{order.itemsCount}</AdminTd>
                <AdminTd>{formatPrice(order.totalRub)}</AdminTd>
                <AdminTd className="text-muted">{formatDate(order.createdAt)}</AdminTd>
                <AdminTd>
                  <Link href={`/admin/orders/${order.id}`}>
                    <AdminButton variant="ghost">Открыть</AdminButton>
                  </Link>
                </AdminTd>
              </tr>
            ))}
          </tbody>
        </AdminTable>
      )}

      {pages > 1 && (
        <div className="mt-4 flex items-center gap-2">
          <AdminButton
            variant="secondary"
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            Назад
          </AdminButton>
          <span className="text-sm text-muted">
            {page} / {pages}
          </span>
          <AdminButton
            variant="secondary"
            disabled={page >= pages}
            onClick={() => setPage((p) => Math.min(pages, p + 1))}
          >
            Вперёд
          </AdminButton>
        </div>
      )}
    </div>
  );
}

export function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const api = useAdminApi();
  const { isAdmin } = useStaffAuth();
  const [order, setOrder] = useState<ManagerOrderDetail | null>(null);
  const [staff, setStaff] = useState<ManagerStaffRow[]>([]);
  const [error, setError] = useState("");
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;

    async function load() {
      setError("");
      try {
        const data = await api.getOrder(id);
        if (cancelled) return;
        setOrder(data);
        if (isAdmin) {
          const rows = await api.listStaff();
          if (!cancelled) setStaff(rows);
        }
      } catch (e) {
        if (!cancelled) setError(errorMessage(e));
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [api, id, isAdmin]);

  async function reload() {
    if (!id) return;
    const data = await api.getOrder(id);
    setOrder(data);
    if (isAdmin) {
      const rows = await api.listStaff();
      setStaff(rows);
    }
  }

  async function changeStatus(status: ManagerOrderStatus) {
    if (!id) return;
    setSaving(true);
    setError("");
    try {
      const next = await api.updateOrderStatus(id, { status });
      setOrder(next);
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setSaving(false);
    }
  }

  async function saveNote() {
    if (!id || !note.trim()) return;
    setSaving(true);
    setError("");
    try {
      await api.addOrderNote(id, note.trim());
      setNote("");
      await reload();
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setSaving(false);
    }
  }

  async function assign(managerId: string) {
    if (!id || !managerId) return;
    setSaving(true);
    setError("");
    try {
      await api.assignOrder(id, managerId);
      await reload();
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setSaving(false);
    }
  }

  if (!order && !error) {
    return <p className="text-sm text-muted">Загрузка заказа…</p>;
  }

  if (!order) {
    return (
      <div className="space-y-4">
        <AdminAlert>{error || "Заказ не найден"}</AdminAlert>
        <Link href="/admin/orders">
          <AdminButton variant="secondary">К списку</AdminButton>
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <AdminPageHeader
        title={order.orderNumber}
        description={`${statusLabel(order.status)} · ${formatDate(order.createdAt)}`}
        actions={
          <Link href="/admin/orders">
            <AdminButton variant="secondary">Все заказы</AdminButton>
          </Link>
        }
      />

      {error && <AdminAlert>{error}</AdminAlert>}

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="rounded-2xl border border-line bg-panel/50 p-5">
          <h3 className="font-display text-sm tracking-wide text-cyan">Клиент</h3>
          <p className="mt-3 text-ink">
            {order.customer.firstName} {order.customer.lastName}
          </p>
          <p className="text-sm text-muted">{order.customer.phone}</p>
          {order.customer.email && (
            <p className="text-sm text-muted">{order.customer.email}</p>
          )}
          {order.comment && (
            <p className="mt-3 text-sm text-muted">Комментарий: {order.comment}</p>
          )}
        </section>

        <section className="rounded-2xl border border-line bg-panel/50 p-5">
          <h3 className="font-display text-sm tracking-wide text-cyan">Доставка и оплата</h3>
          {order.delivery ? (
            <div className="mt-3 space-y-1 text-sm text-muted">
              <p className="text-ink">{deliveryLabel(order.delivery.type)}</p>
              <p>
                {order.delivery.city}, {order.delivery.street} {order.delivery.house}
                {order.delivery.apartment ? `, кв. ${order.delivery.apartment}` : ""}
              </p>
            </div>
          ) : (
            <p className="mt-3 text-sm text-muted">Нет данных о доставке</p>
          )}
          {order.payment && (
            <p className="mt-3 text-sm text-ink">
              {order.payment.methodName}
              <span className="ml-2 text-muted">
                {order.payment.isPaid ? "оплачен" : "не оплачен"}
              </span>
            </p>
          )}
        </section>
      </div>

      <section className="rounded-2xl border border-line bg-panel/50 p-5">
        <h3 className="mb-4 font-display text-sm tracking-wide text-cyan">Состав заказа</h3>
        <AdminTable>
          <thead>
            <tr>
              <AdminTh>Товар</AdminTh>
              <AdminTh>Цена</AdminTh>
              <AdminTh>Кол-во</AdminTh>
              <AdminTh>Сумма</AdminTh>
            </tr>
          </thead>
          <tbody>
            {order.items.map((item) => (
              <tr key={item.id}>
                <AdminTd>
                  <p>{item.name}</p>
                  <p className="text-xs text-muted">
                    {[item.color, item.memory].filter(Boolean).join(" · ")}
                  </p>
                </AdminTd>
                <AdminTd>{formatPrice(item.unitPrice)}</AdminTd>
                <AdminTd>{item.quantity}</AdminTd>
                <AdminTd>{formatPrice(item.lineTotal)}</AdminTd>
              </tr>
            ))}
          </tbody>
        </AdminTable>
        <div className="mt-4 space-y-1 text-sm">
          <div className="flex justify-between text-muted">
            <span>Товары</span>
            <span>{formatPrice(order.totals.subtotalRub)}</span>
          </div>
          <div className="flex justify-between text-muted">
            <span>Доставка</span>
            <span>{formatPrice(order.totals.deliveryRub)}</span>
          </div>
          {order.totals.paymentFeeRub > 0 && (
            <div className="flex justify-between text-muted">
              <span>Комиссия оплаты</span>
              <span>{formatPrice(order.totals.paymentFeeRub)}</span>
            </div>
          )}
          <div className="flex justify-between border-t border-line pt-2 text-ink">
            <span>Итого</span>
            <span className="font-display text-lg">{formatPrice(order.totals.totalRub)}</span>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-line bg-panel/50 p-5">
        <h3 className="mb-3 font-display text-sm tracking-wide text-cyan">Статус</h3>
        <div className="flex flex-wrap gap-2">
          {STATUS_ACTIONS.map((s) => (
            <AdminButton
              key={s}
              variant={order.status === s ? "primary" : "secondary"}
              disabled={saving || order.status === s}
              onClick={() => void changeStatus(s)}
            >
              {statusLabel(s)}
            </AdminButton>
          ))}
        </div>
      </section>

      {isAdmin && (
        <section className="rounded-2xl border border-line bg-panel/50 p-5">
          <AdminSelect
            label="Назначить менеджера"
            value={order.assignedManagerId ?? ""}
            onChange={(v) => void assign(v)}
            options={[
              { value: "", label: "Не назначен" },
              ...staff.map((s) => ({ value: s.id, label: `${s.name} (${s.role})` })),
            ]}
          />
        </section>
      )}

      <section className="rounded-2xl border border-line bg-panel/50 p-5">
        <h3 className="mb-3 font-display text-sm tracking-wide text-cyan">Заметки</h3>
        <div className="mb-4 space-y-2">
          {order.notes.length === 0 && (
            <p className="text-sm text-muted">Заметок пока нет</p>
          )}
          {order.notes.map((n) => (
            <div key={n.id} className="rounded-xl border border-line bg-bg-2/50 px-3 py-2 text-sm">
              <p className="text-ink">{n.text}</p>
              <p className="mt-1 text-xs text-faint">{formatDate(n.createdAt)}</p>
            </div>
          ))}
        </div>
        <AdminTextarea
          label="Новая заметка"
          value={note}
          onChange={setNote}
          rows={3}
        />
        <AdminButton className="mt-3" disabled={saving || !note.trim()} onClick={() => void saveNote()}>
          Добавить
        </AdminButton>
      </section>
    </div>
  );
}
