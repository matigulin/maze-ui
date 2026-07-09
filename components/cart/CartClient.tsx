"use client";

import Link from "next/link";
import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Minus, Plus, Trash2, ShoppingBag, Check, ArrowLeft } from "lucide-react";
import { useCart } from "@/components/store";
import { ProductThumb } from "@/components/ProductThumb";
import { Field, fieldCls } from "@/components/Field";
import { formatPrice, plural, cn } from "@/lib/utils";

const DELIVERY = [
  { id: "pickup", label: "Самовывоз (Чайковского, 56)", price: 0 },
  { id: "courier", label: "Курьер по СПб", price: 500 },
  { id: "yandex", label: "Яндекс Доставка (СПб)", price: 400 },
  { id: "cdek", label: "СДЭК по РФ", price: 450 },
];

const PAYMENT = [
  { id: "cash", label: "Наличные", surcharge: 0, note: "" },
  { id: "card", label: "Карта / QR-код", surcharge: 0.07, note: "+7%" },
  { id: "credit", label: "Рассрочка 0%", surcharge: 0, note: "6 мес." },
];

export function CartClient() {
  const { items, subtotal, count, updateQty, removeItem, clearCart } = useCart();
  const [delivery, setDelivery] = useState(DELIVERY[0].id);
  const [payment, setPayment] = useState(PAYMENT[0].id);
  const [done, setDone] = useState(false);

  const deliveryPrice = DELIVERY.find((d) => d.id === delivery)?.price ?? 0;
  const surcharge = PAYMENT.find((p) => p.id === payment)?.surcharge ?? 0;
  const total = Math.round(subtotal * (1 + surcharge)) + deliveryPrice;

  if (done) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass mx-auto max-w-lg rounded-3xl p-10 text-center"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 260, damping: 18, delay: 0.1 }}
          className="mx-auto mb-6 grid h-20 w-20 place-items-center rounded-full bg-cyan/15 text-cyan glow-cyan"
        >
          <Check size={40} strokeWidth={2.5} />
        </motion.div>
        <h2 className="font-display text-2xl font-bold">Заказ оформлен!</h2>
        <p className="mt-2 text-muted">
          Заказ <span className="text-cyan">#MAZE-{Math.floor(1000 + Math.random() * 9000)}</span>{" "}
          принят. Менеджер свяжется с вами в ближайшее время.
        </p>
        <Link href="/catalog" className="btn-primary mt-8 inline-flex">
          Продолжить покупки
        </Link>
      </motion.div>
    );
  }

  if (items.length === 0) {
    return (
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
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_22rem]">
      {/* Список товаров */}
      <div className="space-y-3">
        <div className="mb-1 flex items-center justify-between">
          <span className="text-sm text-muted">
            {count} {plural(count, ["товар", "товара", "товаров"])}
          </span>
          <button
            onClick={clearCart}
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
              className="glass flex gap-4 rounded-2xl p-4"
            >
              <Link href={`/product/${it.product.slug}`} className="shrink-0">
                <ProductThumb
                  product={it.product}
                  className="h-24 w-24"
                  glyphClassName="text-[0.7rem]"
                />
              </Link>
              <div className="flex min-w-0 flex-1 flex-col">
                <Link
                  href={`/product/${it.product.slug}`}
                  className="font-medium leading-snug transition-colors hover:text-cyan"
                >
                  {it.product.name}
                </Link>
                <p className="text-xs text-faint">
                  {[it.color, it.memory].filter(Boolean).join(" · ")}
                </p>
                <div className="mt-auto flex items-center justify-between pt-2">
                  <div className="flex items-center gap-1 rounded-full border border-line p-0.5">
                    <button
                      onClick={() => updateQty(it.key, it.qty - 1)}
                      aria-label="Меньше"
                      className="grid h-8 w-8 place-items-center rounded-full text-muted transition-colors hover:bg-white/5 hover:text-ink cursor-pointer"
                    >
                      <Minus size={14} />
                    </button>
                    <span className="w-7 text-center text-sm tabular-nums">
                      {it.qty}
                    </span>
                    <button
                      onClick={() => updateQty(it.key, it.qty + 1)}
                      aria-label="Больше"
                      className="grid h-8 w-8 place-items-center rounded-full text-muted transition-colors hover:bg-white/5 hover:text-ink cursor-pointer"
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                  <span className="font-display font-semibold">
                    {formatPrice(it.product.price * it.qty)}
                  </span>
                </div>
              </div>
              <button
                onClick={() => removeItem(it.key)}
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
            setDone(true);
            setTimeout(clearCart, 300);
          }}
          className="glass space-y-5 rounded-3xl p-6"
        >
          <h2 className="font-display text-lg font-semibold">Оформление</h2>

          {/* Доставка */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium uppercase tracking-wider text-faint">
              Способ доставки
            </label>
            <select
              value={delivery}
              onChange={(e) => setDelivery(e.target.value)}
              className={`${fieldCls} cursor-pointer appearance-none`}
            >
              {DELIVERY.map((d) => (
                <option key={d.id} value={d.id} className="bg-panel">
                  {d.label}
                  {d.price ? ` · ${formatPrice(d.price)}` : " · бесплатно"}
                </option>
              ))}
            </select>
          </div>

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

          <Field label="Имя" required placeholder="Иван" />
          <Field label="Телефон" type="tel" required placeholder="+7 (999) 123-45-67" />

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

          <button type="submit" className="btn-primary w-full">
            Оформить заказ
          </button>
          <p className="text-center text-xs text-faint">
            Нажимая кнопку, вы соглашаетесь с условиями обработки данных
          </p>
        </form>
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
