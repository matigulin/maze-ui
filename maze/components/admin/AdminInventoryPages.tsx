"use client";

import { ChevronDown, ChevronUp } from "lucide-react";
import { useEffect, useState } from "react";
import { Field } from "@/components/Field";
import { useAdminApi } from "@/lib/admin/client";
import type { AdminProductSummary } from "@/lib/admin/types";
import {
  AdminAlert,
  AdminButton,
  AdminCard,
  AdminCardList,
  AdminCardRow,
  AdminCheckbox,
  AdminPageHeader,
  AdminTable,
  AdminTd,
  AdminTh,
  errorMessage,
} from "@/lib/admin/ui";

function StockQtyInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (n: number) => void;
}) {
  function bump(delta: number) {
    onChange(Math.max(0, value + delta));
  }

  return (
    <div className="inline-flex h-8 overflow-hidden rounded-lg border border-line bg-bg-2 focus-within:border-cyan/50">
      <input
        aria-label={label}
        type="number"
        min={0}
        inputMode="numeric"
        className="h-full w-10 appearance-none bg-transparent pl-2.5 text-center text-sm text-ink outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
        value={value}
        onChange={(e) => onChange(Math.max(0, Number(e.target.value) || 0))}
      />
      <div className="flex w-6 shrink-0 flex-col border-l border-line/70">
        <button
          type="button"
          aria-label="Больше"
          className="grid flex-1 place-items-center text-ink/70 transition hover:bg-white/[0.08] hover:text-ink active:bg-white/[0.12]"
          onClick={() => bump(1)}
        >
          <ChevronUp size={12} strokeWidth={2.5} />
        </button>
        <button
          type="button"
          aria-label="Меньше"
          className="grid flex-1 place-items-center text-ink/70 transition hover:bg-white/[0.08] hover:text-ink active:bg-white/[0.12]"
          onClick={() => bump(-1)}
        >
          <ChevronDown size={12} strokeWidth={2.5} />
        </button>
      </div>
    </div>
  );
}

