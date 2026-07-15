"use client";

import Link from "next/link";
import { useEffect, useState, type FormEvent } from "react";
import { useParams, useRouter } from "next/navigation";
import { Field } from "@/components/Field";
import { useAdminApi } from "@/lib/admin/client";
import { DEVICE_TYPES, type AdminCategory, type AdminProductDetail, type ProductBody, type VariantBody } from "@/lib/admin/types";
import { AdminAlert, AdminButton, AdminCard, AdminCardList, AdminCardRow, AdminCheckbox, AdminModal, AdminPageHeader, AdminSelect, AdminTable, AdminTd, AdminTextarea, AdminTh, errorMessage, formatPrice } from "@/lib/admin/ui";

const productEmpty: ProductBody = { name: "", slug: "", categoryId: "", subcategoryId: "", deviceType: "smartphone", description: "", basePrice: 0, oldPrice: null, badgeType: null, badgeText: null, isPublished: false };
const variantEmpty: VariantBody = { sku: "", colorName: "", colorHex: "#000000", memory: "", price: 0, quantity: 0, isAvailable: true };

function ProductForm({ initial, onSave, saving }: { initial: ProductBody; onSave: (v: ProductBody) => void; saving: boolean }) {
  const api = useAdminApi(); const [form, setForm] = useState(initial); const [categories, setCategories] = useState<AdminCategory[]>([]); const [error, setError] = useState("");
  useEffect(() => setForm(initial), [initial]);
  useEffect(() => { void api.listCategories().then(setCategories).catch((e) => setError(errorMessage(e))); }, []); // eslint-disable-line react-hooks/exhaustive-deps
  const brands = categories.filter((c) => c.isBrand);
  const children = categories.filter((c) => c.parentId === form.categoryId);
  return <form onSubmit={(e) => { e.preventDefault(); onSave(form); }} className="grid gap-4 rounded-2xl border border-line bg-panel/50 p-5 sm:grid-cols-2">{error && <div className="sm:col-span-2"><AdminAlert>{error}</AdminAlert></div>}<Field required label="Название" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /><Field required label="Slug" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} /><AdminSelect required label="Бренд / категория" value={form.categoryId} onChange={(v) => setForm({ ...form, categoryId: v, subcategoryId: "" })} options={[{ value: "", label: "Выберите бренд" }, ...brands.map((c) => ({ value: c.id, label: c.name }))]} /><AdminSelect required label="Подкатегория" value={form.subcategoryId} onChange={(v) => setForm({ ...form, subcategoryId: v })} options={[{ value: "", label: "Выберите подкатегорию" }, ...children.map((c) => ({ value: c.id, label: c.name }))]} /><AdminSelect required label="Тип устройства" value={form.deviceType} onChange={(v) => setForm({ ...form, deviceType: v })} options={DEVICE_TYPES.map((v) => ({ value: v, label: v }))} /><Field required type="number" min="0" label="Цена" value={form.basePrice} onChange={(e) => setForm({ ...form, basePrice: Number(e.target.value) })} /><Field type="number" min="0" label="Старая цена" value={form.oldPrice ?? ""} onChange={(e) => setForm({ ...form, oldPrice: e.target.value ? Number(e.target.value) : null })} /><Field label="Тип бейджа" value={form.badgeType ?? ""} onChange={(e) => setForm({ ...form, badgeType: e.target.value || null })} /><Field label="Текст бейджа" value={form.badgeText ?? ""} onChange={(e) => setForm({ ...form, badgeText: e.target.value || null })} /><div className="sm:col-span-2"><AdminTextarea label="Описание" value={form.description ?? ""} onChange={(v) => setForm({ ...form, description: v || null })} /></div><AdminCheckbox label="Опубликовать" checked={form.isPublished ?? false} onChange={(v) => setForm({ ...form, isPublished: v })} /><div className="flex justify-end"><AdminButton type="submit" disabled={saving}>{saving ? "Сохранение…" : "Сохранить"}</AdminButton></div></form>;
}

