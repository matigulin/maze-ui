import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  ChevronRight,
  SlidersHorizontal,
  LayoutGrid,
  Rows3,
  X,
  Check,
  ChevronDown,
  Heart,
  Sparkles,
  Smartphone,
  Laptop,
  Tablet,
  Watch,
  Headphones,
  Gamepad2,
  Home,
  Cable,
} from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ProductCard } from "@/components/sections/EditorsChoice";

export const Route = createFileRoute("/catalog")({
  head: () => ({
    meta: [
      { title: "Каталог электроники — MAZE" },
      {
        name: "description",
        content:
          "Смартфоны, ноутбуки, планшеты, часы, наушники, игровые консоли и аксессуары. Оригинал, гарантия, доставка по России, шоурум в Санкт-Петербурге.",
      },
      { property: "og:title", content: "Каталог — MAZE" },
      {
        property: "og:description",
        content: "Премиальная электроника с гарантией и trade-in.",
      },
    ],
  }),
  component: CatalogPage,
});

/* -------------------------------------------------------------- data */

type Category =
  | "smartphones"
  | "laptops"
  | "tablets"
  | "watches"
  | "audio"
  | "gaming"
  | "smart-home"
  | "accessories";

type Product = {
  id: string;
  category: Category;
  brand: string;
  name: string;
  price: number;
  oldPrice?: number;
  badge?: string;
  hue: string;
  color: string;
  memory?: string;
  inStock: boolean;
  rating: number;
  isNew?: boolean;
};

const CATEGORIES: { id: Category | "all"; label: string; icon: React.ComponentType<{ size?: number }> }[] = [
  { id: "all", label: "Все категории", icon: LayoutGrid },
  { id: "smartphones", label: "Смартфоны", icon: Smartphone },
  { id: "laptops", label: "Ноутбуки", icon: Laptop },
  { id: "tablets", label: "Планшеты", icon: Tablet },
  { id: "watches", label: "Часы", icon: Watch },
  { id: "audio", label: "Аудио", icon: Headphones },
  { id: "gaming", label: "Игры", icon: Gamepad2 },
  { id: "smart-home", label: "Умный дом", icon: Home },
  { id: "accessories", label: "Аксессуары", icon: Cable },
];

const BRANDS = [
  "Apple",
  "Samsung",
  "Google",
  "Xiaomi",
  "Nothing",
  "Honor",
  "Sony",
  "Bose",
  "Dyson",
  "Marshall",
  "Nintendo",
  "Microsoft",
  "Dell",
  "Asus",
  "Lenovo",
] as const;

const COLORS = [
  { name: "Чёрный", hex: "#0a0a0a" },
  { name: "Титан", hex: "#8a8a8f" },
  { name: "Белый", hex: "#f2f2f2" },
  { name: "Синий", hex: "#1e3a8a" },
  { name: "Пустыня", hex: "#c9a67a" },
  { name: "Зелёный", hex: "#2f6b4a" },
  { name: "Красный", hex: "#b91c1c" },
  { name: "Серебро", hex: "#c0c0c8" },
];

const MEMORY = ["128 ГБ", "256 ГБ", "512 ГБ", "1 ТБ", "2 ТБ"];

