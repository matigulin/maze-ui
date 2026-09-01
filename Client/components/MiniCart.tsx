"use client";

import Link from "next/link";
import { Minus, Plus, ShoppingBag, Trash2, X } from "lucide-react";
import { useCart } from "./store";
import { ProductThumb } from "./ProductThumb";
import { formatPrice, plural, cn } from "@/lib/utils";
import { formatStockLabel } from "@/lib/stock";
import { MobileDrawer } from "@/shared/ui/mobile-drawer";

export function MiniCart() {
  const { miniOpen, setMiniOpen, items, subtotal, count, updateQty, removeItem } =
    useCart();

  return (
    <MobileDrawer
      open={miniOpen}
      onClose={() => setMiniOpen(false)}
      panelClassName="w-full max-w-md"
    >
      <header className="flex shrink-0 items-center justify-between border-b border-line px-5 py-4">
        <div className="flex items-center gap-2">
          <ShoppingBag size={18} className="text-cyan" />
          <h2 className="font-display text-base font-semibold tracking-wide">
            Корзина
          </h2>
          {count > 0 && (
            <span className="text-sm text-muted">
              {count} {plural(count, ["товар", "товара", "товаров"])}
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={() => setMiniOpen(false)}
          aria-label="Закрыть корзину"
          className="grid h-9 w-9 place-items-center rounded-full text-muted transition-colors hover:bg-white/10 hover:text-ink cursor-pointer"
        >
          <X size={18} />
        </button>
      </header>

      {items.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-4 p-8 text-center">
          <div className="grid h-16 w-16 place-items-center rounded-2xl bg-white/5 text-muted">
            <ShoppingBag size={26} />
          </div>
          <p className="text-muted">Корзина пуста</p>
          <Link
            href="/catalog"
            onClick={() => setMiniOpen(false)}
            className="btn-primary"
          >
            Перейти в каталог
          </Link>
        </div>
      ) : (
        <>
          <div className="flex-1 space-y-3 overflow-y-auto p-4">
            {items.map((it) => (
              <div
                key={it.key}
                className="flex gap-3 rounded-2xl border border-line bg-white/[0.02] p-3"
              >
                <ProductThumb
                  product={it.product}
                  className="h-20 w-20 shrink-0"
                  glyphClassName="text-[0.7rem]"
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">
                    {it.product.name}
                  </p>
                  <p className="text-xs text-faint">
                    {[it.color, it.memory].filter(Boolean).join(" · ")}
                  </p>
                  <p className="mt-1 text-[11px] text-cyan">
                    {formatStockLabel(it.quantityAvailable ?? it.maxQuantity)}
                  </p>
                  <div className="mt-2 flex items-center justify-between">
                    <div className="flex items-center gap-1 rounded-full border border-line">
                      <button
                        type="button"
                        aria-label="Меньше"
                        onClick={() => void updateQty(it.key, it.qty - 1)}
                        className="grid h-7 w-7 place-items-center rounded-full text-muted hover:text-ink cursor-pointer"
                      >
                        <Minus size={13} />
                      </button>
                      <span className="w-5 text-center text-sm tabular-nums">
                        {it.qty}
                      </span>
                      <button
                        type="button"
                        aria-label="Больше"
                        onClick={() => void updateQty(it.key, it.qty + 1)}
                        disabled={it.qty >= (it.maxQuantity ?? 0)}
                        title={
                          it.qty >= (it.maxQuantity ?? 0)
                            ? `На складе только ${it.maxQuantity} шт.`
                            : undefined
                        }
                        className={cn(
                          "grid h-7 w-7 place-items-center rounded-full",
                          it.qty >= (it.maxQuantity ?? 0)
                            ? "cursor-not-allowed text-faint opacity-40"
                            : "text-muted hover:text-ink cursor-pointer",
                        )}
                      >
                        <Plus size={13} />
                      </button>
                    </div>
                    <span className="text-sm font-semibold">
                      {formatPrice(it.product.price * it.qty)}
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  aria-label="Удалить"
                  onClick={() => void removeItem(it.key)}
                  className="self-start text-faint transition-colors hover:text-magenta cursor-pointer"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>

          <footer className="shrink-0 space-y-3 border-t border-line p-5">
            <div className="flex items-center justify-between">
              <span className="text-muted">Итого</span>
              <span className="font-display text-xl font-bold text-iri">
                {formatPrice(subtotal)}
              </span>
            </div>
            <Link
              href="/cart"
              onClick={() => setMiniOpen(false)}
              className="btn-primary w-full"
            >
              Оформить заказ
            </Link>
          </footer>
        </>
      )}
    </MobileDrawer>
  );
}
