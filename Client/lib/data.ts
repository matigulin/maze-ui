// ============================================================
//  MAZE — мок-данные (без бэкенда)
// ============================================================

export type Badge = "NEW" | "SALE" | "HIT" | null;

export type ColorOption = { name: string; hex: string };
export type Spec = { label: string; value: string };

export type ProductVariant = {
  id: string;
  color: string;
  memory?: string;
  price: number;
  oldPrice?: number;
  inStock: boolean;
  quantityAvailable: number;
};

export type Product = {
  id: string;
  slug: string;
  name: string;
  brand: string;
  category: string; // тип: Смартфоны, Ноутбуки, Аудио, ...
  price: number;
  oldPrice?: number;
  badge: Badge;
  rating: number; // 0..5
  reviews: number;
  tint: [string, string]; // цвета градиента-плейсхолдера
  glyph: string; // короткая подпись поверх картинки
  imageUrl?: string | null;
  images?: string[];
  defaultVariantId?: string;
  variants?: ProductVariant[];
  /** Суммарный доступный остаток (карточка каталога). */
  quantityAvailable?: number;
  inStock?: boolean;
  colors: ColorOption[];
  memory?: string[];
  specs: Spec[];
  short: string;
};

import { CATEGORY_TINTS } from "@/shared/config/brand-colors";

export const CATEGORIES = [
  { slug: "apple", name: "Apple", count: 5, icon: "apple", tint: CATEGORY_TINTS.apple },
  { slug: "samsung", name: "Samsung", count: 2, icon: "smartphone", tint: CATEGORY_TINTS.samsung },
  { slug: "sony", name: "Sony", count: 2, icon: "gamepad", tint: CATEGORY_TINTS.sony },
  { slug: "marshall", name: "Marshall", count: 2, icon: "speaker", tint: CATEGORY_TINTS.marshall },
  { slug: "dyson", name: "Dyson", count: 2, icon: "wind", tint: CATEGORY_TINTS.dyson },
  { slug: "harman", name: "Harman Kardon", count: 1, icon: "audio", tint: CATEGORY_TINTS.harman },
  { slug: "console", name: "Игровые приставки", count: 1, icon: "gamepad", tint: CATEGORY_TINTS.console },
  { slug: "accessories", name: "Аксессуары", count: 8, icon: "headphones", tint: CATEGORY_TINTS.accessories },
  { slug: "used", name: "Б/У техника", count: 4, icon: "recycle", tint: CATEGORY_TINTS.used },
];

export const BRANDS = [
  "APPLE",
  "SAMSUNG",
  "SONY",
  "MARSHALL",
  "DYSON",
  "HARMAN KARDON",
  "NOTHING",
  "XIAOMI",
];

