"use client";

import { ChevronDown, ChevronUp } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Field } from "@/components/Field";
import { useAdminApi } from "@/lib/admin/client";
import type { AdminProductSummary } from "@/lib/admin/types";
import { useAdminPagedList } from "@/lib/admin/use-paged-list";
import {
  AdminActionsTd,
  AdminActionsTh,
  AdminAlert,
  AdminButton,
  AdminCardList,
  AdminCheckbox,
  AdminDesktopPager,
  AdminEmptyState,
  AdminFilterPanel,
  AdminInfiniteFooter,
  AdminListCard,
  AdminPageHeader,
  AdminResultCount,
  AdminSelect,
  AdminTable,
  AdminTd,
  AdminTh,
  adminCardActionCls,
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
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const emptyFilters = { name: "", slug: "", inStock: "" };
  const [draft, setDraft] = useState(emptyFilters);
  const [applied, setApplied] = useState(emptyFilters);
  const [saving, setSaving] = useState<string | null>(null);
  const resetKey = JSON.stringify(applied);
  const activeCount = [applied.slug, applied.inStock].filter(Boolean).length;

  const fetchPage = useCallback(
    async (page: number, limit: number) => {
      const { items: list, meta } = await api.listProducts({
        page,
        limit,
        name: applied.name.trim() || undefined,
        slug: applied.slug.trim() || undefined,
        inStock: applied.inStock || undefined,
      });
      setQuantities((prev) => {
        const next = { ...prev };
        for (const product of list) {
          if (!(product.id in next)) {
            next[product.id] = product.stockQuantity ?? 0;
          }
        }
        return next;
      });
      return {
        items: list,
        total: meta?.total ?? list.length,
        limit: meta?.limit ?? limit,
      };
    },
    [api, applied],
  );

  const list = useAdminPagedList({
    limit: 20,
    resetKey,
    fetchPage,
  });

  function applyFilters() {
    setApplied({
      name: draft.name.trim(),
      slug: draft.slug.trim(),
      inStock: draft.inStock,
    });
  }

  function resetFilters() {
    setDraft(emptyFilters);
    setApplied(emptyFilters);
  }

  async function save(id: string) {
    setSaving(id);
    list.setError("");
    try {
      const quantity = quantities[id] ?? 0;
      await api.updateProductStock(id, quantity);
      list.setItems((prev) =>
        prev.map((p) => (p.id === id ? { ...p, inStock: quantity > 0 } : p)),
      );
    } catch (e) {
      list.setError(errorMessage(e));
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
      {list.error && <AdminAlert>{list.error}</AdminAlert>}

      <AdminFilterPanel
        activeCount={activeCount}
        onApply={applyFilters}
        onReset={resetFilters}
        leading={
          <Field
            label="Название"
            value={draft.name}
            onChange={(e) => setDraft({ ...draft, name: e.target.value })}
            placeholder="Поиск по названию"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                applyFilters();
              }
            }}
          />
        }
      >
        <Field
          label="Slug"
          value={draft.slug}
          onChange={(e) => setDraft({ ...draft, slug: e.target.value })}
          placeholder="iphone-15"
        />
        <AdminSelect
          label="Наличие"
          value={draft.inStock}
          onChange={(v) => setDraft({ ...draft, inStock: v })}
          options={[
            { value: "", label: "Все" },
            { value: "true", label: "В наличии" },
            { value: "false", label: "Нет в наличии" },
          ]}
        />
      </AdminFilterPanel>

      <AdminResultCount total={list.total} loading={list.loading} />

      <AdminCardList>
        {list.items.map((p) => (
          <AdminListCard
            key={p.id}
            title={p.name}
            subtitle={p.slug}
            actions={
              <AdminButton
                className={adminCardActionCls}
                disabled={saving === p.id}
                onClick={() => void save(p.id)}
              >
                {saving === p.id ? "…" : "Сохранить"}
              </AdminButton>
            }
            fieldsClassName="!grid-cols-none !flex !items-center justify-between gap-3"
          >
            <div className="flex min-w-0 items-center gap-2 text-sm">
              <span className="shrink-0 text-[11px] text-faint">Статус</span>
              <span className="truncate text-ink">
                {p.inStock ? "В наличии" : "Нет в наличии"}
              </span>
            </div>
            <div className="flex shrink-0 items-center gap-2 text-sm">
              <span className="text-[11px] text-faint">Количество</span>
              <StockQtyInput
                label={`Остаток ${p.name}`}
                value={quantities[p.id] ?? 0}
                onChange={(n) => setQuantities({ ...quantities, [p.id]: n })}
              />
            </div>
          </AdminListCard>
        ))}
        {!list.loading && list.items.length === 0 && (
          <AdminEmptyState>Ничего не найдено.</AdminEmptyState>
        )}
        <AdminInfiniteFooter
          sentinelRef={list.sentinelRef}
          hasMore={list.page < list.pages}
          loading={list.loading}
          onLoadMore={() => void list.loadMore()}
        />
      </AdminCardList>

      <AdminTable desktopOnly>
        <thead>
          <tr>
            <AdminTh>Товар</AdminTh>
            <AdminTh>Статус</AdminTh>
            <AdminTh>Количество на все варианты</AdminTh>
            <AdminActionsTh>Действие</AdminActionsTh>
          </tr>
        </thead>
        <tbody>
          {list.items.map((p) => (
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
                  onChange={(n) => setQuantities({ ...quantities, [p.id]: n })}
                />
              </AdminTd>
              <AdminActionsTd>
                <AdminButton
                  disabled={saving === p.id}
                  onClick={() => void save(p.id)}
                >
                  {saving === p.id ? "…" : "Сохранить"}
                </AdminButton>
              </AdminActionsTd>
            </tr>
          ))}
        </tbody>
      </AdminTable>

      <AdminDesktopPager
        page={list.page}
        pages={list.pages}
        loading={list.loading}
        onPrev={() => void list.goToPage(list.page - 1)}
        onNext={() => void list.goToPage(list.page + 1)}
      />
    </div>
  );
}