const PRODUCTS: Product[] = [
  // Smartphones
  { id: "p1", category: "smartphones", brand: "Apple", name: "iPhone 16 Pro Max 256GB Titanium Black", price: 129990, oldPrice: 139990, badge: "−7%", hue: "#0a0a0a", color: "Чёрный", memory: "256 ГБ", inStock: true, rating: 4.9, isNew: true },
  { id: "p2", category: "smartphones", brand: "Apple", name: "iPhone 16 Pro 512GB Desert Titanium", price: 134990, hue: "#c9a67a", color: "Пустыня", memory: "512 ГБ", inStock: true, rating: 4.9, isNew: true },
  { id: "p3", category: "smartphones", brand: "Apple", name: "iPhone 16 128GB Ultramarine", price: 79990, badge: "Новинка", hue: "#1e3a8a", color: "Синий", memory: "128 ГБ", inStock: true, rating: 4.8, isNew: true },
  { id: "p4", category: "smartphones", brand: "Apple", name: "iPhone 15 128GB Black", price: 64990, oldPrice: 74990, hue: "#0a0a0a", color: "Чёрный", memory: "128 ГБ", inStock: true, rating: 4.7 },
  { id: "p5", category: "smartphones", brand: "Samsung", name: "Galaxy S25 Ultra 512GB Titanium Gray", price: 119990, oldPrice: 129990, hue: "#8a8a8f", color: "Титан", memory: "512 ГБ", inStock: true, rating: 4.8, isNew: true },
  { id: "p6", category: "smartphones", brand: "Samsung", name: "Galaxy Z Fold 6 1TB Silver Shadow", price: 174990, badge: "Хит", hue: "#8a8a8f", color: "Серебро", memory: "1 ТБ", inStock: true, rating: 4.7 },
  { id: "p7", category: "smartphones", brand: "Samsung", name: "Galaxy S25+ 256GB Navy", price: 89990, hue: "#041759", color: "Синий", memory: "256 ГБ", inStock: false, rating: 4.6, isNew: true },
  { id: "p8", category: "smartphones", brand: "Google", name: "Pixel 9 Pro XL 256GB Obsidian", price: 94990, hue: "#0a0a0a", color: "Чёрный", memory: "256 ГБ", inStock: true, rating: 4.7 },
  { id: "p9", category: "smartphones", brand: "Google", name: "Pixel 9 Pro 512GB Porcelain", price: 88990, badge: "Новинка", hue: "#f2f2f2", color: "Белый", memory: "512 ГБ", inStock: true, rating: 4.7, isNew: true },
  { id: "p10", category: "smartphones", brand: "Xiaomi", name: "15 Pro 512GB Jade Green", price: 79990, hue: "#2f6b4a", color: "Зелёный", memory: "512 ГБ", inStock: true, rating: 4.6 },
  { id: "p11", category: "smartphones", brand: "Xiaomi", name: "15 Ultra 1TB Chrome", price: 109990, oldPrice: 119990, badge: "−8%", hue: "#c0c0c8", color: "Серебро", memory: "1 ТБ", inStock: true, rating: 4.7 },
  { id: "p12", category: "smartphones", brand: "Nothing", name: "Phone (3) 256GB Black", price: 59990, hue: "#0a0a0a", color: "Чёрный", memory: "256 ГБ", inStock: true, rating: 4.5, isNew: true },
  { id: "p13", category: "smartphones", brand: "Honor", name: "Magic V3 512GB Tundra Green", price: 149990, badge: "Новинка", hue: "#2f6b4a", color: "Зелёный", memory: "512 ГБ", inStock: false, rating: 4.6, isNew: true },

  // Laptops
  { id: "l1", category: "laptops", brand: "Apple", name: "MacBook Pro 14\" M4 Pro 24GB / 1TB Space Black", price: 249990, badge: "Новинка", hue: "#1c1c1e", color: "Чёрный", memory: "1 ТБ", inStock: true, rating: 4.9, isNew: true },
  { id: "l2", category: "laptops", brand: "Apple", name: "MacBook Air 15\" M3 16GB / 512GB Midnight", price: 159990, hue: "#0f172a", color: "Чёрный", memory: "512 ГБ", inStock: true, rating: 4.8 },
  { id: "l3", category: "laptops", brand: "Apple", name: "MacBook Pro 16\" M4 Max 36GB / 1TB", price: 349990, hue: "#8a8a8f", color: "Серебро", memory: "1 ТБ", inStock: true, rating: 4.9, isNew: true },
  { id: "l4", category: "laptops", brand: "Dell", name: "XPS 15 OLED i9 32GB / 1TB RTX 4070", price: 279990, oldPrice: 299990, hue: "#111827", color: "Чёрный", memory: "1 ТБ", inStock: true, rating: 4.6 },
  { id: "l5", category: "laptops", brand: "Asus", name: "ROG Zephyrus G16 OLED RTX 4080", price: 289990, badge: "Хит", hue: "#0a0a0a", color: "Чёрный", memory: "1 ТБ", inStock: true, rating: 4.7 },
  { id: "l6", category: "laptops", brand: "Lenovo", name: "ThinkPad X1 Carbon Gen 12 i7 32GB", price: 219990, hue: "#1f2937", color: "Чёрный", memory: "512 ГБ", inStock: true, rating: 4.6 },
  { id: "l7", category: "laptops", brand: "Microsoft", name: "Surface Laptop 7 Snapdragon X Elite", price: 189990, badge: "Новинка", hue: "#c0c0c8", color: "Серебро", memory: "512 ГБ", inStock: true, rating: 4.5, isNew: true },
  { id: "l8", category: "laptops", brand: "Apple", name: "MacBook Air 13\" M3 8GB / 256GB Silver", price: 109990, oldPrice: 119990, hue: "#e5e7eb", color: "Серебро", memory: "256 ГБ", inStock: true, rating: 4.7 },

  // Tablets
  { id: "t1", category: "tablets", brand: "Apple", name: "iPad Pro 13\" M4 1TB Wi-Fi Space Black", price: 189990, badge: "Новинка", hue: "#0a0a0a", color: "Чёрный", memory: "1 ТБ", inStock: true, rating: 4.9, isNew: true },
  { id: "t2", category: "tablets", brand: "Apple", name: "iPad Air 11\" M2 256GB Blue", price: 79990, hue: "#1e3a8a", color: "Синий", memory: "256 ГБ", inStock: true, rating: 4.7 },
  { id: "t3", category: "tablets", brand: "Apple", name: "iPad mini 7 128GB Purple", price: 54990, hue: "#7c3aed", color: "Синий", memory: "128 ГБ", inStock: true, rating: 4.6, isNew: true },
  { id: "t4", category: "tablets", brand: "Samsung", name: "Galaxy Tab S10 Ultra 512GB", price: 129990, oldPrice: 139990, hue: "#8a8a8f", color: "Титан", memory: "512 ГБ", inStock: true, rating: 4.7 },
  { id: "t5", category: "tablets", brand: "Xiaomi", name: "Pad 7 Pro 512GB Green", price: 49990, hue: "#2f6b4a", color: "Зелёный", memory: "512 ГБ", inStock: true, rating: 4.5 },
  { id: "t6", category: "tablets", brand: "Microsoft", name: "Surface Pro 11 Snapdragon 16GB / 512GB", price: 149990, hue: "#c0c0c8", color: "Серебро", memory: "512 ГБ", inStock: false, rating: 4.5, isNew: true },

  // Watches
  { id: "w1", category: "watches", brand: "Apple", name: "Watch Ultra 2 Black Titanium 49mm", price: 86990, hue: "#0a0a0a", color: "Чёрный", inStock: true, rating: 4.8, isNew: true },
  { id: "w2", category: "watches", brand: "Apple", name: "Watch Series 10 GPS 46mm Jet Black", price: 44990, badge: "Новинка", hue: "#0a0a0a", color: "Чёрный", inStock: true, rating: 4.7, isNew: true },
  { id: "w3", category: "watches", brand: "Apple", name: "Watch SE 44mm Silver", price: 26990, oldPrice: 29990, hue: "#c0c0c8", color: "Серебро", inStock: true, rating: 4.5 },
  { id: "w4", category: "watches", brand: "Samsung", name: "Galaxy Watch 7 Ultra 47mm Titanium Gray", price: 62990, hue: "#8a8a8f", color: "Титан", inStock: true, rating: 4.6 },
  { id: "w5", category: "watches", brand: "Google", name: "Pixel Watch 3 XL LTE Obsidian", price: 42990, hue: "#0a0a0a", color: "Чёрный", inStock: true, rating: 4.5, isNew: true },
  { id: "w6", category: "watches", brand: "Xiaomi", name: "Watch S4 Sport White", price: 14990, hue: "#f2f2f2", color: "Белый", inStock: true, rating: 4.3 },

  // Audio
  { id: "a1", category: "audio", brand: "Apple", name: "AirPods Pro 2 USB-C с активным шумоподавлением", price: 24990, oldPrice: 27990, badge: "Хит", hue: "#f2f2f2", color: "Белый", inStock: true, rating: 4.8 },
  { id: "a2", category: "audio", brand: "Apple", name: "AirPods Max USB-C Midnight", price: 59990, hue: "#0f172a", color: "Чёрный", inStock: true, rating: 4.7, isNew: true },
  { id: "a3", category: "audio", brand: "Sony", name: "WH-1000XM6 Wireless Silver", price: 39990, badge: "Новинка", hue: "#c0c0c8", color: "Серебро", inStock: true, rating: 4.8, isNew: true },
  { id: "a4", category: "audio", brand: "Bose", name: "QuietComfort Ultra Headphones Black", price: 42990, hue: "#0a0a0a", color: "Чёрный", inStock: true, rating: 4.7 },
  { id: "a5", category: "audio", brand: "Marshall", name: "Major V Wireless Headphones Black", price: 14990, hue: "#1a1a1a", color: "Чёрный", inStock: true, rating: 4.5 },
  { id: "a6", category: "audio", brand: "Sony", name: "WF-1000XM5 Earbuds Black", price: 22990, oldPrice: 26990, hue: "#0a0a0a", color: "Чёрный", inStock: true, rating: 4.6 },
  { id: "a7", category: "audio", brand: "Marshall", name: "Stanmore III Bluetooth Speaker Cream", price: 44990, hue: "#e7d7bd", color: "Пустыня", inStock: false, rating: 4.6 },

  // Gaming
  { id: "g1", category: "gaming", brand: "Sony", name: "PlayStation 5 Pro 2TB + DualSense", price: 89990, badge: "Хит", hue: "#000046", color: "Белый", memory: "2 ТБ", inStock: true, rating: 4.8, isNew: true },
  { id: "g2", category: "gaming", brand: "Sony", name: "PlayStation 5 Slim Digital 1TB", price: 54990, oldPrice: 59990, hue: "#f2f2f2", color: "Белый", memory: "1 ТБ", inStock: true, rating: 4.7 },
  { id: "g3", category: "gaming", brand: "Microsoft", name: "Xbox Series X 2TB Galaxy Special Edition", price: 74990, hue: "#0a0a0a", color: "Чёрный", memory: "2 ТБ", inStock: true, rating: 4.7, isNew: true },
  { id: "g4", category: "gaming", brand: "Nintendo", name: "Switch 2 OLED + Mario Kart 9", price: 49990, badge: "Новинка", hue: "#008ab4", color: "Синий", inStock: true, rating: 4.9, isNew: true },
  { id: "g5", category: "gaming", brand: "Sony", name: "DualSense Edge Wireless Controller", price: 19990, hue: "#f2f2f2", color: "Белый", inStock: true, rating: 4.6 },
  { id: "g6", category: "gaming", brand: "Microsoft", name: "Xbox Elite Series 2 Controller Core", price: 14990, oldPrice: 17990, hue: "#0a0a0a", color: "Чёрный", inStock: true, rating: 4.7 },

  // Smart Home
  { id: "sh1", category: "smart-home", brand: "Apple", name: "HomePod 2-го поколения Midnight", price: 34990, hue: "#0f172a", color: "Чёрный", inStock: true, rating: 4.6 },
  { id: "sh2", category: "smart-home", brand: "Apple", name: "Apple TV 4K 128GB Wi-Fi + Ethernet", price: 19990, hue: "#0a0a0a", color: "Чёрный", inStock: true, rating: 4.7 },
  { id: "sh3", category: "smart-home", brand: "Dyson", name: "Airwrap Complete Long Vinca Blue", price: 64990, hue: "#1488cc", color: "Синий", inStock: true, rating: 4.7 },
  { id: "sh4", category: "smart-home", brand: "Dyson", name: "V15 Detect Absolute Cordless", price: 79990, oldPrice: 89990, badge: "−11%", hue: "#c0c0c8", color: "Серебро", inStock: true, rating: 4.8 },
  { id: "sh5", category: "smart-home", brand: "Xiaomi", name: "Robot Vacuum X20+ White", price: 44990, hue: "#f2f2f2", color: "Белый", inStock: true, rating: 4.5, isNew: true },

  // Accessories
  { id: "ac1", category: "accessories", brand: "Apple", name: "MagSafe Charger 25W (USB-C)", price: 5990, hue: "#f2f2f2", color: "Белый", inStock: true, rating: 4.6, isNew: true },
  { id: "ac2", category: "accessories", brand: "Apple", name: "USB-C to Lightning Cable 2m", price: 2490, hue: "#f2f2f2", color: "Белый", inStock: true, rating: 4.5 },
  { id: "ac3", category: "accessories", brand: "Apple", name: "AirTag 4-pack", price: 9990, hue: "#f2f2f2", color: "Белый", inStock: true, rating: 4.7 },
  { id: "ac4", category: "accessories", brand: "Samsung", name: "45W Power Adapter USB-C", price: 3490, oldPrice: 3990, hue: "#0a0a0a", color: "Чёрный", inStock: true, rating: 4.4 },
  { id: "ac5", category: "accessories", brand: "Xiaomi", name: "Power Bank 20000mAh 33W", price: 3490, hue: "#0a0a0a", color: "Чёрный", inStock: true, rating: 4.5 },
];

