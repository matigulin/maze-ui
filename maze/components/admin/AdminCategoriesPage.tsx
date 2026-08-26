"use client";

import { useEffect, useState, type FormEvent } from "react";
import { Field } from "@/components/Field";
import { useAdminApi } from "@/lib/admin/client";
import { runAfterCommit } from "@/lib/run-after-commit";
import type { AdminCategory, CategoryBody } from "@/lib/admin/types";
import {
  AdminActionsTd,
  AdminActionsTh,
  AdminAlert,
  AdminButton,
  AdminCard,
  AdminCardList,
  AdminCardRow,
  AdminCheckbox,
  AdminModal,
  AdminPageHeader,
  AdminSelect,
  AdminTable,
  AdminTd,
  AdminTextarea,
  AdminTh,
  errorMessage,
} from "@/lib/admin/ui";

const empty: CategoryBody = {
  slug: "",
  name: "",
  parentId: null,
  isBrand: false,
  brandLogoUrl: null,
  icon: null,
  image: null,
  description: null,
  externalLink: null,
  sortOrder: 0,
  isActive: true,
};

function statusLabel(item: AdminCategory) {
  if (item.deletedAt) return "Удалена";
  return item.isActive ? "Активна" : "Скрыта";
}

export function AdminCategoriesPage() {
  const api = useAdminApi();
  const [items, setItems] = useState<AdminCategory[]>([]);
  const [form, setForm] = useState<CategoryBody>(empty);
  const [editing, setEditing] = useState<AdminCategory | null>(null);
  const [open, setOpen] = useState(false);
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState("");

  const load = async () => {
    try {
      setItems(await api.listCategories(true));
    } catch (e) {
      setError(errorMessage(e));
    }
  };

  useEffect(() => {
    runAfterCommit(() => load());
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const update = <K extends keyof CategoryBody>(
    key: K,
    value: CategoryBody[K],
  ) => setForm((old) => ({ ...old, [key]: value }));

  async function upload(
    file: File | undefined,
    field: "image" | "brandLogoUrl",
  ) {
    if (!file) return;
    setUploading(field);
    try {
      update(field, (await api.upload(file)).url);
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setUploading("");
    }
  }

  function edit(item?: AdminCategory) {
    setEditing(item ?? null);
    setForm(
      item
        ? {
            slug: item.slug,
            name: item.name,
            parentId: item.parentId,
            isBrand: item.isBrand,
            brandLogoUrl: item.brandLogoUrl,
            icon: item.icon,
            image: item.image,
            description: item.description,
            externalLink: item.externalLink,
            sortOrder: item.sortOrder,
            isActive: item.isActive,
          }
        : empty,
    );
    setOpen(true);
  }

  async function save(e: FormEvent) {
    e.preventDefault();
    setError("");
    try {
      if (editing) await api.updateCategory(editing.id, form);
      else await api.createCategory(form);
      setOpen(false);
      await load();
    } catch (err) {
      setError(errorMessage(err));
    }
  }

  function remove(id: string) {
    void api
      .deleteCategory(id)
      .then(load)
      .catch((e) => setError(errorMessage(e)));
  }

  function restore(id: string) {
    void api
      .restoreCategory(id)
      .then(load)
      .catch((e) => setError(errorMessage(e)));
  }

  const parents = items
    .filter((c) => !editing || c.id !== editing.id)
    .map((c) => ({ value: c.id, label: c.name }));

  const btnSm = "rounded-lg px-2.5 py-1.5 text-xs";

  return (
    <div>
      <AdminPageHeader
        title="Категории"
        description="Бренды и подкатегории каталога"
        actions={
          <AdminButton onClick={() => edit()}>Создать категорию</AdminButton>
        }
      />
      {error && <AdminAlert>{error}</AdminAlert>}

      <AdminCardList>
        {items.map((item) => {
          const parent = items.find((p) => p.id === item.parentId);
          const deleted = Boolean(item.deletedAt);
          return (
            <AdminCard
              key={item.id}
              className={deleted ? "opacity-45" : undefined}
            >
              <p className="font-medium text-ink">{item.name}</p>
              <p className="mt-1 text-xs text-muted">{item.slug}</p>
              <div className="mt-3 space-y-2">
                <AdminCardRow label="Производитель">
                  {parent?.name ?? "—"}
                </AdminCardRow>
                <AdminCardRow label="Тип">
                  {item.isBrand ? "Бренд" : "Категория"}
                </AdminCardRow>
                <AdminCardRow label="Статус">{statusLabel(item)}</AdminCardRow>
              </div>
              <div className="mt-3 flex justify-end gap-1.5 border-t border-line/60 pt-3">
                <AdminButton
                  variant="ghost"
                  className={btnSm}
                  onClick={() => edit(item)}
                >
                  Изменить
                </AdminButton>
                {deleted ? (
                  <AdminButton
                    variant="secondary"
                    className={btnSm}
                    onClick={() => restore(item.id)}
                  >
                    Восстановить
                  </AdminButton>
                ) : (
                  <AdminButton
                    variant="danger"
                    className={btnSm}
                    onClick={() => remove(item.id)}
                  >
                    Удалить
                  </AdminButton>
                )}
              </div>
            </AdminCard>
          );
        })}
      </AdminCardList>

      <AdminTable desktopOnly>
        <thead>
          <tr>
            <AdminTh>Название</AdminTh>
            <AdminTh>Производитель</AdminTh>
            <AdminTh>Тип</AdminTh>
            <AdminTh>Статус</AdminTh>
            <AdminActionsTh />
          </tr>
        </thead>
        <tbody>
          {items.map((item) => {
            const parent = items.find((p) => p.id === item.parentId);
            const deleted = Boolean(item.deletedAt);
            return (
              <tr key={item.id} className={deleted ? "opacity-45" : ""}>
                <AdminTd>
                  <p>{item.name}</p>
                  <p className="text-xs text-muted">{item.slug}</p>
                </AdminTd>
                <AdminTd>{parent?.name ?? "—"}</AdminTd>
                <AdminTd>{item.isBrand ? "Бренд" : "Категория"}</AdminTd>
                <AdminTd>{statusLabel(item)}</AdminTd>
                <AdminActionsTd>
                  <AdminButton variant="ghost" onClick={() => edit(item)}>
                    Изменить
                  </AdminButton>
                  {deleted ? (
                    <AdminButton
                      variant="secondary"
                      onClick={() => restore(item.id)}
                    >
                      Восстановить
                    </AdminButton>
                  ) : (
                    <AdminButton
                      variant="danger"
                      onClick={() => remove(item.id)}
                    >
                      Удалить
                    </AdminButton>
                  )}
                </AdminActionsTd>
              </tr>
            );
          })}
        </tbody>
      </AdminTable>

      <AdminModal
        open={open}
        onClose={() => setOpen(false)}
        title={editing ? "Изменить категорию" : "Новая категория"}
        wide
      >
        <form onSubmit={save} className="grid gap-4 sm:grid-cols-2">
          <Field
            required
            label="Slug"
            value={form.slug}
            onChange={(e) => update("slug", e.target.value)}
          />
          <Field
            required
            label="Название"
            value={form.name}
            onChange={(e) => update("name", e.target.value)}
          />
          <AdminSelect
            label="Родительская категория"
            value={form.parentId ?? ""}
            onChange={(v) => update("parentId", v || null)}
            options={[{ value: "", label: "Нет родителя" }, ...parents]}
          />
          <Field
            label="Иконка"
            value={form.icon ?? ""}
            onChange={(e) => update("icon", e.target.value || null)}
          />
          <Field
            label="URL логотипа бренда"
            value={form.brandLogoUrl ?? ""}
            onChange={(e) => update("brandLogoUrl", e.target.value || null)}
          />
          <input
            aria-label="Загрузить логотип"
            type="file"
            accept="image/*"
            onChange={(e) => void upload(e.target.files?.[0], "brandLogoUrl")}
            className="self-end text-xs text-muted"
          />
          <Field
            label="URL изображения"
            value={form.image ?? ""}
            onChange={(e) => update("image", e.target.value || null)}
          />
          <input
            aria-label="Загрузить изображение"
            type="file"
            accept="image/*"
            onChange={(e) => void upload(e.target.files?.[0], "image")}
            className="self-end text-xs text-muted"
          />
          {uploading && <p className="text-xs text-muted">Загрузка…</p>}
          <Field
            label="Внешняя ссылка"
            value={form.externalLink ?? ""}
            onChange={(e) => update("externalLink", e.target.value || null)}
          />
          <Field
            type="number"
            label="Порядок"
            value={form.sortOrder ?? 0}
            onChange={(e) => update("sortOrder", Number(e.target.value))}
          />
          <div className="sm:col-span-2">
            <AdminTextarea
              label="Описание"
              value={form.description ?? ""}
              onChange={(v) => update("description", v || null)}
            />
          </div>
          <AdminCheckbox
            label="Бренд"
            checked={form.isBrand ?? false}
            onChange={(v) => update("isBrand", v)}
          />
          <AdminCheckbox
            label="Активна"
            checked={form.isActive ?? true}
            onChange={(v) => update("isActive", v)}
          />
          <div className="sm:col-span-2 flex justify-end gap-2">
            <AdminButton variant="secondary" onClick={() => setOpen(false)}>
              Отмена
            </AdminButton>
            <AdminButton type="submit">Сохранить</AdminButton>
          </div>
        </form>
      </AdminModal>
    </div>
  );
}
