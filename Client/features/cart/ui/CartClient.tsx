"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  Minus,
  Plus,
  Trash2,
  ShoppingBag,
  Check,
  ArrowLeft,
  ChevronDown,
  MapPin,
  Truck,
  Package,
} from "lucide-react";
import { ProductThumb } from "@/components/ProductThumb";
import { Field } from "@/components/Field";
import { PhoneNationalField } from "@/components/PhoneNationalField";
import { Modal } from "@/components/modals";
import { formatPrice, plural, cn } from "@/lib/utils";
import { formatStockLabel } from "@/lib/stock";
import { scrollWindowToTop } from "@/lib/scroll";
import { checkoutCart } from "@/features/checkout";
import { requestAccountOrdersRefresh } from "@/lib/account-orders-refresh";
import { ApiError } from "@/lib/api";
import {
  digitsOnly,
  e164ToNationalDisplay,
  isValidRussianMobile,
  validateRussianMobile,
} from "@/lib/phone";
import { useCart } from "../model/cart-provider";

const DELIVERY = [
  {
    id: "pickup",
    label: "Самовывоз",
    detail: "Чайковского, 56",
    price: 0,
    Icon: MapPin,
  },
  {
    id: "courier",
    label: "Курьер по СПб",
    detail: "Сегодня–завтра",
    price: 500,
    Icon: Truck,
  },
  {
    id: "yandex",
    label: "Яндекс Доставка",
    detail: "По Санкт-Петербургу",
    price: 400,
    Icon: Package,
  },
  {
    id: "cdek",
    label: "СДЭК по РФ",
    detail: "3–7 дней",
    price: 450,
    Icon: Truck,
  },
] as const;

const PAYMENT = [
  { id: "cash", label: "Наличные", surcharge: 0, note: "" },
  { id: "card", label: "Карта / QR-код", surcharge: 0.07, note: "+7%" },
  { id: "credit", label: "Рассрочка 0%", surcharge: 0, note: "6 мес." },
];

type DeliveryId = (typeof DELIVERY)[number]["id"];