export const products: Product[] = [
  {
    id: "iphone-15-pro-max",
    slug: "iphone-15-pro-max",
    name: "Apple iPhone 15 Pro Max 256GB",
    brand: "Apple",
    category: "Смартфоны",
    price: 119990,
    oldPrice: 129990,
    badge: "SALE",
    rating: 4.9,
    reviews: 214,
    tint: ["#8ea2c9", "#3a2f57"],
    glyph: "15 Pro Max",
    colors: [
      { name: "Natural Titanium", hex: "#b8b0a3" },
      { name: "Blue Titanium", hex: "#4a5a75" },
      { name: "Black Titanium", hex: "#2b2b2f" },
    ],
    memory: ["256 GB", "512 GB", "1 TB"],
    specs: [
      { label: "Экран", value: "6.7″ OLED 120Гц" },
      { label: "Чип", value: "A17 Pro" },
      { label: "Камера", value: "48 Мп · 5× зум" },
      { label: "Материал", value: "Титан Grade 5" },
    ],
    short: "Флагман на титане с чипом A17 Pro и перископической камерой.",
  },
  {
    id: "macbook-air-m3",
    slug: "macbook-air-m3",
    name: 'Apple MacBook Air 13" M3 256GB',
    brand: "Apple",
    category: "Ноутбуки",
    price: 114990,
    badge: "NEW",
    rating: 4.9,
    reviews: 156,
    tint: ["#9fb4d8", "#2d3350"],
    glyph: "Air M3",
    colors: [
      { name: "Midnight", hex: "#2a2f3a" },
      { name: "Starlight", hex: "#e6ddcf" },
      { name: "Silver", hex: "#d7dbe0" },
    ],
    memory: ["8 ГБ / 256 ГБ", "16 ГБ / 512 ГБ"],
    specs: [
      { label: "Экран", value: "13.6″ Liquid Retina" },
      { label: "Чип", value: "Apple M3" },
      { label: "Автономность", value: "до 18 часов" },
      { label: "Вес", value: "1.24 кг" },
    ],
    short: "Тонкий и бесшумный ноутбук на M3 с матрицей Liquid Retina.",
  },
  {
    id: "apple-watch-ultra-2",
    slug: "apple-watch-ultra-2",
    name: "Apple Watch Ultra 2 49mm",
    brand: "Apple",
    category: "Часы",
    price: 89990,
    badge: "NEW",
    rating: 4.8,
    reviews: 98,
    tint: ["#f2a65a", "#25324f"],
    glyph: "Ultra 2",
    colors: [
      { name: "Titanium", hex: "#c9c5bd" },
      { name: "Black Ocean", hex: "#20242b" },
    ],
    specs: [
      { label: "Корпус", value: "49 мм титан" },
      { label: "Яркость", value: "3000 нит" },
      { label: "Защита", value: "100 м · MIL-STD" },
      { label: "Батарея", value: "до 72 часов" },
    ],
    short: "Самые прочные часы Apple для спорта и приключений.",
  },
  {
    id: "airpods-pro-2",
    slug: "airpods-pro-2",
    name: "Apple AirPods Pro 2 USB-C",
    brand: "Apple",
    category: "Аудио",
    price: 24990,
    badge: null,
    rating: 4.8,
    reviews: 342,
    tint: ["#dfe6f0", "#3b4266"],
    glyph: "AirPods Pro",
    colors: [{ name: "White", hex: "#f4f5f7" }],
    specs: [
      { label: "Шумоподавление", value: "Активное 2×" },
      { label: "Чип", value: "H2" },
      { label: "Разъём", value: "USB-C" },
      { label: "Автономность", value: "до 30 часов" },
    ],
    short: "Наушники с топовым шумодавом и адаптивным звуком.",
  },
  {
    id: "ipad-pro-m4",
    slug: "ipad-pro-m4",
    name: 'Apple iPad Pro 13" M4 256GB',
    brand: "Apple",
    category: "Планшеты",
    price: 129990,
    badge: "HIT",
    rating: 4.9,
    reviews: 121,
    tint: ["#6d7cc0", "#20233f"],
    glyph: "iPad Pro M4",
    colors: [
      { name: "Space Black", hex: "#26272b" },
      { name: "Silver", hex: "#d7dbe0" },
    ],
    memory: ["256 GB", "512 GB", "1 TB"],
    specs: [
      { label: "Экран", value: "13″ Tandem OLED" },
      { label: "Чип", value: "Apple M4" },
      { label: "Толщина", value: "5.1 мм" },
      { label: "Перо", value: "Apple Pencil Pro" },
    ],
    short: "Тончайший планшет с дисплеем Ultra Retina XDR на двух OLED.",
  },
  {
    id: "ps5-slim",
    slug: "ps5-slim",
    name: "Sony PlayStation 5 Slim 1TB",
    brand: "Sony",
    category: "Игровые приставки",
    price: 54990,
    badge: null,
    rating: 4.9,
    reviews: 487,
    tint: ["#dfe7f2", "#2b3350"],
    glyph: "PS5 Slim",
    colors: [{ name: "White", hex: "#f2f4f7" }],
    memory: ["1 TB"],
    specs: [
      { label: "Накопитель", value: "SSD 1 ТБ" },
      { label: "Графика", value: "4K · 120 fps" },
      { label: "Привод", value: "Blu-ray 4K" },
      { label: "Геймпад", value: "DualSense" },
    ],
    short: "Компактная версия PS5 с 4K-графикой и молниеносным SSD.",
  },
  {
    id: "marshall-major-v",
    slug: "marshall-major-v",
    name: "Marshall Major V",
    brand: "Marshall",
    category: "Аудио",
    price: 14990,
    badge: null,
    rating: 4.7,
    reviews: 176,
    tint: ["#1a2b23", "#c9962f"],
    glyph: "Major V",
    colors: [
      { name: "Black", hex: "#171717" },
      { name: "Brown", hex: "#5a4632" },
      { name: "Cream", hex: "#e7dcc3" },
    ],
    specs: [
      { label: "Автономность", value: "до 100 часов" },
      { label: "Зарядка", value: "Беспроводная" },
      { label: "Тип", value: "Накладные" },
      { label: "Bluetooth", value: "5.3 · LE" },
    ],
    short: "Легендарный рок-н-ролльный дизайн и 100 часов автономности.",
  },
  {
    id: "dyson-airwrap",
    slug: "dyson-airwrap",
    name: "Dyson Airwrap Complete Long",
    brand: "Dyson",
    category: "Красота",
    price: 59990,
    oldPrice: 64990,
    badge: "SALE",
    rating: 4.8,
    reviews: 263,
    tint: ["#2a2a2e", "#c05a8f"],
    glyph: "Airwrap",
    colors: [
      { name: "Nickel/Copper", hex: "#b6764a" },
      { name: "Blue/Blush", hex: "#7d90c9" },
    ],
    specs: [
      { label: "Технология", value: "Эффект Коанда" },
      { label: "Насадки", value: "6 в комплекте" },
      { label: "Режимы", value: "Контроль t°" },
      { label: "Уход", value: "Без экстремального нагрева" },
    ],
    short: "Укладка без экстремального нагрева за счёт эффекта Коанда.",
  },
  {
    id: "galaxy-s24-ultra",
    slug: "galaxy-s24-ultra",
    name: "Samsung Galaxy S24 Ultra 256GB",
    brand: "Samsung",
    category: "Смартфоны",
    price: 109990,
    oldPrice: 114990,
    badge: null,
    rating: 4.8,
    reviews: 198,
    tint: ["#8a5cf0", "#1e2140"],
    glyph: "S24 Ultra",
    colors: [
      { name: "Titanium Violet", hex: "#6f5b8a" },
      { name: "Titanium Gray", hex: "#6b6d72" },
      { name: "Titanium Black", hex: "#26262a" },
    ],
    memory: ["256 GB", "512 GB", "1 TB"],
    specs: [
      { label: "Экран", value: "6.8″ QHD+ 120Гц" },
      { label: "Чип", value: "Snapdragon 8 Gen 3" },
      { label: "Камера", value: "200 Мп · 5× зум" },
      { label: "Перо", value: "S Pen встроен" },
    ],
    short: "AI-флагман на титане с камерой 200 Мп и встроенным S Pen.",
  },
  {
    id: "harman-aura-4",
    slug: "harman-aura-4",
    name: "Harman Kardon Aura Studio 4",
    brand: "Harman Kardon",
    category: "Аудио",
    price: 34990,
    badge: null,
    rating: 4.7,
    reviews: 84,
    tint: ["#7b5cc0", "#141733"],
    glyph: "Aura 4",
    colors: [{ name: "Black", hex: "#18181c" }],
    specs: [
      { label: "Мощность", value: "210 Вт" },
      { label: "Дизайн", value: "Прозрачный купол" },
      { label: "Подсветка", value: "Ambient light" },
      { label: "Bluetooth", value: "5.3" },
    ],
    short: "Культовая акустика-«купол» с фирменной подсветкой и басом.",
  },
  {
    id: "galaxy-watch-7",
    slug: "galaxy-watch-7",
    name: "Samsung Galaxy Watch 7 44mm",
    brand: "Samsung",
    category: "Часы",
    price: 29990,
    badge: null,
    rating: 4.6,
    reviews: 73,
    tint: ["#5aa9f2", "#1a2440"],
    glyph: "Watch 7",
    colors: [
      { name: "Green", hex: "#3f5e4b" },
      { name: "Silver", hex: "#c9ccd2" },
    ],
    specs: [
      { label: "Экран", value: "1.5″ Super AMOLED" },
      { label: "Датчик", value: "BioActive 3-в-1" },
      { label: "Защита", value: "5 ATM · IP68" },
      { label: "Чип", value: "Exynos W1000" },
    ],
    short: "Умные часы с точным биосенсором и ярким AMOLED.",
  },
  {
    id: "dyson-v15",
    slug: "dyson-v15",
    name: "Dyson V15 Detect Absolute",
    brand: "Dyson",
    category: "Дом",
    price: 69990,
    badge: "HIT",
    rating: 4.9,
    reviews: 141,
    tint: ["#f2c14e", "#20304a"],
    glyph: "V15 Detect",
    colors: [{ name: "Yellow/Nickel", hex: "#e6c15a" }],
    specs: [
      { label: "Лазер", value: "Подсветка пыли" },
      { label: "Автономность", value: "до 60 минут" },
      { label: "Дисплей", value: "LCD-счётчик частиц" },
      { label: "Фильтрация", value: "HEPA · захват 99.99%" },
    ],
    short: "Пылесос с лазером, который показывает невидимую пыль.",
  },
  {
    id: "sony-wh1000xm5",
    slug: "sony-wh1000xm5",
    name: "Sony WH-1000XM5",
    brand: "Sony",
    category: "Аудио",
    price: 34990,
    badge: "NEW",
    rating: 4.9,
    reviews: 209,
    tint: ["#c9d2e0", "#2a2f45"],
    glyph: "WH-1000XM5",
    colors: [
      { name: "Black", hex: "#1c1c20" },
      { name: "Silver", hex: "#d9d5cc" },
    ],
    specs: [
      { label: "Шумоподавление", value: "8 микрофонов" },
      { label: "Процессор", value: "V1 + QN1" },
      { label: "Автономность", value: "до 30 часов" },
      { label: "Кодеки", value: "LDAC · Hi-Res" },
    ],
    short: "Эталон шумоподавления с Hi-Res звуком и LDAC.",
  },
  {
    id: "marshall-stanmore-3",
    slug: "marshall-stanmore-3",
    name: "Marshall Stanmore III",
    brand: "Marshall",
    category: "Аудио",
    price: 39990,
    badge: null,
    rating: 4.8,
    reviews: 66,
    tint: ["#1a1a1a", "#b98a2e"],
    glyph: "Stanmore III",
    colors: [
      { name: "Black", hex: "#0e1f16" },
      { name: "Cream", hex: "#e7dcc3" },
    ],
    specs: [
      { label: "Мощность", value: "80 Вт" },
      { label: "Динамики", value: "2 ВЧ + 1 НЧ" },
      { label: "Управление", value: "Аналоговые ручки" },
      { label: "Bluetooth", value: "5.2" },
    ],
    short: "Домашняя колонка с фирменным звуком и тактильными ручками.",
  },
];