export function ProductsListPage() {
  const api = useAdminApi();
  const [items, setItems] = useState<AdminProductDetail[]>([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [error, setError] = useState("");

  const load = async () => {
    try {
      const result = await api.listProducts({
        page,
        limit: 20,
        search: search || undefined,
      });
      setItems(result.items as AdminProductDetail[]);
      setPages(
        result.meta
          ? Math.max(1, Math.ceil(result.meta.total / result.meta.limit))
          : 1,
      );
    } catch (e) {
      setError(errorMessage(e));
    }
  };

  useEffect(() => {
    void load();
  }, [page]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div>
      <AdminPageHeader
        title="Товары"
        actions={
          <Link href="/admin/catalog/products/new">
            <AdminButton>Добавить товар</AdminButton>
          </Link>
        }
      />
      {error && <AdminAlert>{error}</AdminAlert>}
      <form
        className="mb-4 flex items-end gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          setPage(1);
          void load();
        }}
      >
        <div className="min-w-0 flex-1">
          <Field
            label="Поиск"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <AdminButton type="submit" className="shrink-0 px-3 py-3 text-sm">
          Найти
        </AdminButton>
      </form>

      <AdminCardList>
        {items.map((p) => (
          <AdminCard key={p.id} href={`/admin/catalog/products/${p.id}`}>
            <p className="font-medium text-ink">{p.name}</p>
            <p className="mt-1 text-xs text-muted">{p.slug}</p>
            <div className="mt-3 space-y-2">
              <AdminCardRow label="Цена">{formatPrice(p.basePrice)}</AdminCardRow>
              <AdminCardRow label="Опубликован">
                {p.isPublished ? "Да" : "Нет"}
              </AdminCardRow>
              <AdminCardRow label="Склад">
                {p.inStock ? "В наличии" : "Нет"}
              </AdminCardRow>
            </div>
          </AdminCard>
        ))}
      </AdminCardList>

      <AdminTable desktopOnly>
        <thead>
          <tr>
            <AdminTh>Товар</AdminTh>
            <AdminTh>Цена</AdminTh>
            <AdminTh>Опубликован</AdminTh>
            <AdminTh>Склад</AdminTh>
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
              <AdminTd>{formatPrice(p.basePrice)}</AdminTd>
              <AdminTd>{p.isPublished ? "Да" : "Нет"}</AdminTd>
              <AdminTd>{p.inStock ? "В наличии" : "Нет"}</AdminTd>
              <AdminTd className="space-x-2">
                <Link href={`/admin/catalog/products/${p.id}`}>
                  <AdminButton variant="ghost">Открыть</AdminButton>
                </Link>
                <AdminButton
                  variant="danger"
                  onClick={() =>
                    void api
                      .deleteProduct(p.id)
                      .then(load)
                      .catch((e) => setError(errorMessage(e)))
                  }
                >
                  Удалить
                </AdminButton>
              </AdminTd>
            </tr>
          ))}
        </tbody>
      </AdminTable>

      <div className="mt-4 flex items-center gap-3 text-sm text-muted">
        <AdminButton
          variant="secondary"
          disabled={page <= 1}
          onClick={() => setPage(page - 1)}
        >
          Назад
        </AdminButton>
        <span>
          Страница {page} из {pages}
        </span>
        <AdminButton
          variant="secondary"
          disabled={page >= pages}
          onClick={() => setPage(page + 1)}
        >
          Вперёд
        </AdminButton>
      </div>
    </div>
  );
}

export function NewProductPage() {
  const api = useAdminApi(); const router = useRouter(); const [error, setError] = useState(""); const [saving, setSaving] = useState(false);
  async function save(form: ProductBody) { setSaving(true); try { const p = await api.createProduct(form); router.replace(`/admin/catalog/products/${p.id}`); } catch (e) { setError(errorMessage(e)); } finally { setSaving(false); } }
  return <div className="max-w-4xl"><AdminPageHeader title="Новый товар" />{error && <AdminAlert>{error}</AdminAlert>}<ProductForm initial={productEmpty} onSave={(v) => void save(v)} saving={saving} /></div>;
}

