"use client";

import Link from "next/link";
import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import { Field } from "@/components/Field";
import { useAdminApi } from "@/lib/admin/client";
import { runAfterCommit } from "@/lib/run-after-commit";
import type {
  AdminBanner,
  AdminCmsPage,
  AdminInfoSlide,
  PublicSettings,
} from "@/lib/admin/types";
import {
  AdminActionsTd,
  AdminActionsTh,
  AdminAlert,
  AdminButton,
  AdminCardList,
  AdminCardRow,
  AdminCheckbox,
  AdminListCard,
  AdminModal,
  AdminPageHeader,
  AdminTable,
  AdminTd,
  AdminTextarea,
  AdminTh,
  adminCardActionCls,
  errorMessage,
} from "@/lib/admin/ui";

const emptyBanner = {
  title: "",
  subtitle: "",
  imageUrl: "",
  link: "",
  size: "large",
  sortOrder: 0,
  isActive: true,
};
const emptySlide = {
  icon: "",
  title: "",
  description: "",
  sortOrder: 0,
  isActive: true,
};
const emptyCms = {
  slug: "",
  title: "",
  content: "",
  metaDescription: "",
  isPublished: true,
};

function UploadField({
  value,
  onChange,
  label = "Изображение",
}: {
  value: string;
  onChange: (value: string) => void;
  label?: string;
}) {
  const api = useAdminApi();
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  async function upload(file?: File) {
    if (!file) return;
    setUploading(true);
    setError("");
    try {
      onChange((await api.upload(file)).url);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setUploading(false);
    }
  }
  return (
    <div className="space-y-2">
      <Field
        label={label}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      <input
        aria-label={`Загрузить: ${label}`}
        type="file"
        accept="image/*"
        onChange={(e) => void upload(e.target.files?.[0])}
        className="block w-full text-xs text-muted file:mr-3 file:rounded-lg file:border-0 file:bg-bg-2 file:px-3 file:py-2 file:text-ink"
      />
      {uploading && <p className="text-xs text-muted">Загрузка…</p>}
      {error && <AdminAlert>{error}</AdminAlert>}
    </div>
  );
}

