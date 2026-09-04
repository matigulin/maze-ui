import { HomeHero } from "@/features/home-hero";
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
import {
  fetchHomeFeatures,
  fetchPartnerBrands,
  fetchReviews,
  fetchSiteChrome,
} from "@/lib/site-source";

export default async function Home() {
  const [hits, fresh, features, reviews, brands, { categories }] =
    await Promise.all([
      fetchEditorChoice(),
      fetchNewProducts(),
      fetchHomeFeatures(),
      fetchReviews(),
      fetchPartnerBrands(),
      fetchSiteChrome(),
    ]);

  return (
    <div className="pb-20">
      <HomeHero />

      <div className="py-5">
        <Marquee brands={brands} />
      </div>

      <section id="features" className="mt-0 scroll-mt-28">
        <Features features={features} />
      </section>

      <section className="container-x mt-28">
        <SectionHeading
          eyebrow="Directions"
          title="Выбери направление"
          subtitle="Оригинальная техника ведущих брендов — от смартфонов до звука и умного дома."
          href="/catalog"
          linkLabel="Весь каталог"
        />
        <CategoryGrid categories={categories} />
      </section>

      <section className="container-x mt-28">
        <SectionHeading
          eyebrow="Editor’s choice"
          title="Выбор редакции"
          subtitle="Техника, которую забирают чаще всего."
          href="/catalog"
        />
        <div className="grid w-full grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4 [grid-template-columns:minmax(0,1fr)_minmax(0,1fr)] lg:[grid-template-columns:repeat(4,minmax(0,1fr))]">
          {hits.map((p, i) => (
            <Reveal key={p.id} delay={(i % 4) * 0.05} className="min-w-0 max-w-full">
              <ProductCard product={p} />
            </Reveal>
          ))}
        </div>
      </section>

      <section className="mt-28">
        <div className="container-x">
          <Promo />
        </div>
      </section>

      {fresh.length > 0 && (
        <section className="container-x mt-28">
          <SectionHeading
            eyebrow="New arrivals"
            title="Новинки"
            href="/catalog"
          />
          <div className="grid w-full grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4 [grid-template-columns:minmax(0,1fr)_minmax(0,1fr)] lg:[grid-template-columns:repeat(4,minmax(0,1fr))]">
            {fresh.map((p, i) => (
              <Reveal key={p.id} delay={(i % 4) * 0.05} className="min-w-0 max-w-full">
                <ProductCard product={p} />
              </Reveal>
            ))}
          </div>
        </section>
      )}

      <section id="reviews" className="container-x mt-28 scroll-mt-28">
        <Testimonials reviews={reviews} />
      </section>
    </div>
  );
}