export type Review = {
  name: string;
  initials: string;
  text: string;
  rating: number;
  product: string;
  hue: string;
};

export const reviews: Review[] = [
  {
    name: "Александр К.",
    initials: "АК",
    text: "Пришёл iPhone 15 Pro Max — всё оригинальное, чек и гарантия. Менеджер помог с переносом данных. Рекомендую!",
    rating: 5,
    product: "iPhone 15 Pro Max",
    hue: "#35e4f0",
  },
  {
    name: "Мария С.",
    initials: "МС",
    text: "Заказала Dyson Airwrap — доставили в день заказа к 19:00. Упаковка идеальная, гарантия 3 года. Очень довольна.",
    rating: 5,
    product: "Dyson Airwrap",
    hue: "#ff3d8b",
  },
  {
    name: "Дмитрий В.",
    initials: "ДВ",
    text: "Сдал старый ноутбук по трейд-ин, доплатил символически за MacBook Air. Оценку дали честную, без занижения.",
    rating: 5,
    product: "MacBook Air M3",
    hue: "#8b5cf6",
  },
  {
    name: "Ольга Р.",
    initials: "ОР",
    text: "Брала PS5 в рассрочку 0%. Всё прозрачно, переплаты нет. Приставка новая, запечатанная. Спасибо MAZE!",
    rating: 5,
    product: "PlayStation 5 Slim",
    hue: "#3b82f6",
  },
  {
    name: "Никита Л.",
    initials: "НЛ",
    text: "Sony WH-1000XM5 — звук космос, шумодав отрубает метро полностью. Консультант подобрал под мои задачи.",
    rating: 5,
    product: "Sony WH-1000XM5",
    hue: "#22d3ee",
  },
  {
    name: "Екатерина П.",
    initials: "ЕП",
    text: "Заказывала Apple Watch Ultra 2 в подарок. Красивая упаковка, доставили вовремя, помогли с настройкой.",
    rating: 5,
    product: "Apple Watch Ultra 2",
    hue: "#a78bfa",
  },
];

