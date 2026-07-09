import { ChevronLeft, ChevronRight, Heart } from "lucide-react";

type Product = {
  brand: string;
  name: string;
  price: number;
  oldPrice?: number;
  badge?: string;
  hue: string;
};

const PRODUCTS: Product[] = [
  { brand: "Apple", name: "iPhone 16 Pro Max 256GB Titanium Black", price: 129990, oldPrice: 139990, badge: "−7%", hue: "#0a0a0a" },
  { brand: "Apple", name: "MacBook Pro 14\" M4 Pro 24GB / 1TB", price: 249990, badge: "Новинка", hue: "#1c1c1e" },
  { brand: "Dyson", name: "Airwrap Complete Long Vinca Blue", price: 64990, hue: "#1488cc" },
  { brand: "Sony", name: "PlayStation 5 Pro 2TB + DualSense", price: 89990, badge: "Хит", hue: "#000046" },
  { brand: "Samsung", name: "Galaxy S25 Ultra 512GB Titanium Gray", price: 119990, oldPrice: 129990, hue: "#2b32b2" },
  { brand: "Marshall", name: "Major V Wireless Headphones Black", price: 14990, hue: "#1a1a1a" },
  { brand: "Apple", name: "Watch Ultra 2 Black Titanium 49mm", price: 86990, hue: "#0a0a0a" },
  { brand: "Nintendo", name: "Switch 2 OLED + Mario Kart 9", price: 49990, badge: "Новинка", hue: "#008ab4" },
];

export function EditorsChoice() {
  return (
    <section id="catalog" className="bg-white py-20 lg:py-28">
      <div className="mx-auto max-w-[1320px] px-5 lg:px-10">
        <div className="mb-10 flex items-end justify-between gap-6">
          <div>
            <span className="text-overline text-maze-blue">Выбор редакции</span>
            <h2 className="text-display-lg mt-3 text-maze-black">Что берут&nbsp;сейчас</h2>
          </div>
          <div className="hidden items-center gap-2 md:flex">
            <button aria-label="Назад" className="grid h-10 w-10 place-items-center rounded-full border border-maze-gray-100 transition hover:border-maze-black">
              <ChevronLeft size={18} />
            </button>
            <button aria-label="Вперёд" className="grid h-10 w-10 place-items-center rounded-full border border-maze-gray-100 transition hover:border-maze-black">
              <ChevronRight size={18} />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-4">
          {PRODUCTS.map((p) => (
            <ProductCard key={p.name} product={p} />
          ))}
        </div>
      </div>
    </section>
  );
}

export function ProductCard({ product: p }: { product: Product }) {
  return (
    <article className="group flex flex-col">
      <div className="relative aspect-square overflow-hidden rounded-2xl bg-maze-gray-50">
        <div
          className="absolute inset-0 transition-transform duration-500 group-hover:scale-[1.04]"
          style={{
            background: `radial-gradient(circle at 30% 30%, ${p.hue}25, transparent 60%), radial-gradient(circle at 70% 75%, #1cb5e022, transparent 55%), #f5f5f7`,
          }}
        />
        <DeviceSilhouette color={p.hue} />

        {p.badge && (
          <span
            className={`absolute left-3 top-3 rounded-full px-2.5 py-1 text-[11px] font-semibold tracking-wide ${
              p.badge.startsWith("−")
                ? "bg-maze-black text-white"
                : p.badge === "Хит"
                ? "bg-maze-cyan text-maze-navy-deep"
                : "bg-white text-maze-black"
            }`}
          >
            {p.badge}
          </span>
        )}
        <button
          aria-label="В избранное"
          className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full bg-white/80 text-maze-black backdrop-blur transition hover:bg-white hover:text-maze-cyan"
        >
          <Heart size={16} />
        </button>
      </div>

      <div className="mt-4 flex flex-1 flex-col">
        <div className="text-overline text-maze-gray-600">{p.brand}</div>
        <h3 className="mt-1 line-clamp-2 text-[15px] font-medium leading-snug text-maze-black">
          {p.name}
        </h3>
        <div className="mt-3 flex items-baseline gap-2 tabular-nums">
          <span className="text-lg font-semibold text-maze-black">
            {p.price.toLocaleString("ru-RU")} ₽
          </span>
          {p.oldPrice && (
            <span className="text-sm text-maze-gray-600 line-through">
              {p.oldPrice.toLocaleString("ru-RU")} ₽
            </span>
          )}
        </div>
      </div>
    </article>
  );
}

function DeviceSilhouette({ color }: { color: string }) {
  return (
    <svg
      viewBox="0 0 200 200"
      className="absolute inset-0 m-auto h-3/5 w-3/5"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={`g-${color}`} x1="0" x2="1" y1="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.95" />
          <stop offset="100%" stopColor={color} stopOpacity="0.6" />
        </linearGradient>
      </defs>
      <rect
        x="60"
        y="20"
        width="80"
        height="160"
        rx="18"
        fill={`url(#g-${color})`}
      />
      <rect x="72" y="32" width="56" height="120" rx="6" fill="rgba(255,255,255,0.08)" />
      <circle cx="100" cy="166" r="5" fill="rgba(255,255,255,0.25)" />
    </svg>
  );
}
