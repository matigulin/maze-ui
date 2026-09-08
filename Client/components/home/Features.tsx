import { Reveal } from "@/components/Reveal";
import { Icon } from "@/components/Icon";
import { CardIcon } from "@/shared/ui/card-icon";
import type { UiFeature } from "@/lib/site-source";

export function Features({ features }: { features: UiFeature[] }) {
  return (
    <div className="container-x">
      <div className="grid gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-4">
        {features.map((f, i) => (
          <Reveal key={f.title} delay={i * 0.06}>
            <div className="group h-full rounded-[1.75rem] bg-panel px-5 py-8 transition-colors duration-300 hover:bg-bg-warm sm:px-6">
              <CardIcon className="mb-5">
                {f.emoji ? (
                  <span className="text-xl leading-none" aria-hidden>
                    {f.emoji}
                  </span>
                ) : (
                  <Icon name={f.icon} size={22} strokeWidth={1.5} />
                )}
              </CardIcon>
              <p className="mb-2 text-[10px] uppercase tracking-[0.22em] text-faint">
                0{i + 1}
              </p>
              <h3 className="mb-2 font-display text-xl font-semibold uppercase tracking-[0.04em] text-ink">
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
