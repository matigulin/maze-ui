import { Reveal } from "@/components/Reveal";
import { Icon } from "@/components/Icon";
import type { UiFeature } from "@/lib/site-source";

export function Features({ features }: { features: UiFeature[] }) {
  return (
    <div className="container-x">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {features.map((f, i) => (
          <Reveal key={f.title} delay={i * 0.08}>
            <div className="glass group h-full rounded-3xl p-6 transition-colors duration-300 hover:border-bg-warm/35">
              <div className="mb-4 inline-grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-accent/20 to-bg-warm/30 text-accent transition-transform duration-300 group-hover:scale-110">
                {f.emoji ? (
                  <span className="text-2xl" aria-hidden>
                    {f.emoji}
                  </span>
                ) : (
                  <Icon name={f.icon} size={22} />
                )}
              </div>
              <h3 className="mb-1.5 font-display text-base font-semibold text-ink">
                {f.title}
              </h3>
              <p className="text-sm leading-relaxed text-muted">{f.text}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </div>
  );
}
