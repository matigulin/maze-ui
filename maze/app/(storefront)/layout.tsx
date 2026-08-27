import { Suspense } from "react";
import { Background } from "@/components/Background";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { StorefrontModals } from "@/components/StorefrontModals";
import { ScrollToTop } from "@/components/ScrollToTop";
import { RouteScrollReset } from "@/shared/ui/route-scroll-reset";

export default function StorefrontLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Background />
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
      <StorefrontModals />
      <Suspense fallback={null}>
        <RouteScrollReset />
      </Suspense>
      {/* fixed «Наверх» — вне overflow-контейнеров */}
      <ScrollToTop />
    </>
  );
}