export function BannersPage() {
  const api = useAdminApi();
  const [items, setItems] = useState<AdminBanner[]>([]);
  const [form, setForm] = useState(emptyBanner);
  const [editing, setEditing] = useState<AdminBanner | null>(null);
  const [open, setOpen] = useState(false);
  const [error, setError] = useState("");
  const load = async () => {
    try {
      setItems(await api.listBanners());
    } catch (e) {
      setError(errorMessage(e));
    }
  };
  useEffect(() => {
    runAfterCommit(() => load());
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  const set = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) =>
    setForm((f) => ({ ...f, [key]: value }));
  async function save(e: FormEvent) {
    e.preventDefault();
    setError("");
    try {
      if (editing) await api.updateBanner(editing.id, form);
      else await api.createBanner(form);
      setOpen(false);
      await load();
    } catch (err) {
      setError(errorMessage(err));
    }
  }
  function openEdit(b: AdminBanner) {
    setEditing(b);
    setForm({
      title: b.title,
      subtitle: b.subtitle ?? "",
      imageUrl: b.imageUrl,
      link: b.link,
      size: b.size,
      sortOrder: b.sortOrder,
      isActive: b.isActive,
    });
    setOpen(true);
  }
  function removeBanner(id: string) {
    void api
      .deleteBanner(id)
      .then(load)
      .catch((e) => setError(errorMessage(e)));
  }
  return (
    <div>
      <AdminPageHeader
        title="Баннеры"
        description="Баннеры главной страницы"
        actions={
          <AdminButton
            onClick={() => {
              setEditing(null);
              setForm(emptyBanner);
              setOpen(true);
            }}
          >
            Создать
          </AdminButton>
        }
      />
      {error && <AdminAlert>{error}</AdminAlert>}
      <AdminCardList>
        {items.map((b) => (
          <AdminListCard
            key={b.id}
            title={b.title}
            subtitle={b.link}
            actions={
              <>
                <AdminButton
                  variant="ghost"
                  className={adminCardActionCls}
                  onClick={() => openEdit(b)}
                >
                  Изменить
                </AdminButton>
                <AdminButton
                  variant="danger"
                  className={adminCardActionCls}
                  onClick={() => removeBanner(b.id)}
                >
                  Удалить
                </AdminButton>
              </>
            }
            fieldsClassName="grid-cols-2 sm:grid-cols-2"
          >
            <AdminCardRow stacked label="Размер">
              {b.size}
            </AdminCardRow>
            <div className="min-w-0 text-right">
              <p className="text-[11px] leading-tight text-faint">Статус</p>
              <div className="mt-0.5 text-sm leading-snug text-ink">
                {b.isActive ? "Активен" : "Скрыт"}
              </div>
            </div>
          </AdminListCard>
        ))}
      </AdminCardList>
      <AdminTable desktopOnly>
        <thead>
          <tr>
            <AdminTh>Баннер</AdminTh>
            <AdminTh>Размер</AdminTh>
            <AdminTh>Статус</AdminTh>
            <AdminActionsTh />
          </tr>
        </thead>
        <tbody>
          {items.map((b) => (
            <tr key={b.id}>
              <AdminTd>
                <p>{b.title}</p>
                <p className="text-xs text-muted">{b.link}</p>
              </AdminTd>
              <AdminTd>{b.size}</AdminTd>
              <AdminTd>{b.isActive ? "Активен" : "Скрыт"}</AdminTd>
              <AdminActionsTd>
                <AdminButton variant="ghost" onClick={() => openEdit(b)}>
                  Изменить
                </AdminButton>
                <AdminButton
                  variant="danger"
                  onClick={() => removeBanner(b.id)}
                >
                  Удалить
                </AdminButton>
              </AdminActionsTd>
            </tr>
          ))}
        </tbody>
      </AdminTable>
      <AdminModal
        open={open}
        onClose={() => setOpen(false)}
        title={editing ? "Изменить баннер" : "Новый баннер"}
        wide
      >
        <form onSubmit={save} className="grid gap-4 sm:grid-cols-2">
          <Field
            required
            label="Заголовок"
            value={form.title}
            onChange={(e) => set("title", e.target.value)}
          />
          <Field
            label="Подзаголовок"
            value={form.subtitle}
            onChange={(e) => set("subtitle", e.target.value)}
          />
          <UploadField
            value={form.imageUrl}
            onChange={(v) => set("imageUrl", v)}
          />
          <Field
            required
            label="Ссылка"
            value={form.link}
            onChange={(e) => set("link", e.target.value)}
          />
          <Field
            label="Размер"
            value={form.size}
            onChange={(e) => set("size", e.target.value)}
          />
          <Field
            type="number"
            label="Порядок"
            value={form.sortOrder}
            onChange={(e) => set("sortOrder", Number(e.target.value))}
          />
          <div className="sm:col-span-2">
            <AdminCheckbox
              label="Активен"
              checked={form.isActive}
              onChange={(v) => set("isActive", v)}
            />
          </div>
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

export function SlidesPage() {
  const api = useAdminApi();
  const [items, setItems] = useState<AdminInfoSlide[]>([]);
  const [form, setForm] = useState(emptySlide);
  const [editing, setEditing] = useState<AdminInfoSlide | null>(null);
  const [open, setOpen] = useState(false);
  const [error, setError] = useState("");
  const load = async () => {
    try {
      setItems(await api.listSlides());
    } catch (e) {
      setError(errorMessage(e));
    }
  };
  useEffect(() => {
    runAfterCommit(() => load());
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  async function save(e: FormEvent) {
    e.preventDefault();
    setError("");
    try {
      if (editing) await api.updateSlide(editing.id, form);
      else await api.createSlide(form);
      setOpen(false);
      await load();
    } catch (err) {
      setError(errorMessage(err));
    }
  }
  function openEdit(s: AdminInfoSlide) {
    setEditing(s);
    setForm({
      icon: s.icon,
      title: s.title,
      description: s.description,
      sortOrder: s.sortOrder,
      isActive: s.isActive,
    });
    setOpen(true);
  }
  function removeSlide(id: string) {
    void api
      .deleteSlide(id)
      .then(load)
      .catch((e) => setError(errorMessage(e)));
  }
  return (
    <div>
      <AdminPageHeader
        title="Информационные слайды"
        actions={
          <AdminButton
            onClick={() => {
              setEditing(null);
              setForm(emptySlide);
              setOpen(true);
            }}
          >
            Создать
          </AdminButton>
        }
      />
      {error && <AdminAlert>{error}</AdminAlert>}
      <AdminCardList>
        {items.map((s) => (
          <AdminListCard
            key={s.id}
            title={
              <>
                {s.icon} {s.title}
              </>
            }
            subtitle={s.description}
            actions={
              <>
                <AdminButton
                  variant="ghost"
                  className={adminCardActionCls}
                  onClick={() => openEdit(s)}
                >
                  Изменить
                </AdminButton>
                <AdminButton
                  variant="danger"
                  className={adminCardActionCls}
                  onClick={() => removeSlide(s.id)}
                >
                  Удалить
                </AdminButton>
              </>
            }
            fieldsClassName="sm:grid-cols-2"
          >
            <AdminCardRow stacked label="Порядок">
              {s.sortOrder}
            </AdminCardRow>
            <AdminCardRow stacked label="Статус">
              {s.isActive ? "Активен" : "Скрыт"}
            </AdminCardRow>
          </AdminListCard>
        ))}
      </AdminCardList>
      <AdminTable desktopOnly>
        <thead>
          <tr>
            <AdminTh>Слайд</AdminTh>
            <AdminTh>Порядок</AdminTh>
            <AdminTh>Статус</AdminTh>
            <AdminActionsTh />
          </tr>
        </thead>
        <tbody>
          {items.map((s) => (
            <tr key={s.id}>
              <AdminTd>
                <p>
                  {s.icon} {s.title}
                </p>
                <p className="text-xs text-muted">{s.description}</p>
              </AdminTd>
              <AdminTd>{s.sortOrder}</AdminTd>
              <AdminTd>{s.isActive ? "Активен" : "Скрыт"}</AdminTd>
              <AdminActionsTd>
                <AdminButton variant="ghost" onClick={() => openEdit(s)}>
                  Изменить
                </AdminButton>
                <AdminButton variant="danger" onClick={() => removeSlide(s.id)}>
                  Удалить
                </AdminButton>
              </AdminActionsTd>
            </tr>
          ))}
        </tbody>
      </AdminTable>
      <AdminModal
        open={open}
        onClose={() => setOpen(false)}
        title={editing ? "Изменить слайд" : "Новый слайд"}
      >
        <form onSubmit={save} className="space-y-4">
          <Field
            required
            label="Иконка"
            value={form.icon}
            onChange={(e) => setForm({ ...form, icon: e.target.value })}
          />
          <Field
            required
            label="Заголовок"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
          />
          <AdminTextarea
            required
            label="Описание"
            value={form.description}
            onChange={(v) => setForm({ ...form, description: v })}
          />
          <Field
            type="number"
            label="Порядок"
            value={form.sortOrder}
            onChange={(e) =>
              setForm({ ...form, sortOrder: Number(e.target.value) })
            }
          />
          <AdminCheckbox
            label="Активен"
            checked={form.isActive}
            onChange={(v) => setForm({ ...form, isActive: v })}
          />
          <div className="flex justify-end gap-2">
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

export function CmsListPage() {
  const api = useAdminApi();
  const [items, setItems] = useState<AdminCmsPage[]>([]);
  const [error, setError] = useState("");
  const load = async () => {
    try {
      setItems(await api.listCmsPages());
    } catch (e) {
      setError(errorMessage(e));
    }
  };
  useEffect(() => {
    runAfterCommit(() => load()); 
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  function removePage(id: string) {
    void api
      .deleteCmsPage(id)
      .then(load)
      .catch((e) => setError(errorMessage(e)));
  }
  return (
    <div>
      <AdminPageHeader
        title="CMS-страницы"
        actions={
          <Link href="/admin/content/cms/new">
            <AdminButton>Создать</AdminButton>
          </Link>
        }
      />
      {error && <AdminAlert>{error}</AdminAlert>}
      <AdminCardList>
        {items.map((p) => (
          <AdminListCard
            key={p.id}
            title={p.title}
            subtitle={p.slug}
            actions={
              <>
                <Link href={`/admin/content/cms/${p.id}`}>
                  <AdminButton variant="ghost" className={adminCardActionCls}>
                    Изменить
                  </AdminButton>
                </Link>
                <AdminButton
                  variant="danger"
                  className={adminCardActionCls}
                  onClick={() => removePage(p.id)}
                >
                  Удалить
                </AdminButton>
              </>
            }
          >
            <AdminCardRow stacked label="Статус">
              {p.isPublished ? "Опубликована" : "Черновик"}
            </AdminCardRow>
          </AdminListCard>
        ))}
      </AdminCardList>
      <AdminTable desktopOnly>
        <thead>
          <tr>
            <AdminTh>Название</AdminTh>
            <AdminTh>Slug</AdminTh>
            <AdminTh>Статус</AdminTh>
            <AdminActionsTh />
          </tr>
        </thead>
        <tbody>
          {items.map((p) => (
            <tr key={p.id}>
              <AdminTd>{p.title}</AdminTd>
              <AdminTd>{p.slug}</AdminTd>
              <AdminTd>{p.isPublished ? "Опубликована" : "Черновик"}</AdminTd>
              <AdminActionsTd>
                <Link href={`/admin/content/cms/${p.id}`}>
                  <AdminButton variant="ghost">Изменить</AdminButton>
                </Link>
                <AdminButton variant="danger" onClick={() => removePage(p.id)}>
                  Удалить
                </AdminButton>
              </AdminActionsTd>
            </tr>
          ))}
        </tbody>
      </AdminTable>
    </div>
  );
}

export function CmsEditorPage({ id }: { id?: string }) {
  const api = useAdminApi();
  const [form, setForm] = useState(emptyCms);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  useEffect(() => {
    if (id)
      void api
        .getCmsPage(id)
        .then((p) =>
          setForm({
            slug: p.slug,
            title: p.title,
            content: p.content,
            metaDescription: p.metaDescription ?? "",
            isPublished: p.isPublished,
          }),
        )
        .catch((e) => setError(errorMessage(e)));
  }, [id]); // eslint-disable-line react-hooks/exhaustive-deps
  async function save(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      if (id) await api.updateCmsPage(id, form);
      else {
        const page = await api.createCmsPage(form);
        window.location.assign(`/admin/content/cms/${page.id}`);
        return;
      }
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setSaving(false);
    }
  }
  return (
    <div className="max-w-3xl">
      <AdminPageHeader
        title={id ? "Редактирование CMS" : "Новая CMS-страница"}
      />
      {error && <AdminAlert>{error}</AdminAlert>}
      <form
        onSubmit={save}
        className="space-y-4 rounded-2xl border border-line bg-panel/50 p-5"
      >
        <Field
          required
          label="Slug"
          value={form.slug}
          onChange={(e) => setForm({ ...form, slug: e.target.value })}
        />
        <Field
          required
          label="Заголовок"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
        />
        <AdminTextarea
          required
          label="Содержимое"
          rows={16}
          value={form.content}
          onChange={(v) => setForm({ ...form, content: v })}
        />
        <AdminTextarea
          label="Meta description"
          value={form.metaDescription}
          onChange={(v) => setForm({ ...form, metaDescription: v })}
        />
        <AdminCheckbox
          label="Опубликована"
          checked={form.isPublished}
          onChange={(v) => setForm({ ...form, isPublished: v })}
        />
        <AdminButton type="submit" disabled={saving}>
          {saving ? "Сохранение…" : "Сохранить"}
        </AdminButton>
      </form>
    </div>
  );
}

export function SiteSettingsPage() {
  const api = useAdminApi();
  const [form, setForm] = useState<PublicSettings>({
    storeName: "MAZE",
    address: "",
    phone: "",
    email: "",
    metro: "",
    workingHours: "",
    socialLinks: { telegram: "", telegramUsed: "" },
    mapCoordinates: { lat: 0, lng: 0 },
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    void api
      .getPublicSettings()
      .then((v) =>
        setForm({
          ...v,
          socialLinks: {
            telegram: v.socialLinks?.telegram ?? "",
            telegramUsed: v.socialLinks?.telegramUsed ?? "",
          },
          mapCoordinates: v.mapCoordinates ?? { lat: 0, lng: 0 },
        }),
      )
      .catch((e) => setError(errorMessage(e)));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const social = (key: keyof NonNullable<PublicSettings["socialLinks"]>) =>
    form.socialLinks?.[key] ?? "";

  async function save(e: FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess(false);
    setSaving(true);
    try {
      const saved = await api.updateSiteSettings(form);
      setForm({
        ...saved,
        socialLinks: {
          telegram: saved.socialLinks?.telegram ?? "",
          telegramUsed: saved.socialLinks?.telegramUsed ?? "",
        },
        mapCoordinates: saved.mapCoordinates ?? { lat: 0, lng: 0 },
      });
      setSuccess(true);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-3xl">
      <AdminPageHeader
        title="Настройки сайта"
        description="Контакты и данные витрины"
      />
      {error && <AdminAlert>{error}</AdminAlert>}
      {success && <AdminAlert tone="ok">Настройки сохранены</AdminAlert>}
      <form onSubmit={save} className="space-y-4">
        <SettingsSection title="Магазин">
          <Field
            label="Название магазина"
            value={form.storeName ?? ""}
            onChange={(e) => setForm({ ...form, storeName: e.target.value })}
          />
          <Field
            label="Часы работы"
            value={form.workingHours ?? ""}
            onChange={(e) => setForm({ ...form, workingHours: e.target.value })}
          />
          <div className="sm:col-span-2">
            <Field
              label="Адрес"
              value={form.address ?? ""}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
            />
          </div>
          <Field
            label="Метро"
            value={form.metro ?? ""}
            onChange={(e) => setForm({ ...form, metro: e.target.value })}
          />
        </SettingsSection>

        <SettingsSection title="Контакты">
          <Field
            label="Телефон"
            value={form.phone ?? ""}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
          />
          <Field
            label="Email"
            type="email"
            value={form.email ?? ""}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
        </SettingsSection>

        <SettingsSection title="Соцсети">
          {(
            [
              ["telegram", "Telegram"],
              ["telegramUsed", "Telegram б/у"],
            ] as const
          ).map(([key, label]) => (
            <Field
              key={key}
              label={label}
              value={social(key)}
              onChange={(e) =>
                setForm({
                  ...form,
                  socialLinks: { ...form.socialLinks, [key]: e.target.value },
                })
              }
            />
          ))}
        </SettingsSection>

        <SettingsSection title="Карта">
          <Field
            type="number"
            step="any"
            label="Широта"
            value={form.mapCoordinates?.lat ?? 0}
            onChange={(e) =>
              setForm({
                ...form,
                mapCoordinates: {
                  lat: Number(e.target.value),
                  lng: form.mapCoordinates?.lng ?? 0,
                },
              })
            }
          />
          <Field
            type="number"
            step="any"
            label="Долгота"
            value={form.mapCoordinates?.lng ?? 0}
            onChange={(e) =>
              setForm({
                ...form,
                mapCoordinates: {
                  lat: form.mapCoordinates?.lat ?? 0,
                  lng: Number(e.target.value),
                },
              })
            }
          />
        </SettingsSection>

        <div className="flex justify-end pt-1">
          <AdminButton type="submit" disabled={saving}>
            {saving ? "Сохранение…" : "Сохранить"}
          </AdminButton>
        </div>
      </form>
    </div>
  );
}

function SettingsSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-line bg-panel/50 p-4 sm:p-5">
      <h3 className="mb-4 text-[11px] font-medium uppercase tracking-wider text-faint">
        {title}
      </h3>
      <div className="grid gap-4 sm:grid-cols-2">{children}</div>
    </section>
  );
}
