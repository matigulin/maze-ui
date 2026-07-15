import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { ProductDetail } from "@/components/product/ProductDetail";
import { ProductCard } from "@/components/ProductCard";
import { SectionHeading } from "@/components/SectionHeading";
import { Reveal } from "@/components/Reveal";
import {
  fetchProductBySlug,
  fetchRelatedProducts,
} from "@/lib/catalog-source";

export const dynamic = "force-dynamic";

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await fetchProductBySlug(slug);
  if (!product) notFound();

  const related = await fetchRelatedProducts(slug, 4);

  return (
    <div className="container-x py-6 md:py-12">
      <nav className="mb-6 flex items-center gap-1.5 overflow-hidden text-sm text-faint md:mb-8">
        <Link href="/" className="shrink-0 transition-colors hover:text-ink">
          Главная
        </Link>
        <ChevronRight size={14} className="shrink-0" />
        <Link href="/catalog" className="shrink-0 transition-colors hover:text-ink">
          Каталог
        </Link>
        <ChevronRight size={14} className="shrink-0" />
        <span className="truncate text-muted">{product.name}</span>
      </nav>

      <ProductDetail product={product} />

      <section className="mt-24">
        <SectionHeading
          eyebrow="Вам подойдёт"
          title="Похожие товары"
          href="/catalog"
        />
        <div className="grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-4">
          {related.map((p, i) => (
            <Reveal key={p.id} delay={(i % 4) * 0.06}>
              <ProductCard product={p} />
            </Reveal>
          ))}
        </div>
      </section>
    </div>
  );
}