export function ProductEditorPage() {
  const { id } = useParams<{ id: string }>(); const api = useAdminApi(); const [product, setProduct] = useState<AdminProductDetail | null>(null); const [tab, setTab] = useState("general"); const [error, setError] = useState(""); const [saving, setSaving] = useState(false); const [variant, setVariant] = useState<VariantBody>(variantEmpty); const [variantId, setVariantId] = useState<string | null>(null); const [feature, setFeature] = useState({ title: "", description: "", iconUrl: "", sortOrder: 0 }); const [open, setOpen] = useState("");
  const load = async () => { try { setProduct(await api.getProduct(id)); } catch (e) { setError(errorMessage(e)); } };
  useEffect(() => { void load(); }, [id]); // eslint-disable-line react-hooks/exhaustive-deps
  if (!product) return <div>{error ? <AdminAlert>{error}</AdminAlert> : "Загрузка…"}</div>;
  const body: ProductBody = { name: product.name, slug: product.slug, categoryId: product.categoryId, subcategoryId: product.subcategoryId, deviceType: product.deviceType, description: product.description, basePrice: product.basePrice, oldPrice: product.oldPrice, badgeType: product.badgeType, badgeText: product.badgeText, isPublished: product.isPublished };
  async function saveProduct(v: ProductBody) { setSaving(true); try { await api.updateProduct(id, v); await load(); } catch (e) { setError(errorMessage(e)); } finally { setSaving(false); } }
  async function saveVariant(e: FormEvent) { e.preventDefault(); try { if (variantId) await api.updateVariant(id, variantId, variant); else await api.createVariant(id, variant); setOpen(""); await load(); } catch (e) { setError(errorMessage(e)); } }
  async function saveFeature(e: FormEvent) { e.preventDefault(); try { if (open === "feature-edit") { const f = product?.features.find((x) => x.id === variantId); if (f) await api.updateFeature(id, f.id, { ...feature, iconUrl: feature.iconUrl || null }); } else await api.createFeature(id, { ...feature, iconUrl: feature.iconUrl || null }); setOpen(""); await load(); } catch (e) { setError(errorMessage(e)); } }
  const tabs = [["general", "Основное"], ["variants", "Варианты"], ["images", "Изображения"], ["features", "Особенности"], ["specs", "Характеристики"]];
  return <><div className="max-w-5xl"><AdminPageHeader title={product.name} description={product.slug} />{error && <AdminAlert>{error}</AdminAlert>}<div className="mb-5 flex flex-wrap gap-2">{tabs.map(([key, label]) => <AdminButton key={key} variant={tab === key ? "primary" : "secondary"} onClick={() => setTab(key)}>{label}</AdminButton>)}</div>{tab === "general" && <ProductForm initial={body} onSave={(v) => void saveProduct(v)} saving={saving} />}{tab === "variants" && <><AdminButton onClick={() => { setVariant(variantEmpty); setVariantId(null); setOpen("variant"); }}>Добавить вариант</AdminButton><VariantTable product={product} onEdit={(v) => { setVariant({ sku: v.sku, colorName: v.colorName, colorHex: v.colorHex, memory: v.memory, price: v.price, quantity: v.quantity, isAvailable: v.isAvailable }); setVariantId(v.id); setOpen("variant"); }} onDelete={(v) => void api.deleteVariant(id, v.id).then(load).catch((e) => setError(errorMessage(e)))} /></>}{tab === "images" && <ImagesTab product={product} api={api} id={id} reload={load} onError={setError} />}{tab === "features" && <><AdminButton onClick={() => { setFeature({ title: "", description: "", iconUrl: "", sortOrder: 0 }); setVariantId(null); setOpen("feature"); }}>Добавить особенность</AdminButton><AdminTable><thead><tr><AdminTh>Название</AdminTh><AdminTh>Порядок</AdminTh><AdminTh /></tr></thead><tbody>{product.features.map((f) => <tr key={f.id}><AdminTd><p>{f.title}</p><p className="text-xs text-muted">{f.description}</p></AdminTd><AdminTd>{f.sortOrder}</AdminTd><AdminTd><AdminButton variant="ghost" onClick={() => { setFeature({ title: f.title, description: f.description, iconUrl: f.iconUrl ?? "", sortOrder: f.sortOrder }); setVariantId(f.id); setOpen("feature-edit"); }}>Изменить</AdminButton><AdminButton variant="danger" onClick={() => void api.deleteFeature(id, f.id).then(load).catch((e) => setError(errorMessage(e)))}>Удалить</AdminButton></AdminTd></tr>)}</tbody></AdminTable></>}{tab === "specs" && <SpecsTab product={product} api={api} id={id} onError={setError} />}</div>
    <AdminModal open={open === "variant"} onClose={() => setOpen("")} title={variantId ? "Изменить вариант" : "Новый вариант"}><form onSubmit={saveVariant} className="space-y-3"><Field required label="SKU" value={variant.sku} onChange={(e) => setVariant({ ...variant, sku: e.target.value })} /><Field required label="Цвет" value={variant.colorName} onChange={(e) => setVariant({ ...variant, colorName: e.target.value })} /><Field required label="Hex цвета" value={variant.colorHex} onChange={(e) => setVariant({ ...variant, colorHex: e.target.value })} /><Field label="Память" value={variant.memory ?? ""} onChange={(e) => setVariant({ ...variant, memory: e.target.value || null })} /><Field required type="number" label="Цена" value={variant.price} onChange={(e) => setVariant({ ...variant, price: Number(e.target.value) })} /><Field type="number" label="Количество" value={variant.quantity ?? 0} onChange={(e) => setVariant({ ...variant, quantity: Number(e.target.value) })} /><AdminCheckbox label="Доступен" checked={variant.isAvailable ?? true} onChange={(v) => setVariant({ ...variant, isAvailable: v })} /><AdminButton type="submit">Сохранить</AdminButton></form></AdminModal><AdminModal open={open.startsWith("feature")} onClose={() => setOpen("")} title="Особенность"><form onSubmit={saveFeature} className="space-y-3"><Field required label="Заголовок" value={feature.title} onChange={(e) => setFeature({ ...feature, title: e.target.value })} /><AdminTextarea required label="Описание" value={feature.description} onChange={(v) => setFeature({ ...feature, description: v })} /><Field label="URL иконки" value={feature.iconUrl} onChange={(e) => setFeature({ ...feature, iconUrl: e.target.value })} /><Field type="number" label="Порядок" value={feature.sortOrder} onChange={(e) => setFeature({ ...feature, sortOrder: Number(e.target.value) })} /><AdminButton type="submit">Сохранить</AdminButton></form></AdminModal></>;
}

