import { useEffect, useState } from "react";
import { Truck, Repeat, ShieldCheck, CreditCard, Headphones } from "lucide-react";

const ITEMS = [
  { icon: Truck, title: "Доставка по СПб от 500 ₽", desc: "В день заказа курьером MAZE" },
  { icon: Repeat, title: "Trade-in любого устройства", desc: "Сдайте старое, доплатите за новое" },
  { icon: ShieldCheck, title: "Гарантия и оригинал", desc: "Сервисная поддержка 12 месяцев" },
  { icon: CreditCard, title: "Беспроцентная рассрочка", desc: "+ комплект из 3 аксессуаров" },
  { icon: Headphones, title: "Консультация специалиста", desc: "Подберём конфигурацию под задачу" },
];

export function InfoStrip() {
  const [i, setI] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setI((v) => (v + 1) % ITEMS.length), 5000);
    return () => clearInterval(t);
  }, []);

  return (
    <section className="maze-gradient-royal relative overflow-hidden text-white">
      <div className="mx-auto flex max-w-[1320px] items-center gap-6 px-5 py-5 lg:px-10">
        <div className="relative h-12 flex-1 overflow-hidden">
          {ITEMS.map((it, idx) => {
            const Icon = it.icon;
            const active = idx === i;
            return (
              <div
                key={idx}
                className={`absolute inset-0 flex items-center gap-4 transition-all duration-700 ${
                  active ? "opacity-100 translate-y-0" : "pointer-events-none opacity-0 translate-y-3"
                }`}
              >
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-white/15">
                  <Icon size={18} />
                </span>
                <div className="min-w-0">
                  <div className="truncate text-sm font-semibold sm:text-base">{it.title}</div>
                  <div className="truncate text-xs text-white/75 sm:text-sm">{it.desc}</div>
                </div>
              </div>
            );
          })}
        </div>
        <div className="hidden gap-1.5 sm:flex">
          {ITEMS.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setI(idx)}
              aria-label={`Слайд ${idx + 1}`}
              className={`h-1 rounded-full transition-all ${
                idx === i ? "w-6 bg-white" : "w-3 bg-white/40 hover:bg-white/60"
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