export function EditorChoicePage() {
  const api = useAdminApi();
  const [items, setItems] = useState<AdminProductSummary[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    void Promise.all([api.listProducts({ limit: 48 }), api.getHomeEditorChoice()])
      .then(([products, choice]) => {
        setItems(products.items);
        setSelected(choice.map((p) => p.id));
      })
      .catch((e) => setError(errorMessage(e)));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  function toggle(id: string, checked: boolean) {
    setSelected((old) => (checked ? [...old, id] : old.filter((x) => x !== id)));
  }

  async function save() {
    if (selected.length < 8 || selected.length > 12) {
      setError("Выберите от 8 до 12 товаров.");
      return;
    }
    setError("");
    try {
      await api.setEditorChoice(selected);
      setSuccess("Выбор редакции сохранён.");
    } catch (e) {
      setError(errorMessage(e));
    }
  }

  return (
    <div className="max-w-4xl">
      <AdminPageHeader
        title="Выбор редакции"
        description={`Выбрано: ${selected.length}. Для главной нужно от 8 до 12 товаров.`}
      />
      {error && <AdminAlert>{error}</AdminAlert>}
      {success && <AdminAlert tone="ok">{success}</AdminAlert>}
      <div className="grid gap-2 rounded-2xl border border-line bg-panel/50 p-4 sm:grid-cols-2">
        {items.map((p) => (
          <AdminCheckbox
            key={p.id}
            label={p.name}
            checked={selected.includes(p.id)}
            onChange={(v) => toggle(p.id, v)}
          />
        ))}
      </div>
      <AdminButton className="mt-4" onClick={() => void save()}>
        Сохранить выбор
      </AdminButton>
    </div>
  );
}