function VariantTable({ product, onEdit, onDelete }: { product: AdminProductDetail; onEdit: (v: AdminProductDetail["variants"][number]) => void; onDelete: (v: AdminProductDetail["variants"][number]) => void }) { return <AdminTable><thead><tr><AdminTh>SKU</AdminTh><AdminTh>Цвет / память</AdminTh><AdminTh>Цена</AdminTh><AdminTh>Остаток</AdminTh><AdminTh /></tr></thead><tbody>{product.variants.map((v) => <tr key={v.id}><AdminTd>{v.sku}</AdminTd><AdminTd>{v.colorName} {v.memory}</AdminTd><AdminTd>{formatPrice(v.price)}</AdminTd><AdminTd>{v.quantity}</AdminTd><AdminTd><AdminButton variant="ghost" onClick={() => onEdit(v)}>Изменить</AdminButton><AdminButton variant="danger" onClick={() => onDelete(v)}>Удалить</AdminButton></AdminTd></tr>)}</tbody></AdminTable>; }
function ImagesTab({ product, api, id, reload, onError }: { product: AdminProductDetail; api: ReturnType<typeof useAdminApi>; id: string; reload: () => Promise<void>; onError: (v: string) => void }) { const [file, setFile] = useState<File | null>(null); async function add() { if (!file) return; try { const u = await api.upload(file); await api.createImage(id, { url: u.url, isPrimary: !product.images.length }); await reload(); } catch (e) { onError(errorMessage(e)); } } return <div className="space-y-4"><div className="flex gap-3"><input type="file" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] ?? null)} /><AdminButton onClick={() => void add()} disabled={!file}>Загрузить</AdminButton></div><div className="grid gap-3 sm:grid-cols-3">{product.images.map((image) => <div key={image.id} className="rounded-xl border border-line p-3"><img src={image.url} alt="" className="h-32 w-full object-contain" /><div className="mt-2 flex gap-2"><AdminButton variant="ghost" onClick={() => void api.updateImage(id, image.id, { isPrimary: true }).then(reload).catch((e) => onError(errorMessage(e)))}>{image.isPrimary ? "Основное" : "Сделать основным"}</AdminButton><AdminButton variant="danger" onClick={() => void api.deleteImage(id, image.id).then(reload).catch((e) => onError(errorMessage(e)))}>Удалить</AdminButton></div></div>)}</div></div>; }
function SpecsTab({ product, api, id, onError }: { product: AdminProductDetail; api: ReturnType<typeof useAdminApi>; id: string; onError: (v: string) => void }) { const [fields, setFields] = useState<Awaited<ReturnType<typeof api.listSpecFields>>>([]); const [values, setValues] = useState<Record<string, string>>({}); useEffect(() => { void api.listSpecFields(product.deviceType).then((f) => { setFields(f); setValues(Object.fromEntries(product.specifications.map((s) => [s.fieldId, s.value]))); }).catch((e) => onError(errorMessage(e))); }, [product.deviceType]); // eslint-disable-line react-hooks/exhaustive-deps
  return <form className="grid gap-4 rounded-2xl border border-line p-5 sm:grid-cols-2" onSubmit={(e) => { e.preventDefault(); void api.upsertSpecs(id, fields.map((f) => ({ fieldId: f.id, value: values[f.id] ?? "" }))).catch((err) => onError(errorMessage(err))); }} >{fields.map((f) => <Field key={f.id} label={f.fieldLabel} value={values[f.id] ?? ""} onChange={(e) => setValues({ ...values, [f.id]: e.target.value })} />)}<div className="sm:col-span-2"><AdminButton type="submit">Сохранить характеристики</AdminButton></div></form>; }