export const FEATURES = [
  {
    icon: "truck",
    title: "Быстрая доставка",
    text: "По СПб от 500 ₽, курьером в день заказа. По России — СДЭК и Яндекс.",
  },
  {
    icon: "repeat",
    title: "Трейд-ин до 30%",
    text: "Обменяем старый гаджет на новый. Честная оценка за пару минут.",
  },
  {
    icon: "shield",
    title: "Гарантия",
    text: "Официальная гарантия до 3 лет и только оригинальная техника.",
  },
  {
    icon: "star",
    title: "Доверие",
    text: "4.9 на Яндекс.Маркете. Более 12 000 довольных клиентов.",
  },
];

/** Единственный Telegram для витрины — менеджер магазина. */
export const MAZE_TELEGRAM_URL = "https://t.me/Maze_Store78";

export const STORE = {
  phone: "+7 (995) 911-49-84",
  email: "info@maze.ru",
  city: "Санкт-Петербург",
  address: "Чайковского, 56",
  metro: "Метро Чернышевская",
  hours: "11:30 – 20:00",
  telegram: MAZE_TELEGRAM_URL,
  mapLat: 59.944,
  mapLng: 30.36,
};

export function getProduct(slug: string) {
  return products.find((p) => p.slug === slug);
}

export function relatedProducts(slug: string, n = 4) {
  const current = products.find((p) => p.slug === slug);
  return products
    .filter((p) => p.slug !== slug)
    .sort((a, b) => {
      const aMatch = a.brand === current?.brand ? 0 : 1;
      const bMatch = b.brand === current?.brand ? 0 : 1;
      return aMatch - bMatch;
    })
    .slice(0, n);
}