export function CartClient() {
  const {
    items,
    subtotal,
    count,
    updateQty,
    removeItem,
    clearCart,
    ensureAccessToken,
    checkoutContact,
  } = useCart();
  const [delivery, setDelivery] = useState<DeliveryId>(DELIVERY[0].id);
  const [payment, setPayment] = useState(PAYMENT[0].id);
  const [firstName, setFirstName] = useState("");
  const [phoneNational, setPhoneNational] = useState("");
  const [forcePhoneError, setForcePhoneError] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [doneOrder, setDoneOrder] = useState<string | null>(null);
  const successRef = useRef<HTMLDivElement>(null);
  /** Уже сделали полный prefill для этого userId (поля дальше редактируются). */
  const prefilledUserIdRef = useRef<string | null>(null);

  const contactUserId = checkoutContact?.userId ?? null;
  const contactFirstName = checkoutContact?.firstName ?? null;
  const contactLastName = checkoutContact?.lastName ?? null;
  const contactPhone = checkoutContact?.phone ?? null;

  useEffect(() => {
    if (!contactUserId) {
      prefilledUserIdRef.current = null;
      return;
    }

    const name = contactFirstName?.trim() ?? "";
    const isNewUser = prefilledUserIdRef.current !== contactUserId;

    if (isNewUser) {
      prefilledUserIdRef.current = contactUserId;
      setFirstName(name);
      setPhoneNational(
        contactPhone ? e164ToNationalDisplay(contactPhone) : "",
      );
      return;
    }

    // Имя/телефон сохранили в ЛК после первого захода на checkout — только в пустые поля.
    if (name) {
      setFirstName((cur) => (cur.trim() ? cur : name));
    }
    if (contactPhone) {
      setPhoneNational((cur) =>
        cur.trim() ? cur : e164ToNationalDisplay(contactPhone),
      );
    }
  }, [contactUserId, contactFirstName, contactPhone]);

  const deliveryPrice = DELIVERY.find((d) => d.id === delivery)?.price ?? 0;
  const surcharge = PAYMENT.find((p) => p.id === payment)?.surcharge ?? 0;
  const total = Math.round(subtotal * (1 + surcharge)) + deliveryPrice;
  const deliveryLabel =
    DELIVERY.find((d) => d.id === delivery)?.label ?? "Доставка";

  /** Один Idempotency-Key на intent — не менять при retry того же заказа. */
  const checkoutIntentKeyRef = useRef<string | null>(null);

  useEffect(() => {
    checkoutIntentKeyRef.current = null;
  }, [items, delivery, payment, firstName, phoneNational, contactLastName]);

  useEffect(() => {
    if (!doneOrder) return;
    scrollWindowToTop();
    // После смены вью — доскроллить к блоку успеха (на длинной странице / header)
    const id = window.setTimeout(() => {
      successRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 50);
    return () => window.clearTimeout(id);
  }, [doneOrder]);

  async function placeOrder() {
    if (submitting) return;
    setFormError(null);
    setSubmitting(true);
    try {
      const lines: Array<{ variantId: string; quantity: number }> = [];
      for (const it of items) {
        if (!it.variantId) {
          throw new Error(
            "В корзине есть товар без варианта. Обновите страницу или удалите позицию.",
          );
        }
        lines.push({ variantId: it.variantId, quantity: it.qty });
      }

      if (lines.length === 0) {
        throw new Error("В корзине нет вариантов товара");
      }

      const validated = validateRussianMobile(phoneNational);
      if (!validated.ok) {
        throw new Error(validated.message);
      }
      const phone = validated.e164;

      const accessToken = await ensureAccessToken();
      const city = delivery === "cdek" ? "Москва" : "Санкт-Петербург";
      const address =
        delivery === "pickup"
          ? undefined
          : { street: "Невский пр.", house: "1" };
      if (!checkoutIntentKeyRef.current) {
        checkoutIntentKeyRef.current = crypto.randomUUID();
      }
      const order = await checkoutCart({
        deliveryUiId: delivery,
        paymentUiId: payment,
        firstName,
        lastName: contactLastName?.trim() ?? "",
        phone,
        items: lines,
        accessToken,
        city,
        address,
        idempotencyKey: checkoutIntentKeyRef.current,
      });
      checkoutIntentKeyRef.current = null;
      setConfirmOpen(false);
      setDoneOrder(order.orderNumber);
      requestAccountOrdersRefresh();
      await clearCart();
    } catch (err) {
      const message =
        err instanceof ApiError
          ? err.message === "Cart is empty"
            ? "Корзина на сервере пуста. Обновите страницу и добавьте товар снова."
            : err.message === "Insufficient stock for one or more items" ||
                err.message === "Insufficient stock"
              ? "Недостаточно товара на складе. Уменьшите количество."
              : err.message
          : err instanceof Error
            ? err.message
            : "Не удалось оформить заказ";
      setFormError(message);
      setConfirmOpen(false);
    } finally {
      setSubmitting(false);
    }
  }

  if (doneOrder) {
    return (
      <motion.div
        ref={successRef}
        id="order-success"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass mx-auto max-w-lg scroll-mt-24 rounded-3xl p-8 text-center sm:p-10"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 260, damping: 18, delay: 0.1 }}
          className="mx-auto mb-6 grid h-20 w-20 place-items-center rounded-full bg-cyan/15 text-cyan glow-cyan"
        >
          <Check size={40} strokeWidth={2.5} />
        </motion.div>
        <h1 className="font-display text-2xl font-bold sm:text-3xl">
          Заказ оформлен!
        </h1>
        <p className="mt-2 text-muted">
          Заказ <span className="text-cyan">#{doneOrder}</span>{" "}
          принят. Менеджер свяжется с вами в ближайшее время.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link href="/account?tab=orders" className="btn-primary inline-flex">
            Мои заказы
          </Link>
          <Link href="/catalog" className="btn-ghost inline-flex">
            Продолжить покупки
          </Link>
        </div>
      </motion.div>
    );
  }

  if (items.length === 0) {
    return (
      <>
        <h1 className="mb-8 font-display text-3xl font-bold tracking-tight sm:text-5xl">
          Корзина
        </h1>
        <div className="glass mx-auto flex max-w-lg flex-col items-center gap-5 rounded-3xl p-12 text-center">
          <div className="grid h-20 w-20 place-items-center rounded-3xl bg-white/5 text-muted">
            <ShoppingBag size={34} />
          </div>
          <div>
            <h2 className="font-display text-xl font-bold">Корзина пуста</h2>
            <p className="mt-1 text-sm text-muted">
              Добавьте товары, чтобы продолжить оформление.
            </p>
          </div>
          <Link href="/catalog" className="btn-primary">
            Перейти в каталог
          </Link>
        </div>
      </>
    );
  }

  return (
    <>
      <h1 className="mb-8 font-display text-3xl font-bold tracking-tight sm:text-5xl">
        Корзина
      </h1>
    <div className="grid gap-6 lg:grid-cols-[1fr_22rem]">
      <Modal
        open={confirmOpen}
        onClose={() => {
          if (!submitting) setConfirmOpen(false);
        }}
        title="Подтверждение заказа"
      >
        <p className="text-sm leading-relaxed text-muted">
          Точно хотите оформить заказ на{" "}
          <span className="font-medium text-ink">{formatPrice(total)}</span>
          {" "}({deliveryLabel})?
        </p>
        <p className="mt-2 text-sm text-muted">
          {firstName}, {phoneNational ? `+7 ${phoneNational}` : "телефон не указан"}
        </p>
        <ul className="mt-4 space-y-2 rounded-xl border border-line bg-bg-2/40 px-3 py-2.5 text-sm">
          {items.map((it) => (
            <li key={it.key} className="flex items-start justify-between gap-3">
              <span className="min-w-0 flex-1 text-ink">
                <span className="line-clamp-1">{it.product.name}</span>
                <span className="mt-0.5 block text-[11px] text-faint">
                  {it.qty} шт. · {formatStockLabel(it.quantityAvailable ?? it.maxQuantity)}
                </span>
              </span>
              <span className="shrink-0 tabular-nums text-muted">
                {formatPrice(it.product.price * it.qty)}
              </span>
            </li>
          ))}
        </ul>
        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button
            type="button"
            disabled={submitting}
            onClick={() => setConfirmOpen(false)}
            className="btn-ghost w-full sm:w-auto"
          >
            Нет, назад
          </button>
          <button
            type="button"
            disabled={submitting}
            onClick={() => void placeOrder()}
            className="btn-primary w-full sm:w-auto"
          >
            {submitting ? "Оформляем…" : "Да, заказать"}
          </button>
        </div>
      </Modal>

      {/* Список товаров */}
      <div className="space-y-3">
        <div className="mb-1 flex items-center justify-between">
          <span className="text-sm text-muted">
            {count} {plural(count, ["товар", "товара", "товаров"])}
          </span>
          <button
            onClick={() => void clearCart()}
            className="text-xs text-faint transition-colors hover:text-magenta cursor-pointer"
          >
            Очистить корзину
          </button>
        </div>

        <AnimatePresence mode="popLayout">
          {items.map((it) => (
            <motion.div
              key={it.key}
              layout
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="glass flex min-w-0 gap-3 rounded-2xl p-3 sm:gap-4 sm:p-4"
            >
              <Link href={`/product/${it.product.slug}`} className="shrink-0">
                <ProductThumb
                  product={it.product}
                  className="h-20 w-20 sm:h-24 sm:w-24"
                  glyphClassName="text-[0.7rem]"
                />
              </Link>
              <div className="flex min-w-0 flex-1 flex-col">
                <Link
                  href={`/product/${it.product.slug}`}
                  className="line-clamp-2 break-words font-medium leading-snug transition-colors hover:text-cyan"
                >
                  {it.product.name}
                </Link>
                <p className="truncate text-xs text-faint">
                  {[it.color, it.memory].filter(Boolean).join(" · ")}
                </p>
                <p className="mt-1 truncate text-[11px] text-cyan">
                  {formatStockLabel(it.quantityAvailable ?? it.maxQuantity)}
                </p>
                <div className="mt-auto flex min-w-0 flex-wrap items-center justify-between gap-2 pt-2">
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-1 rounded-full border border-line p-0.5">
                      <button
                        type="button"
                        onClick={() => void updateQty(it.key, it.qty - 1)}
                        aria-label="Меньше"
                        className="grid h-8 w-8 place-items-center rounded-full text-muted transition-colors hover:bg-white/5 hover:text-ink cursor-pointer"
                      >
                        <Minus size={14} />
                      </button>
                      <span className="w-7 text-center text-sm tabular-nums">
                        {it.qty}
                      </span>
                      <button
                        type="button"
                        onClick={() => void updateQty(it.key, it.qty + 1)}
                        aria-label="Больше"
                        disabled={it.qty >= (it.maxQuantity ?? 0)}
                        title={
                          it.qty >= (it.maxQuantity ?? 0)
                            ? `На складе только ${it.maxQuantity} шт.`
                            : undefined
                        }
                        className={cn(
                          "grid h-8 w-8 place-items-center rounded-full transition-colors",
                          it.qty >= (it.maxQuantity ?? 0)
                            ? "cursor-not-allowed text-faint opacity-40"
                            : "text-muted hover:bg-white/5 hover:text-ink cursor-pointer",
                        )}
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                    {it.qty >= (it.maxQuantity ?? 0) && (it.maxQuantity ?? 0) > 0 && (
                      <p className="pl-1 text-[11px] text-faint">
                        Максимум {it.maxQuantity} шт.
                      </p>
                    )}
                  </div>
                  <span className="font-display font-semibold">
                    {formatPrice(it.product.price * it.qty)}
                  </span>
                </div>
              </div>
              <button
                onClick={() => void removeItem(it.key)}
                aria-label="Удалить"
                className="self-start text-faint transition-colors hover:text-magenta cursor-pointer"
              >
                <Trash2 size={17} />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>

        <Link
          href="/catalog"
          className="inline-flex items-center gap-1.5 pt-2 text-sm text-muted transition-colors hover:text-ink"
        >
          <ArrowLeft size={15} />
          Продолжить покупки
        </Link>
      </div>

      {/* Итог + оформление */}
      <div className="lg:sticky lg:top-24 lg:self-start">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (submitting) return;
            setFormError(null);
            const phoneCheck = validateRussianMobile(phoneNational);
            if (!phoneCheck.ok) {
              setForcePhoneError(true);
              return;
            }
            setForcePhoneError(false);
            if (!firstName.trim()) {
              setFormError("Укажите имя");
              return;
            }
            setConfirmOpen(true);
          }}
          className="glass space-y-5 rounded-3xl p-6"
        >
          <h2 className="font-display text-lg font-semibold">Оформление</h2>

          <DeliverySelect value={delivery} onChange={setDelivery} />

          {/* Оплата */}
          <div className="space-y-2">
            <label className="text-xs font-medium uppercase tracking-wider text-faint">
              Оплата
            </label>
            <div className="space-y-1.5">
              {PAYMENT.map((p) => (
                <button
                  type="button"
                  key={p.id}
                  onClick={() => setPayment(p.id)}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-xl border px-3.5 py-2.5 text-sm transition-colors cursor-pointer",
                    payment === p.id
                      ? "border-cyan/60 bg-cyan/5"
                      : "border-line hover:border-white/20",
                  )}
                >
                  <span
                    className={cn(
                      "grid h-4 w-4 place-items-center rounded-full border",
                      payment === p.id ? "border-cyan" : "border-faint",
                    )}
                  >
                    {payment === p.id && (
                      <span className="h-2 w-2 rounded-full bg-cyan" />
                    )}
                  </span>
                  <span className="flex-1 text-left">{p.label}</span>
                  {p.note && <span className="text-xs text-faint">{p.note}</span>}
                </button>
              ))}
            </div>
          </div>

          <Field
            label="Имя"
            required
            placeholder="Иван"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
          />
          <PhoneNationalField
            value={phoneNational}
            onChange={(next) => {
              setPhoneNational(next);
              setForcePhoneError(false);
              setFormError(null);
            }}
            disabled={submitting}
            forceError={forcePhoneError}
          />

          {formError && (
            <p
              role="alert"
              className="rounded-xl border border-magenta/30 bg-magenta/10 px-3 py-2 text-sm text-ink"
            >
              {formError}
            </p>
          )}

          {/* Суммы */}
          <div className="space-y-2 border-t border-line pt-4 text-sm">
            <Row label={`Товары (${count})`} value={formatPrice(subtotal)} />
            {surcharge > 0 && (
              <Row
                label="Комиссия оплаты"
                value={`+ ${formatPrice(Math.round(subtotal * surcharge))}`}
              />
            )}
            <Row
              label="Доставка"
              value={deliveryPrice ? formatPrice(deliveryPrice) : "бесплатно"}
            />
            <div className="flex items-center justify-between border-t border-line pt-3">
              <span className="text-muted">Итого</span>
              <span className="font-display text-2xl font-bold text-iri">
                {formatPrice(total)}
              </span>
            </div>
          </div>

          <button
            type="submit"
            className="btn-primary w-full"
            disabled={
              submitting ||
              (digitsOnly(phoneNational).length > 0 &&
                !isValidRussianMobile(phoneNational))
            }
          >
            {submitting ? "Оформляем…" : "Оформить заказ"}
          </button>
          <p className="text-center text-xs text-faint">
            Нажимая кнопку, вы соглашаетесь с условиями обработки данных
          </p>
        </form>
      </div>
    </div>
    </>
  );
}

