import { Hero } from "@/components/home/Hero";
import { Marquee } from "@/components/home/Marquee";
import { Features } from "@/components/home/Features";
import { CategoryGrid } from "@/components/home/CategoryGrid";
import { Testimonials } from "@/components/home/Testimonials";
import { Promo } from "@/components/home/Promo";
import { SectionHeading } from "@/components/SectionHeading";
import { ProductCard } from "@/components/ProductCard";
import { Reveal } from "@/components/Reveal";
import {
  fetchEditorChoice,
  fetchNewProducts,
} from "@/lib/catalog-source";

export default async function Home() {
  const hits = await fetchEditorChoice();
  const fresh = await fetchNewProducts();

  return (
    <div className="pb-8">
      <Hero />

      <div className="my-6">
        <Marquee />
      </div>

      <section className="container-x mt-20">
        <Features />
      </section>

      <section className="container-x mt-24">
        <SectionHeading
          eyebrow="Каталог MAZE"
          title="Выбери направление"
          subtitle="Оригинальная техника ведущих брендов — от смартфонов до звука и умного дома."
          href="/catalog"
          linkLabel="Весь каталог"
        />
        <CategoryGrid />
      </section>

      <section className="container-x mt-24">
        <SectionHeading
          eyebrow="Хиты продаж"
          title="Выбор редакции"
          subtitle="Техника, которую забирают чаще всего."
          href="/catalog"
        />
        <div className="grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-4">
          {hits.map((p, i) => (
            <Reveal key={p.id} delay={(i % 4) * 0.06}>
              <ProductCard product={p} />
            </Reveal>
          ))}
        </div>
      </section>

      <section className="container-x mt-24">
        <Promo />
      </section>

      {fresh.length > 0 && (
        <section className="container-x mt-24">
          <SectionHeading
            eyebrow="Только приехали"
            title="Новинки"
            href="/catalog"
          />
          <div className="grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-4">
            {fresh.map((p, i) => (
              <Reveal key={p.id} delay={(i % 4) * 0.06}>
                <ProductCard product={p} />
              </Reveal>
            ))}
          </div>
        </section>
      )}

      <section className="container-x mt-24">
        <Testimonials />
      </section>
    </div>
  );
}
