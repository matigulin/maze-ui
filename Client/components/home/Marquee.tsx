export function Marquee({ brands }: { brands: string[] }) {
  const row = [...brands, ...brands];
  return (
    <div className="edge-fade relative overflow-hidden border-y border-line py-6">
      <div className="flex w-max animate-marquee items-center gap-14 pr-14">
        {row.map((b, i) => (
          <span
            key={i}
            className="font-display text-xl font-semibold tracking-[0.2em] text-faint transition-colors hover:text-accent sm:text-2xl"
          >
            {b}
          </span>
        ))}
      </div>
    </div>
  );
}
