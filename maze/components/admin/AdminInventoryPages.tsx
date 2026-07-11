"use client";

import { useEffect, useState } from "react";
import { useAdminApi } from "@/lib/admin/client";
import type { AdminProductSummary } from "@/lib/admin/types";
import { AdminAlert, AdminButton, AdminCheckbox, AdminPageHeader, AdminTable, AdminTd, AdminTh, errorMessage } from "@/lib/admin/ui";

export function StockPage() {
  const api = useAdminApi(); const [items, setItems] = useState<AdminProductSummary[]>([]); const [quantities, setQuantities] = useState<Record<string, number>>({}); const [error, setError] = useState(""); const [saving, setSaving] = useState<string | null>(null);
  useEffect(() => { void api.listProducts({ limit: 100 }).then(({ items }) => setItems(items)).catch((e) => setError(errorMessage(e))); }, []); // eslint-disable-line react-hooks/exhaustive-deps
  async function save(id: string) { setSaving(id); try { await api.updateProductStock(id, quantities[id] ?? 0); } catch (e) { setError(errorMessage(e)); } finally { setSaving(null); } }
  return <div><AdminPageHeader title="Склад" description="Сохранение назначает одинаковый остаток всем вариантам товара." />{error && <AdminAlert>{error}</AdminAlert>}<AdminTable><thead><tr><AdminTh>Товар</AdminTh><AdminTh>Статус</AdminTh><AdminTh>Количество на все варианты</AdminTh><AdminTh /></tr></thead><tbody>{items.map((p) => <tr key={p.id}><AdminTd><p>{p.name}</p><p className="text-xs text-muted">{p.slug}</p></AdminTd><AdminTd>{p.inStock ? "В наличии" : "Нет в наличии"}</AdminTd><AdminTd><input aria-label={`Остаток ${p.name}`} type="number" min="0" className="w-28 rounded-xl border border-line bg-bg-2 px-3 py-2 text-ink" value={quantities[p.id] ?? 0} onChange={(e) => setQuantities({ ...quantities, [p.id]: Number(e.target.value) })} /></AdminTd><AdminTd><AdminButton disabled={saving === p.id} onClick={() => void save(p.id)}>{saving === p.id ? "…" : "Сохранить"}</AdminButton></AdminTd></tr>)}</tbody></AdminTable></div>;
}

export function EditorChoicePage() {
  const api = useAdminApi(); const [items, setItems] = useState<AdminProductSummary[]>([]); const [selected, setSelected] = useState<string[]>([]); const [error, setError] = useState(""); const [success, setSuccess] = useState("");
  useEffect(() => { void Promise.all([api.listProducts({ limit: 100 }), api.getHomeEditorChoice()]).then(([products, choice]) => { setItems(products.items); setSelected(choice.map((p) => p.id)); }).catch((e) => setError(errorMessage(e))); }, []); // eslint-disable-line react-hooks/exhaustive-deps
  function toggle(id: string, checked: boolean) { setSelected((old) => checked ? [...old, id] : old.filter((x) => x !== id)); }
  async function save() { if (selected.length < 8 || selected.length > 12) { setError("Выберите от 8 до 12 товаров."); return; } setError(""); try { await api.setEditorChoice(selected); setSuccess("Выбор редакции сохранён."); } catch (e) { setError(errorMessage(e)); } }
  return <div className="max-w-4xl"><AdminPageHeader title="Выбор редакции" description={`Выбрано: ${selected.length}. Для главной нужно от 8 до 12 товаров.`} />{error && <AdminAlert>{error}</AdminAlert>}{success && <AdminAlert tone="ok">{success}</AdminAlert>}<div className="grid gap-2 rounded-2xl border border-line bg-panel/50 p-4 sm:grid-cols-2">{items.map((p) => <AdminCheckbox key={p.id} label={p.name} checked={selected.includes(p.id)} onChange={(v) => toggle(p.id, v)} />)}</div><AdminButton className="mt-4" onClick={() => void save()}>Сохранить выбор</AdminButton></div>;
}
