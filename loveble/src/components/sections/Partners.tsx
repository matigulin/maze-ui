const BRANDS = ["Apple", "Samsung", "Dyson", "Sony", "Marshall", "Harman/Kardon", "Nintendo", "PlayStation"];

export function Partners() {
  return (
    <section className="border-y border-white/5 bg-maze-black py-14 text-white">
      <div className="mx-auto max-w-[1320px] px-5 lg:px-10">
        <div className="mb-8 flex items-center justify-between gap-4">
          <span className="text-overline text-white/50">Официальные партнёры</span>
          <span className="hidden text-xs text-white/40 sm:block">Только оригинальная техника</span>
        </div>
        <div className="grid grid-cols-2 gap-x-6 gap-y-6 sm:grid-cols-4 lg:grid-cols-8">
          {BRANDS.map((b) => (
            <div
              key={b}
              className="flex h-10 items-center justify-center font-display text-base font-semibold tracking-wide text-white/40 transition hover:text-white sm:text-lg"
            >
              {b}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
