"use client";

import { useEffect, useState } from "react";
import { Field } from "@/components/Field";
import { useAdminApi } from "@/lib/admin/client";
import type { AdminProductSummary } from "@/lib/admin/types";
import { AdminAlert, AdminButton, AdminCheckbox, AdminPageHeader, AdminTable, AdminTd, AdminTh, errorMessage } from "@/lib/admin/ui";

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
      <AdminPageHeader title="Склад" description="Сохранение назначает одинаковый остаток всем вариантам товара." />
      {error && <AdminAlert>{error}</AdminAlert>}
      <form
        className="mb-4 flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          void load();
        }}
      >
        <Field
          label="Поиск"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Название товара"
        />
        <AdminButton type="submit" className="self-end py-3 text-[15px]" disabled={loading}>
          {loading ? "…" : "Найти"}
        </AdminButton>
      </form>
      <AdminTable>
        <thead>
          <tr>
            <AdminTh>Товар</AdminTh>
            <AdminTh>Статус</AdminTh>
            <AdminTh>Количество на все варианты</AdminTh>
            <AdminTh />
          </tr>
        </thead>
        <tbody>
          {items.length === 0 && !loading ? (
            <tr>
              <td colSpan={4} className="border-b border-line/70 px-4 py-6 text-sm text-muted">
                Ничего не найдено.
              </td>
            </tr>
          ) : (
            items.map((p) => (
              <tr key={p.id}>
                <AdminTd>
                  <p>{p.name}</p>
                  <p className="text-xs text-muted">{p.slug}</p>
                </AdminTd>
                <AdminTd>{p.inStock ? "В наличии" : "Нет в наличии"}</AdminTd>
                <AdminTd>
                  <input
                    aria-label={`Остаток ${p.name}`}
                    type="number"
                    min="0"
                    className="w-28 rounded-xl border border-line bg-bg-2 px-3 py-2 text-ink"
                    value={quantities[p.id] ?? 0}
                    onChange={(e) => setQuantities({ ...quantities, [p.id]: Number(e.target.value) })}
                  />
                </AdminTd>
                <AdminTd>
                  <AdminButton disabled={saving === p.id} onClick={() => void save(p.id)}>
                    {saving === p.id ? "…" : "Сохранить"}
                  </AdminButton>
                </AdminTd>
              </tr>
            ))
          )}
        </tbody>
      </AdminTable>
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