export function StockPage() {
  const api = useAdminApi();
  const [items, setItems] = useState<AdminProductSummary[]>([]);
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  async function load(query = search) {
    setLoading(true);
    setError("");
    try {
      const { items: list } = await api.listProducts({
        limit: 48,
        search: query.trim() || undefined,
      });
      const details = await Promise.all(list.map((p) => api.getProduct(p.id)));
      const nextQty: Record<string, number> = {};
      for (const product of details) {
        nextQty[product.id] = product.variants[0]?.quantity ?? 0;
      }
      setItems(list);
      setQuantities((prev) => {
        const merged = { ...nextQty };
        for (const [id, qty] of Object.entries(prev)) {
          if (id in merged) merged[id] = qty;
        }
        return merged;
      });
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load("");
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  async function save(id: string) {
    setSaving(id);
    setError("");
    try {
      const quantity = quantities[id] ?? 0;
      await api.updateProductStock(id, quantity);
      setItems((prev) => prev.map((p) => (p.id === id ? { ...p, inStock: quantity > 0 } : p)));
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setSaving(null);
    }
  }

  return (
    <div>
      <AdminPageHeader
        title="Склад"
        description="Сохранение назначает одинаковый остаток всем вариантам товара."
      />
      {error && <AdminAlert>{error}</AdminAlert>}
      <form
        className="mb-4 flex items-end gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          void load();
        }}
      >
        <div className="min-w-0 flex-1">
          <Field
            label="Поиск"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Название товара"
          />
        </div>
        <AdminButton
          type="submit"
          className="shrink-0 px-3 py-3 text-sm"
          disabled={loading}
        >
          {loading ? "…" : "Найти"}
        </AdminButton>
      </form>

      {!loading && items.length === 0 ? (
        <p className="rounded-2xl border border-line bg-panel/50 p-8 text-sm text-muted">
          Ничего не найдено.
        </p>
      ) : (
        <>
          <AdminCardList>
            {items.map((p) => (
              <AdminCard key={p.id}>
                <p className="font-medium text-ink">{p.name}</p>
                <p className="mt-1 text-xs text-muted">{p.slug}</p>
                <div className="mt-3 space-y-2">
                  <AdminCardRow label="Статус">
                    {p.inStock ? "В наличии" : "Нет в наличии"}
                  </AdminCardRow>
                  <AdminCardRow label="Количество">
                    <StockQtyInput
                      label={`Остаток ${p.name}`}
                      value={quantities[p.id] ?? 0}
                      onChange={(n) =>
                        setQuantities({ ...quantities, [p.id]: n })
                      }
                    />
                  </AdminCardRow>
                </div>
                <div className="mt-3 flex justify-end border-t border-line/60 pt-3">
                  <AdminButton
                    className="rounded-lg px-2.5 py-1.5 text-xs"
                    disabled={saving === p.id}
                    onClick={() => void save(p.id)}
                  >
                    {saving === p.id ? "…" : "Сохранить"}
                  </AdminButton>
                </div>
              </AdminCard>
            ))}
          </AdminCardList>

          <AdminTable desktopOnly>
            <thead>
              <tr>
                <AdminTh>Товар</AdminTh>
                <AdminTh>Статус</AdminTh>
                <AdminTh>Количество на все варианты</AdminTh>
                <AdminTh />
              </tr>
            </thead>
            <tbody>
              {items.map((p) => (
                <tr key={p.id}>
                  <AdminTd>
                    <p>{p.name}</p>
                    <p className="text-xs text-muted">{p.slug}</p>
                  </AdminTd>
                  <AdminTd>{p.inStock ? "В наличии" : "Нет в наличии"}</AdminTd>
                  <AdminTd>
                    <StockQtyInput
                      label={`Остаток ${p.name}`}
                      value={quantities[p.id] ?? 0}
                      onChange={(n) =>
                        setQuantities({ ...quantities, [p.id]: n })
                      }
                    />
                  </AdminTd>
                  <AdminTd>
                    <AdminButton
                      disabled={saving === p.id}
                      onClick={() => void save(p.id)}
                    >
                      {saving === p.id ? "…" : "Сохранить"}
                    </AdminButton>
                  </AdminTd>
                </tr>
              ))}
            </tbody>
          </AdminTable>
        </>
      )}
    </div>
  );
}

export function EditorChoicePage() {
  const api = useAdminApi(); const [items, setItems] = useState<AdminProductSummary[]>([]); const [selected, setSelected] = useState<string[]>([]); const [error, setError] = useState(""); const [success, setSuccess] = useState("");
  useEffect(() => { void Promise.all([api.listProducts({ limit: 48 }), api.getHomeEditorChoice()]).then(([products, choice]) => { setItems(products.items); setSelected(choice.map((p) => p.id)); }).catch((e) => setError(errorMessage(e))); }, []); // eslint-disable-line react-hooks/exhaustive-deps
  function toggle(id: string, checked: boolean) { setSelected((old) => checked ? [...old, id] : old.filter((x) => x !== id)); }
  async function save() { if (selected.length < 8 || selected.length > 12) { setError("Выберите от 8 до 12 товаров."); return; } setError(""); try { await api.setEditorChoice(selected); setSuccess("Выбор редакции сохранён."); } catch (e) { setError(errorMessage(e)); } }
  return <div className="max-w-4xl"><AdminPageHeader title="Выбор редакции" description={`Выбрано: ${selected.length}. Для главной нужно от 8 до 12 товаров.`} />{error && <AdminAlert>{error}</AdminAlert>}{success && <AdminAlert tone="ok">{success}</AdminAlert>}<div className="grid gap-2 rounded-2xl border border-line bg-panel/50 p-4 sm:grid-cols-2">{items.map((p) => <AdminCheckbox key={p.id} label={p.name} checked={selected.includes(p.id)} onChange={(v) => toggle(p.id, v)} />)}</div><AdminButton className="mt-4" onClick={() => void save()}>Сохранить выбор</AdminButton></div>;
}