function DeliverySelect({
  value,
  onChange,
}: {
  value: DeliveryId;
  onChange: (id: DeliveryId) => void;
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const listId = useId();
  const selected = DELIVERY.find((d) => d.id === value) ?? DELIVERY[0];
  const SelectedIcon = selected.Icon;

  useEffect(() => {
    if (!open) return;

    function onPointerDown(e: MouseEvent) {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    }
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div className="space-y-1.5" ref={rootRef}>
      <label
        id={`${listId}-label`}
        className="text-xs font-medium uppercase tracking-wider text-faint"
      >
        Способ доставки
      </label>

      <div className="relative">
        <button
          type="button"
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-labelledby={`${listId}-label`}
          aria-controls={listId}
          onClick={() => setOpen((v) => !v)}
          className={cn(
            "flex w-full items-center gap-3 rounded-xl border bg-bg-2/60 px-3.5 py-3 text-left text-[15px] outline-none transition-colors cursor-pointer",
            open
              ? "border-cyan/70 ring-2 ring-cyan/20"
              : "border-line hover:border-white/20 focus:border-cyan/70 focus:ring-2 focus:ring-cyan/20",
          )}
        >
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-line bg-white/[0.03] text-cyan">
            <SelectedIcon size={17} strokeWidth={2} />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate font-medium text-ink">
              {selected.label}
            </span>
            <span className="block truncate text-xs text-faint">
              {selected.detail}
            </span>
          </span>
          <span
            className={cn(
              "shrink-0 text-sm tabular-nums",
              selected.price === 0 ? "text-cyan" : "text-muted",
            )}
          >
            {selected.price === 0 ? "бесплатно" : formatPrice(selected.price)}
          </span>
          <ChevronDown
            size={16}
            className={cn(
              "shrink-0 text-faint transition-transform duration-200",
              open && "rotate-180 text-cyan",
            )}
          />
        </button>

        <AnimatePresence>
          {open && (
            <motion.ul
              id={listId}
              role="listbox"
              aria-labelledby={`${listId}-label`}
              initial={{ opacity: 0, y: -6, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -4, scale: 0.98 }}
              transition={{ duration: 0.16, ease: "easeOut" }}
              className="absolute left-0 right-0 z-30 mt-2 overflow-hidden rounded-2xl border border-line bg-panel/95 p-1.5 shadow-[0_18px_50px_-20px_rgba(0,0,0,0.75)] backdrop-blur-xl"
            >
              {DELIVERY.map((option) => {
                const active = option.id === value;
                const OptionIcon = option.Icon;
                return (
                  <li key={option.id} role="option" aria-selected={active}>
                    <button
                      type="button"
                      onClick={() => {
                        onChange(option.id);
                        setOpen(false);
                      }}
                      className={cn(
                        "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors cursor-pointer",
                        active
                          ? "bg-cyan/10 text-ink"
                          : "text-ink hover:bg-white/[0.04]",
                      )}
                    >
                      <span
                        className={cn(
                          "grid h-8 w-8 shrink-0 place-items-center rounded-lg border",
                          active
                            ? "border-cyan/40 bg-cyan/10 text-cyan"
                            : "border-line bg-white/[0.02] text-muted",
                        )}
                      >
                        <OptionIcon size={15} strokeWidth={2} />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-medium">
                          {option.label}
                        </span>
                        <span className="block truncate text-xs text-faint">
                          {option.detail}
                        </span>
                      </span>
                      <span
                        className={cn(
                          "shrink-0 text-xs tabular-nums",
                          option.price === 0 ? "text-cyan" : "text-faint",
                        )}
                      >
                        {option.price === 0
                          ? "бесплатно"
                          : formatPrice(option.price)}
                      </span>
                      {active && (
                        <Check size={15} className="shrink-0 text-cyan" />
                      )}
                    </button>
                  </li>
                );
              })}
            </motion.ul>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-muted">{label}</span>
      <span className="text-ink">{value}</span>
    </div>
  );
}
