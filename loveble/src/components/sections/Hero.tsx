import { ArrowRight } from "lucide-react";
import { MeshBackground } from "../MeshBackground";

export function Hero() {
  return (
    <section className="relative isolate min-h-[100svh] overflow-hidden bg-maze-navy-deep text-white">
      <MeshBackground />
      {/* grain */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.05] mix-blend-overlay"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2'/></filter><rect width='100%25' height='100%25' filter='url(%23n)'/></svg>\")",
        }}
        aria-hidden="true"
      />

      <div className="relative z-10 mx-auto flex min-h-[100svh] max-w-[1320px] flex-col px-5 pb-16 pt-28 lg:px-10 lg:pt-36">
        <div className="flex flex-1 flex-col justify-center">
          <span className="text-overline animate-fade-up text-maze-cyan-light/90">
            Tech-бутик · Санкт-Петербург
          </span>
          <h1 className="text-display-xl mt-5 max-w-4xl animate-fade-up" style={{ animationDelay: "0.1s" }}>
            Найди свой путь<br />
            <span className="bg-gradient-to-r from-maze-cyan-light via-maze-cyan to-white bg-clip-text text-transparent">
              в мире технологий
            </span>
          </h1>
          <p
            className="mt-6 max-w-xl text-base text-white/70 sm:text-lg animate-fade-up"
            style={{ animationDelay: "0.2s" }}
          >
            Apple, Samsung, Dyson, PlayStation, Marshall. Оригиналы, гарантия,
            trade-in и беспроцентная рассрочка.
          </p>

          <div
            className="mt-9 flex flex-wrap items-center gap-3 animate-fade-up"
            style={{ animationDelay: "0.3s" }}
          >
            <a
              href="#catalog"
              className="group inline-flex h-12 items-center gap-2 rounded-full bg-maze-cyan px-7 text-[15px] font-semibold text-maze-navy-deep transition hover:bg-maze-cyan-light glow-cyan"
            >
              Перейти в каталог
              <ArrowRight size={18} className="transition-transform group-hover:translate-x-0.5" />
            </a>
            <a
              href="#tradein"
              className="inline-flex h-12 items-center rounded-full border border-white/25 bg-white/5 px-7 text-[15px] font-medium text-white backdrop-blur transition hover:border-white/50 hover:bg-white/10"
            >
              Рассчитать trade-in
            </a>
          </div>
        </div>

        <div className="hidden items-center justify-between gap-6 pt-12 text-xs text-white/55 sm:flex">
          <div className="flex items-center gap-2 animate-scroll-hint">
            <span className="text-overline">Скролл</span>
            <span className="block h-px w-10 bg-white/40" />
          </div>
          <div className="flex items-center gap-8 tabular-nums">
            <span>СПб · Чайковского, 56</span>
            <span>11:30 — 20:30</span>
            <span className="text-white/80">+7 (995) 911-49-84</span>
          </div>
        </div>
      </div>
    </section>
  );
}
