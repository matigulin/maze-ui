import { Reveal } from "@/components/Reveal";
import { Icon } from "@/components/Icon";
import { FEATURES } from "@/lib/data";

export function Features() {
  return (
    <div className="container-x">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {FEATURES.map((f, i) => (
          <Reveal key={f.title} delay={i * 0.08}>
            <div className="glass group h-full rounded-3xl p-6 transition-colors duration-300 hover:border-cyan/25">
              <div className="mb-4 inline-grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-cyan/20 to-violet/20 text-cyan transition-transform duration-300 group-hover:scale-110">
                <Icon name={f.icon} size={22} />
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