const SORTS = [
  { id: "popular", label: "Популярные" },
  { id: "new", label: "Сначала новые" },
  { id: "asc", label: "Цена ↑" },
  { id: "desc", label: "Цена ↓" },
  { id: "rating", label: "По рейтингу" },
] as const;
type SortId = (typeof SORTS)[number]["id"];

const PAGE_SIZE = 12;

/* -------------------------------------------------------------- page */

function CatalogPage() {
  const [category, setCategory] = useState<Category | "all">("all");
  const [brands, setBrands] = useState<string[]>([]);
  const [colors, setColors] = useState<string[]>([]);
  const [memory, setMemory] = useState<string[]>([]);
  const [price, setPrice] = useState<[number, number]>([0, 400000]);
  const [onlyStock, setOnlyStock] = useState(false);
  const [onlyPromo, setOnlyPromo] = useState(false);
  const [sort, setSort] = useState<SortId>("popular");
  const [view, setView] = useState<"grid" | "list">("grid");
  const [drawer, setDrawer] = useState(false);
  const [visible, setVisible] = useState(PAGE_SIZE);

  const toggle = (arr: string[], v: string) =>
    arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v];

  const filtered = useMemo(() => {
    let list = PRODUCTS.filter((p) => p.price >= price[0] && p.price <= price[1]);
    if (category !== "all") list = list.filter((p) => p.category === category);
    if (brands.length) list = list.filter((p) => brands.includes(p.brand));
    if (colors.length) list = list.filter((p) => colors.includes(p.color));
    if (memory.length) list = list.filter((p) => p.memory && memory.includes(p.memory));
    if (onlyStock) list = list.filter((p) => p.inStock);
    if (onlyPromo) list = list.filter((p) => p.oldPrice);

    if (sort === "asc") list = [...list].sort((a, b) => a.price - b.price);
    else if (sort === "desc") list = [...list].sort((a, b) => b.price - a.price);
    else if (sort === "new") list = [...list].sort((a, b) => Number(!!b.isNew) - Number(!!a.isNew));
    else if (sort === "rating") list = [...list].sort((a, b) => b.rating - a.rating);
    return list;
  }, [category, brands, colors, memory, price, onlyStock, onlyPromo, sort]);

  const shown = filtered.slice(0, visible);
  const activeCount =
    brands.length +
    colors.length +
    memory.length +
    (onlyStock ? 1 : 0) +
    (onlyPromo ? 1 : 0);

  const clearAll = () => {
    setBrands([]); setColors([]); setMemory([]);
    setOnlyStock(false); setOnlyPromo(false);
    setPrice([0, 400000]);
    setVisible(PAGE_SIZE);
  };

  const currentCat = CATEGORIES.find((c) => c.id === category)!;
  const brandCounts = useMemo(() => {
    const map: Record<string, number> = {};
    PRODUCTS.filter((p) => category === "all" || p.category === category).forEach((p) => {
      map[p.brand] = (map[p.brand] || 0) + 1;
    });
    return map;
  }, [category]);

  return (
    <div className="min-h-screen bg-white">
      <Header />

      {/* Hero header */}
      <section className="relative overflow-hidden bg-maze-navy-deep pt-28 pb-14 text-white lg:pt-36 lg:pb-20">
        <div
          aria-hidden
          className="absolute inset-0 opacity-70"
          style={{
            background:
              "radial-gradient(1200px 400px at 15% 20%, rgba(28,181,224,0.35), transparent 60%), radial-gradient(900px 400px at 90% 80%, rgba(43,50,178,0.5), transparent 60%)",
          }}
        />
        <div className="relative mx-auto max-w-[1320px] px-5 lg:px-10">
          <nav className="flex items-center gap-2 text-xs text-white/60">
            <Link to="/" className="hover:text-white">Главная</Link>
            <ChevronRight size={12} />
            <span className="text-white">Каталог</span>
            {category !== "all" && (
              <>
                <ChevronRight size={12} />
                <span className="text-white">{currentCat.label}</span>
              </>
            )}
          </nav>
          <div className="mt-6 flex flex-wrap items-end justify-between gap-6">
            <div>
              <span className="text-overline text-maze-cyan-light">
                {category === "all" ? "Каталог MAZE" : "Категория"}
              </span>
              <h1 className="text-display-lg mt-3 max-w-2xl">
                {category === "all" ? "Вся электроника" : currentCat.label}
              </h1>
              <p className="mt-3 max-w-xl text-sm text-white/70 lg:text-base">
                {PRODUCTS.length} товаров из {new Set(PRODUCTS.map((p) => p.brand)).size} брендов. Оригинал, гарантия
                12 месяцев, trade-in на месте.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {["Оригинал", "Trade-in −20%", "Рассрочка 0-0-24", "Доставка сегодня"].map((c) => (
                <span
                  key={c}
                  className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-xs backdrop-blur"
                >
                  <Sparkles size={12} className="text-maze-cyan-light" />
                  {c}
                </span>
              ))}
            </div>
          </div>

          {/* Category chips */}
          <div className="mt-8 -mx-5 flex gap-2 overflow-x-auto px-5 pb-1 lg:mx-0 lg:px-0">
            {CATEGORIES.map((c) => {
              const active = c.id === category;
              const Icon = c.icon;
              return (
                <button
                  key={c.id}
                  onClick={() => { setCategory(c.id); setVisible(PAGE_SIZE); }}
                  className={`inline-flex shrink-0 items-center gap-2 rounded-full border px-4 py-2 text-sm transition ${
                    active
                      ? "border-maze-cyan bg-maze-cyan text-maze-navy-deep"
                      : "border-white/15 bg-white/5 text-white/80 hover:border-white/30 hover:text-white"
                  }`}
                >
                  <Icon size={14} />
                  {c.label}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Main grid */}
      <section className="mx-auto max-w-[1320px] px-5 py-10 lg:px-10 lg:py-14">
        <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
          {/* Sidebar filters (desktop) */}
          <aside className="hidden lg:block">
            <FilterPanel
              brands={brands} setBrands={setBrands}
              colors={colors} setColors={setColors}
              memory={memory} setMemory={setMemory}
              price={price} setPrice={setPrice}
              onlyStock={onlyStock} setOnlyStock={setOnlyStock}
              onlyPromo={onlyPromo} setOnlyPromo={setOnlyPromo}
              toggle={toggle}
              clearAll={clearAll}
              activeCount={activeCount}
              brandCounts={brandCounts}
            />
          </aside>

          <div>
            {/* Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-maze-gray-100 pb-4">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setDrawer(true)}
                  className="inline-flex items-center gap-2 rounded-full border border-maze-gray-100 px-4 py-2 text-sm font-medium text-maze-black transition hover:border-maze-black lg:hidden"
                >
                  <SlidersHorizontal size={16} />
                  Фильтры
                  {activeCount > 0 && (
                    <span className="rounded-full bg-maze-cyan px-1.5 text-[11px] font-semibold text-maze-navy-deep">
                      {activeCount}
                    </span>
                  )}
                </button>
                <span className="text-sm text-maze-gray-600 tabular-nums">
                  Найдено <span className="font-semibold text-maze-black">{filtered.length}</span>
                </span>
              </div>

              <div className="flex items-center gap-2">
                <div className="relative">
                  <select
                    value={sort}
                    onChange={(e) => setSort(e.target.value as SortId)}
                    className="appearance-none rounded-full border border-maze-gray-100 bg-white px-4 py-2 pr-9 text-sm font-medium text-maze-black transition hover:border-maze-black focus:outline-none focus:ring-2 focus:ring-maze-cyan/40"
                  >
                    {SORTS.map((s) => (
                      <option key={s.id} value={s.id}>{s.label}</option>
                    ))}
                  </select>
                  <ChevronDown size={14} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-maze-gray-600" />
                </div>
                <div className="hidden overflow-hidden rounded-full border border-maze-gray-100 sm:flex">
                  <ViewBtn active={view === "grid"} onClick={() => setView("grid")} label="Сетка">
                    <LayoutGrid size={16} />
                  </ViewBtn>
                  <ViewBtn active={view === "list"} onClick={() => setView("list")} label="Список">
                    <Rows3 size={16} />
                  </ViewBtn>
                </div>
              </div>
            </div>

            {/* Active chips */}
            {activeCount > 0 && (
              <div className="mt-4 flex flex-wrap items-center gap-2">
                {[...brands, ...colors, ...memory].map((t) => (
                  <Chip key={t} onRemove={() => {
                    setBrands((b) => b.filter((x) => x !== t));
                    setColors((c) => c.filter((x) => x !== t));
                    setMemory((m) => m.filter((x) => x !== t));
                  }}>{t}</Chip>
                ))}
                {onlyStock && <Chip onRemove={() => setOnlyStock(false)}>В наличии</Chip>}
                {onlyPromo && <Chip onRemove={() => setOnlyPromo(false)}>Скидки</Chip>}
                <button onClick={clearAll} className="text-sm text-maze-blue underline-offset-4 hover:underline">
                  Сбросить всё
                </button>
              </div>
            )}

            {/* Results */}
            {filtered.length === 0 ? (
              <div className="mt-16 rounded-2xl border border-dashed border-maze-gray-100 py-20 text-center">
                <p className="text-heading-2 text-maze-black">Ничего не нашли</p>
                <p className="mx-auto mt-2 max-w-sm text-sm text-maze-gray-600">
                  Попробуйте сбросить часть фильтров — вернём подходящие модели.
                </p>
                <button onClick={clearAll} className="mt-6 rounded-full bg-maze-black px-5 py-2.5 text-sm font-medium text-white transition hover:bg-maze-navy-deep">
                  Сбросить фильтры
                </button>
              </div>
            ) : view === "grid" ? (
              <div className="mt-6 grid grid-cols-2 gap-4 sm:gap-5 xl:grid-cols-3">
                {shown.map((p) => <ProductCard key={p.id} product={p} />)}
              </div>
            ) : (
              <div className="mt-6 flex flex-col gap-3">
                {shown.map((p) => <ProductRow key={p.id} product={p} />)}
              </div>
            )}

            {/* Pagination */}
            {filtered.length > 0 && (
              <div className="mt-12 flex flex-col items-center gap-4">
                <p className="text-sm text-maze-gray-600 tabular-nums">
                  Показано {shown.length} из {filtered.length}
                </p>
                {visible < filtered.length && (
                  <button
                    onClick={() => setVisible((v) => v + PAGE_SIZE)}
                    className="rounded-full border border-maze-gray-100 px-6 py-3 text-sm font-medium text-maze-black transition hover:border-maze-black"
                  >
                    Показать ещё {Math.min(PAGE_SIZE, filtered.length - visible)}
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* SEO description */}
      <section className="border-t border-maze-gray-100 bg-maze-gray-50 py-14">
        <div className="mx-auto max-w-[1320px] px-5 lg:px-10">
          <h2 className="text-heading-1 text-maze-black">Электроника в MAZE</h2>
          <div className="mt-4 grid gap-6 text-sm leading-relaxed text-maze-gray-600 md:grid-cols-2">
            <p>
              В каталоге MAZE — только оригинальные устройства с гарантией производителя и
              российским сертификатом соответствия. Все товары проходят проверку в шоуруме
              на Чайковского, 56.
            </p>
            <p>
              Смартфоны, ноутбуки, планшеты, часы, аудио, игровые консоли, техника для дома и
              аксессуары. Доступны trade-in до −20%, беспроцентная рассрочка и доставка курьером
              в день заказа по Санкт-Петербургу.
            </p>
          </div>
        </div>
      </section>

      <Footer />

      {/* Mobile drawer */}
      {drawer && (
        <div className="fixed inset-0 z-[60] lg:hidden">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setDrawer(false)} />
          <div className="absolute inset-y-0 right-0 w-[90vw] max-w-sm overflow-y-auto bg-white p-6 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-heading-2 text-maze-black">Фильтры</h3>
              <button aria-label="Закрыть" onClick={() => setDrawer(false)} className="grid h-9 w-9 place-items-center rounded-full hover:bg-maze-gray-50">
                <X size={18} />
              </button>
            </div>
            <FilterPanel
              brands={brands} setBrands={setBrands}
              colors={colors} setColors={setColors}
              memory={memory} setMemory={setMemory}
              price={price} setPrice={setPrice}
              onlyStock={onlyStock} setOnlyStock={setOnlyStock}
              onlyPromo={onlyPromo} setOnlyPromo={setOnlyPromo}
              toggle={toggle}
              clearAll={clearAll}
              activeCount={activeCount}
              brandCounts={brandCounts}
            />
            <button
              onClick={() => setDrawer(false)}
              className="mt-6 w-full rounded-full bg-maze-black py-3 text-sm font-medium text-white"
            >
              Показать {filtered.length}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* -------------------------------------------------------------- pieces */

type FilterProps = {
  brands: string[]; setBrands: (v: string[] | ((prev: string[]) => string[])) => void;
  colors: string[]; setColors: (v: string[] | ((prev: string[]) => string[])) => void;
  memory: string[]; setMemory: (v: string[] | ((prev: string[]) => string[])) => void;
  price: [number, number]; setPrice: (v: [number, number]) => void;
  onlyStock: boolean; setOnlyStock: (v: boolean) => void;
  onlyPromo: boolean; setOnlyPromo: (v: boolean) => void;
  toggle: (arr: string[], v: string) => string[];
  clearAll: () => void;
  activeCount: number;
  brandCounts: Record<string, number>;
};

function FilterPanel(p: FilterProps) {
  const availableBrands = BRANDS.filter((b) => p.brandCounts[b]);
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <span className="text-overline text-maze-gray-600">Фильтры</span>
        {p.activeCount > 0 && (
          <button onClick={p.clearAll} className="text-xs text-maze-blue hover:underline">
            Сбросить
          </button>
        )}
      </div>

      <Section title="Цена, ₽">
        <div className="flex items-center gap-2">
          <PriceInput value={p.price[0]} onChange={(v) => p.setPrice([v, p.price[1]])} />
          <span className="text-maze-gray-600">—</span>
          <PriceInput value={p.price[1]} onChange={(v) => p.setPrice([p.price[0], v])} />
        </div>
        <input
          type="range"
          min={0} max={400000} step={5000}
          value={p.price[1]}
          onChange={(e) => p.setPrice([p.price[0], Number(e.target.value)])}
          className="mt-3 w-full accent-maze-cyan"
        />
      </Section>

      <Section title="Бренд">
        <div className="max-h-56 space-y-2 overflow-y-auto pr-1">
          {availableBrands.map((b) => (
            <Checkbox
              key={b}
              label={b}
              count={p.brandCounts[b]}
              checked={p.brands.includes(b)}
              onChange={() => p.setBrands(p.toggle(p.brands, b))}
            />
          ))}
        </div>
      </Section>

      <Section title="Цвет">
        <div className="flex flex-wrap gap-2">
          {COLORS.map((c) => {
            const active = p.colors.includes(c.name);
            return (
              <button
                key={c.name}
                aria-label={c.name}
                onClick={() => p.setColors(p.toggle(p.colors, c.name))}
                title={c.name}
                className={`relative h-8 w-8 rounded-full border-2 transition ${
                  active ? "border-maze-cyan scale-110" : "border-maze-gray-100 hover:border-maze-gray-600"
                }`}
                style={{ background: c.hex }}
              >
                {active && (
                  <Check size={14} className="absolute inset-0 m-auto text-white drop-shadow" />
                )}
              </button>
            );
          })}
        </div>
      </Section>

      <Section title="Память">
        <div className="grid grid-cols-2 gap-2">
          {MEMORY.map((m) => {
            const active = p.memory.includes(m);
            return (
              <button
                key={m}
                onClick={() => p.setMemory(p.toggle(p.memory, m))}
                className={`rounded-lg border px-3 py-2 text-sm transition ${
                  active
                    ? "border-maze-black bg-maze-black text-white"
                    : "border-maze-gray-100 text-maze-black hover:border-maze-black"
                }`}
              >
                {m}
              </button>
            );
          })}
        </div>
      </Section>

      <Section title="Дополнительно">
        <div className="space-y-2">
          <Checkbox label="Только в наличии" checked={p.onlyStock} onChange={() => p.setOnlyStock(!p.onlyStock)} />
          <Checkbox label="Со скидкой" checked={p.onlyPromo} onChange={() => p.setOnlyPromo(!p.onlyPromo)} />
        </div>
      </Section>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border-t border-maze-gray-100 pt-5 first:border-t-0 first:pt-0">
      <h4 className="mb-3 text-sm font-semibold text-maze-black">{title}</h4>
      {children}
    </div>
  );
}

function Checkbox({
  label, checked, onChange, count,
}: { label: string; checked: boolean; onChange: () => void; count?: number }) {
  return (
    <label className="flex cursor-pointer items-center gap-2.5 text-sm text-maze-black">
      <span
        className={`grid h-4 w-4 place-items-center rounded border transition ${
          checked ? "border-maze-black bg-maze-black text-white" : "border-maze-gray-200 bg-white"
        }`}
      >
        {checked && <Check size={12} strokeWidth={3} />}
      </span>
      <input type="checkbox" checked={checked} onChange={onChange} className="sr-only" />
      <span className="flex-1">{label}</span>
      {count != null && <span className="text-xs text-maze-gray-600 tabular-nums">{count}</span>}
    </label>
  );
}

function PriceInput({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <div className="flex-1 rounded-lg border border-maze-gray-100 px-3 py-2 focus-within:border-maze-black">
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(Number(e.target.value) || 0)}
        className="w-full bg-transparent text-sm tabular-nums outline-none"
      />
    </div>
  );
}

function Chip({ children, onRemove }: { children: React.ReactNode; onRemove: () => void }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-maze-gray-50 px-3 py-1.5 text-xs text-maze-black">
      {children}
      <button aria-label="Убрать" onClick={onRemove} className="rounded-full p-0.5 hover:bg-maze-gray-200">
        <X size={12} />
      </button>
    </span>
  );
}

function ViewBtn({
  active, onClick, children, label,
}: {
  active: boolean; onClick: () => void; children: React.ReactNode; label: string;
}) {
  return (
    <button
      aria-label={label}
      onClick={onClick}
      className={`grid h-9 w-9 place-items-center transition ${
        active ? "bg-maze-black text-white" : "text-maze-gray-600 hover:bg-maze-gray-50"
      }`}
    >
      {children}
    </button>
  );
}

function ProductRow({ product: p }: { product: Product }) {
  return (
    <article className="group grid grid-cols-[120px_1fr_auto] items-center gap-5 rounded-2xl border border-maze-gray-100 p-4 transition hover:border-maze-black sm:grid-cols-[160px_1fr_auto]">
      <div
        className="relative aspect-square overflow-hidden rounded-xl"
        style={{
          background: `radial-gradient(circle at 30% 30%, ${p.hue}25, transparent 60%), #f5f5f7`,
        }}
      >
        <div className="absolute inset-0 grid place-items-center">
          <div className="h-3/4 w-1/2 rounded-lg" style={{ background: p.hue, opacity: 0.85 }} />
        </div>
        {p.badge && (
          <span className="absolute left-2 top-2 rounded-full bg-maze-black px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-white">
            {p.badge}
          </span>
        )}
      </div>
      <div className="min-w-0">
        <div className="text-overline text-maze-gray-600">{p.brand}</div>
        <h3 className="mt-1 truncate text-base font-medium text-maze-black">{p.name}</h3>
        <div className="mt-2 flex flex-wrap gap-2 text-xs text-maze-gray-600">
          {p.memory && <span className="rounded-full bg-maze-gray-50 px-2 py-0.5">{p.memory}</span>}
          <span className="rounded-full bg-maze-gray-50 px-2 py-0.5">{p.color}</span>
          <span className="rounded-full bg-maze-gray-50 px-2 py-0.5">★ {p.rating.toFixed(1)}</span>
          {p.inStock ? (
            <span className="rounded-full bg-maze-cyan/10 px-2 py-0.5 text-maze-teal">В наличии</span>
          ) : (
            <span className="rounded-full bg-maze-gray-50 px-2 py-0.5">Под заказ</span>
          )}
        </div>
      </div>
      <div className="flex flex-col items-end gap-2">
        <div className="text-right tabular-nums">
          <div className="text-lg font-semibold text-maze-black">{p.price.toLocaleString("ru-RU")} ₽</div>
          {p.oldPrice && (
            <div className="text-xs text-maze-gray-600 line-through">{p.oldPrice.toLocaleString("ru-RU")} ₽</div>
          )}
        </div>
        <div className="flex items-center gap-1.5">
          <button aria-label="В избранное" className="grid h-9 w-9 place-items-center rounded-full border border-maze-gray-100 text-maze-black transition hover:border-maze-black">
            <Heart size={15} />
          </button>
          <button className="rounded-full bg-maze-black px-4 py-2 text-sm font-medium text-white transition hover:bg-maze-navy-deep">
            В корзину
          </button>
        </div>
      </div>
    </article>
  );
}
